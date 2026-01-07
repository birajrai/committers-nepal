# Codebase Explanation: Committers Nepal

## Overview

This is a Go-based CLI tool and automated system that **ranks and tracks the most active GitHub users from Nepal** based on their contribution activity. The project queries GitHub's GraphQL API to identify developers from Nepal, ranks them by various contribution metrics, and publishes the results to a GitHub Pages website.

## Purpose

The primary purpose is to:
1. Identify and celebrate active GitHub contributors from Nepal
2. Provide visibility to the Nepal developer community
3. Track contribution statistics over time
4. Generate rankings by different metrics (commits, public contributions, total contributions)

## Core Components

### 1. **Main Entry Point (`main.go`)**
- **What it does**: Command-line interface for querying GitHub users
- **Key features**:
  - Accepts GitHub token for authentication
  - Configurable parameters (amount of users, output format)
  - Hardcoded to use "Nepal" preset for location filtering
  - Outputs results to file or stdout in multiple formats (plain, CSV, YAML)

**Example usage:**
```bash
go run . --token <github-token> --amount 500 --consider 1000 --output csv --file ./output.csv
```

### 2. **Location Configuration (`presets.go`)**
- **What it does**: Defines the geographic filters for finding Nepal-based users
- **Nepal preset includes**:
  - Country: "nepal"
  - Major cities: "kathmandu", "pokhara", "lalitpur", "bharatpur", "birgunj", "biratnagar", "janakpur", "ghorahi"
- **Purpose**: GitHub's location field is free-text, so this covers common variations of how Nepal developers might list their location

### 3. **GitHub API Integration (`github/github.go`)**
- **What it does**: Communicates with GitHub's GraphQL API to fetch user data
- **Key functionality**:
  - Searches for users with minimum 20 followers (GitHub API limitation workaround)
  - Fetches comprehensive user data:
    - Login, avatar, name, company
    - Organizations membership
    - Follower count
    - Contribution statistics (public, private, commits, PRs)
  - Implements retry logic with exponential backoff for API errors
  - Handles pagination to fetch large result sets (up to 1000 users per query)

**Search strategy**: 
- First sorts by followers (GitHub API limitation - can't directly sort by contributions)
- Then ranks by actual contribution count
- Requires minimum 20 followers to appear

### 4. **Ranking Logic (`top/top.go`)**
- **What it does**: Orchestrates the user search and filtering
- **Process**:
  1. Constructs GraphQL query with location filters
  2. Fetches users from GitHub API
  3. Returns raw results for further processing

### 5. **Output Formatting (`output/output.go`)**
- **What it does**: Transforms GitHub data into various output formats
- **Three formats supported**:
  
  **a) Plain Text**: Simple human-readable list
  - Shows user rankings with name, login, contribution count, company, organizations
  - Includes top 10 organizations by member count
  
  **b) CSV**: Spreadsheet-compatible format
  - Columns: rank, name, login, contributions, company, organizations
  
  **c) YAML**: Structured data for website generation
  - Three separate rankings:
    - `users`: Sorted by total commits
    - `users_public_contributions`: Sorted by public contributions only
    - `private_users`: Sorted by total contributions (public + private)
  - Top 10 organizations for each category
  - Metadata: generation timestamp, minimum followers required, total user count

### 6. **HTTP Utilities (`net/net.go`)**
- **What it does**: Provides HTTP wrapper functionality
- **Key feature**: Token-based authentication wrapper for GitHub API requests
- **Pattern**: Uses functional composition to add authentication headers

## Automation System

### 1. **Daily Update Workflow (`.github/workflows/daily_update.yml`)**
- **Trigger**: Runs hourly at minute 45 (e.g., 1:45, 2:45, 3:45...) or manually
- **Process**:
  1. Checks out the repository
  2. Builds the Go binary
  3. Switches to `gh-pages` branch
  4. Generates markdown stub files for website pages
  5. Runs the tool to fetch latest Nepal rankings
  6. Saves data to `_data/locations/nepal.yml`
  7. Commits and pushes to `gh-pages` (which hosts the website)

**Data files generated**:
- `nepal.md`: Commits-based ranking page
- `nepal_private.md`: All contributions ranking page
- `nepal_public.md`: Public contributions ranking page
- `rank_only/nepal.json`: JSON ranking data

### 2. **Badge Deployment Workflow (`.github/workflows/deploy_badges.yml`)**
- **Trigger**: Daily at 00:00 UTC or manually
- **Purpose**: Deploys Cloudflare Workers that serve dynamic badge data
- **Implementation**:
  - Creates two workers: `user-badge` and `org-badge`
  - Embeds ranking data directly in the worker scripts
  - Uses Shields.io service to render actual badges
  - Deployed to `user-badge.committers.top` and `org-badge.committers.top`

### 3. **Go Build Workflow (`.github/workflows/go.yml`)**
- Standard Go CI pipeline: build and test

## Data Flow

```
1. GitHub Actions Trigger (hourly)
   ↓
2. Build Go binary
   ↓
3. Query GitHub GraphQL API
   - Search: users from Nepal with 20+ followers
   - Fetch: contributions, commits, organizations
   ↓
4. Process & Rank
   - Sort by commits/contributions
   - Identify top organizations
   ↓
5. Generate YAML output
   - Multiple ranking lists
   - Organization statistics
   ↓
6. Commit to gh-pages branch
   ↓
7. GitHub Pages publishes website
   ↓
8. Cloudflare Workers update badges
```

## Key Technical Decisions

### 1. **Minimum Follower Count (20)**
- **Why**: GitHub API doesn't allow sorting directly by contributions
- **Workaround**: First sort by followers, then sort results by contributions
- **Trade-off**: Users with fewer than 20 followers won't appear

### 2. **Multiple Contribution Metrics**
- **Total contributions**: Includes public + private
- **Public contributions**: Open source work only
- **Commits**: Focuses on commit activity specifically
- **Rationale**: Provides different perspectives on developer activity

### 3. **Free-text Location Matching**
- **Why**: GitHub location is user-entered text, not structured data
- **Solution**: Include multiple city names and country variations
- **Limitation**: Rural areas or uncommon location spellings may be missed

### 4. **GraphQL vs REST API**
- **Choice**: Uses GraphQL for user search
- **Benefit**: Single query fetches all needed data (contributions, orgs, followers)
- **Efficiency**: Reduces API calls and rate limiting issues

### 5. **Static Site Generation**
- **Architecture**: Generates YAML data consumed by Jekyll on GitHub Pages
- **Benefit**: Fast, free hosting with automatic updates
- **Data storage**: All ranking data stored as YAML files in version control

## Directory Structure

```
committers-nepal/
├── main.go                    # CLI entry point
├── presets.go                 # Nepal location definitions
├── github/
│   └── github.go              # GitHub API client
├── top/
│   └── top.go                 # Ranking orchestration
├── output/
│   └── output.go              # Output formatters
├── net/
│   └── net.go                 # HTTP utilities
├── badges/
│   ├── cloudflare_worker.js   # Badge service worker
│   ├── deploy                 # Badge deployment script
│   └── README.md              # Badge setup docs
└── .github/workflows/
    ├── daily_update.yml       # Main data update workflow
    ├── deploy_badges.yml      # Badge deployment workflow
    └── go.yml                 # Go build/test workflow
```

## How to Contribute

1. **Add new Nepal cities**: Edit `presets.go` to include more location variations
2. **Improve ranking algorithms**: Modify sorting logic in `output/output.go`
3. **Add new output formats**: Implement new Format functions in `output/output.go`
4. **Enhance error handling**: Add better retry logic in `github/github.go`

## Configuration Requirements

### Local Development
- Go 1.17+
- GitHub Personal Access Token with `read:org` and `read:user` permissions

### GitHub Actions
- Repository Settings → Actions → Workflow permissions → "Read and write"
- `GITHUB_TOKEN`: Automatically provided by GitHub
- `CLOUDFLARE_API_TOKEN`: Required for badge deployment (optional)
- `CLOUDFLARE_ACCOUNT_ID`: Required for badge deployment (optional)

## Limitations & Considerations

1. **Follower requirement**: Only users with 20+ followers are included
2. **API rate limits**: GitHub GraphQL API has rate limiting (handled with retries)
3. **Location accuracy**: Depends on users correctly setting their GitHub location
4. **Private contributions**: Only visible if user's profile shows them
5. **Update frequency**: Data refreshes hourly (configurable in workflow)

## Output Examples

### Plain Text Output
```
USERS
--------
#1: Biraj Rai (birajrai):5234 (Company Name) org1,org2

ORGANIZATIONS
--------
#1: organization-name (15)
```

### YAML Output
```yaml
users:
  - rank: 1
    name: "Biraj Rai"
    login: "birajrai"
    avatarUrl: https://...
    contributions: 5234
    company: "Company"
    organizations: "org1,org2"
```

## Summary

This project is a **community visibility tool** that automatically discovers, ranks, and showcases active GitHub developers from Nepal. It uses GitHub's GraphQL API to gather comprehensive contribution data, processes it through multiple ranking algorithms, and publishes the results as both a website (via GitHub Pages) and dynamic badges (via Cloudflare Workers). The system runs entirely automated through GitHub Actions, updating hourly to reflect the latest activity from Nepal's developer community.
