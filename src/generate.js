import { graphql } from '@octokit/graphql';
import fs from 'fs/promises';
import path from 'path';

const LOCATIONS = ['Nepal'];
const MIN_FOLLOWERS = 0;
const MAX_USERS_TO_FETCH = 1000;

const GRAPHQL_QUERY = `
  query($searchQuery: String!, $cursor: String) {
    search(type: USER, query: $searchQuery, first: 100, after: $cursor) {
      userCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on User {
            login
            name
            avatarUrl
            followers {
              totalCount
            }
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
              totalCommitContributions
              restrictedContributionsCount
            }
            organizations(first: 10) {
              nodes {
                login
              }
            }
          }
        }
      }
    }
  }
`;

class GitHubClient {
  constructor(token) {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async searchUsers() {
    const users = [];
    const userSet = new Set();
    
    // Build location query
    const locationQuery = LOCATIONS.map(loc => `location:"${loc}"`).join(' OR ');
    const searchQuery = MIN_FOLLOWERS > 0 
      ? `type:user followers:>=${MIN_FOLLOWERS} ${locationQuery}`
      : `type:user ${locationQuery}`;
    
    console.log('Searching for users with query:', searchQuery);
    
    let hasNextPage = true;
    let cursor = null;
    let fetchedCount = 0;

    while (hasNextPage && fetchedCount < MAX_USERS_TO_FETCH) {
      try {
        const result = await this.graphqlWithAuth(GRAPHQL_QUERY, {
          searchQuery,
          cursor,
        });

        const edges = result.search.edges || [];
        
        for (const edge of edges) {
          const user = edge.node;
          
          // Deduplicate users
          if (userSet.has(user.login)) {
            continue;
          }
          userSet.add(user.login);

          const contributions = user.contributionsCollection;
          const publicContributions = contributions.contributionCalendar.totalContributions;
          const privateContributions = contributions.restrictedContributionsCount;
          
          users.push({
            username: user.login,
            name: user.name || user.login,
            avatarUrl: user.avatarUrl,
            followers: user.followers.totalCount,
            commits: contributions.totalCommitContributions,
            publicContributions: publicContributions - privateContributions,
            allContributions: publicContributions,
            organizations: user.organizations.nodes.map(org => org.login),
          });
        }

        fetchedCount += edges.length;
        hasNextPage = result.search.pageInfo.hasNextPage;
        cursor = result.search.pageInfo.endCursor;

        console.log(`Fetched ${fetchedCount} users so far...`);

        // Rate limit safety: wait between requests
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.retryCount = 0; // Reset on success
      } catch (error) {
        this.retryCount++;
        console.error(`Error fetching users (attempt ${this.retryCount}/${this.maxRetries}):`, error.message);
        
        if (this.retryCount >= this.maxRetries) {
          throw new Error(`Failed after ${this.maxRetries} retries: ${error.message}`);
        }
        
        // Exponential backoff
        const waitTime = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.log(`Total unique users found: ${users.length}`);
    return users;
  }
}

function rankUsers(users) {
  // Sort by: commits DESC, allContributions DESC, followers DESC
  const ranked = [...users].sort((a, b) => {
    if (b.commits !== a.commits) return b.commits - a.commits;
    if (b.allContributions !== a.allContributions) return b.allContributions - a.allContributions;
    return b.followers - a.followers;
  });

  // Assign ranks
  return ranked.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
}

async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function generateOutputFiles(rankedUsers) {
  const dataDir = path.join(process.cwd(), 'data');
  const usersDir = path.join(dataDir, 'users');
  const badgesDir = path.join(process.cwd(), 'badges');

  // Ensure directories exist
  await ensureDirectory(dataDir);
  await ensureDirectory(usersDir);
  await ensureDirectory(badgesDir);

  console.log('Generating output files...');

  // Generate rankings.json
  const rankings = rankedUsers.map(user => ({
    rank: user.rank,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    commits: user.commits,
    publicContributions: user.publicContributions,
    allContributions: user.allContributions,
    followers: user.followers,
  }));

  await fs.writeFile(
    path.join(dataDir, 'rankings.json'),
    JSON.stringify(rankings, null, 2)
  );
  console.log('✓ Generated data/rankings.json');

  // Generate per-user files
  for (const user of rankedUsers) {
    // User data file
    const userData = {
      rank: user.rank,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      commits: user.commits,
      publicContributions: user.publicContributions,
      allContributions: user.allContributions,
      followers: user.followers,
      organizations: user.organizations,
    };

    await fs.writeFile(
      path.join(usersDir, `${user.username}.json`),
      JSON.stringify(userData, null, 2)
    );

    // Badge file (Shields.io endpoint schema)
    const badgeData = {
      schemaVersion: 1,
      label: 'Nepal Rank',
      message: `#${user.rank}`,
      color: user.rank <= 10 ? 'brightgreen' : user.rank <= 50 ? 'green' : user.rank <= 100 ? 'blue' : 'lightgrey',
    };

    await fs.writeFile(
      path.join(badgesDir, `${user.username}.json`),
      JSON.stringify(badgeData, null, 2)
    );
  }

  console.log(`✓ Generated ${rankedUsers.length} user data files`);
  console.log(`✓ Generated ${rankedUsers.length} badge files`);

  // Generate metadata
  const metadata = {
    generatedAt: new Date().toISOString(),
    totalUsers: rankedUsers.length,
    locations: LOCATIONS,
    minFollowers: MIN_FOLLOWERS,
  };

  await fs.writeFile(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log('✓ Generated data/metadata.json');
}

async function main() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('Starting GitHub user ranking generation...\n');

  try {
    // Fetch users
    const client = new GitHubClient(token);
    const users = await client.searchUsers();

    if (users.length === 0) {
      console.log('No users found matching criteria');
      return;
    }

    // Rank users
    const rankedUsers = rankUsers(users);
    console.log(`\nTop 5 users:`);
    rankedUsers.slice(0, 5).forEach(user => {
      console.log(`  #${user.rank}: ${user.username} (${user.commits} commits)`);
    });

    // Generate output files
    console.log();
    await generateOutputFiles(rankedUsers);

    console.log('\n✅ Generation complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
