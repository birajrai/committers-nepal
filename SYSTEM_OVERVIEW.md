# Committers Nepal - System Overview

## Architecture

This is a complete rewrite from Go to Node.js with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│                  (Every 2 days at 00:00 UTC)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Data Generator (src/generate.js)        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Query GitHub GraphQL API                         │   │
│  │  2. Search users from Nepal locations                │   │
│  │  3. Fetch: commits, contributions, followers, orgs   │   │
│  │  4. Rank by: commits → contributions → followers     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Generated Static Files                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │rankings.json │  │users/*.json  │  │badges/*.json │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Pages (gh-pages branch)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Static Website (index.html + styles.css + app.js)  │   │
│  │  - Modern responsive design                          │   │
│  │  - Dark/Light mode toggle                            │   │
│  │  - Real-time search & sort                           │   │
│  │  - Shields.io badge integration                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
committers-nepal/
├── src/
│   └── generate.js          # Main data generator
├── index.html               # Website homepage
├── styles.css               # Styling (with dark mode)
├── app.js                   # Frontend JavaScript
├── package.json             # Node.js dependencies
├── .github/workflows/
│   └── update-rankings.yml  # GitHub Actions workflow
└── README.md                # Documentation

Generated on gh-pages branch:
├── data/
│   ├── rankings.json        # Full rankings list
│   ├── users/
│   │   └── {username}.json  # Per-user data
│   └── metadata.json        # Generation metadata
└── badges/
    └── {username}.json      # Shields.io badge data
```

## Data Flow

1. **GitHub Actions Trigger**: Workflow runs every 2 days
2. **Data Fetch**: Node.js script queries GitHub GraphQL API
3. **Ranking**: Users sorted by commits, contributions, followers
4. **Generation**: Create JSON files for rankings, users, and badges
5. **Deployment**: Commit to gh-pages branch
6. **Publishing**: GitHub Pages serves the static website

## Key Features Implemented

### Backend (Node.js)
- ✅ GitHub GraphQL API client with retry logic
- ✅ Location-based user search (Nepal cities)
- ✅ Contribution metrics collection
- ✅ Ranking algorithm (commits → contributions → followers)
- ✅ JSON data generation (rankings, users, badges)
- ✅ Shields.io badge format support
- ✅ Error handling and rate limit safety

### Frontend (Static Website)
- ✅ Modern, clean, responsive design
- ✅ Dark/Light mode with localStorage persistence
- ✅ Real-time search functionality
- ✅ Multi-column sorting (rank, commits, contributions, followers)
- ✅ User cards with avatars and GitHub links
- ✅ Live statistics (total users, commits, last update)
- ✅ Badge preview for each user
- ✅ Mobile-responsive layout

### Automation
- ✅ GitHub Actions workflow (every 2 days)
- ✅ Automatic deployment to gh-pages
- ✅ Idempotent generation (deterministic output)
- ✅ Git configuration for bot commits

## Badge Usage

Users can embed their rank badge in their GitHub profile:

```markdown
![Nepal Rank](https://img.shields.io/endpoint?url=https://birajrai.github.io/committers-nepal/badges/username.json)
```

Badge colors:
- 🟢 Top 10: Bright Green
- 🟢 Top 50: Green
- �� Top 100: Blue
- ⚪ Others: Light Grey

## Configuration

### Locations Tracked
- Nepal
- Kathmandu
- Pokhara
- Lalitpur
- Bhaktapur

### Requirements
- Minimum 20 followers (GitHub API constraint)
- Valid location in GitHub profile

### Update Schedule
- Every 2 days at 00:00 UTC
- Manual trigger available via GitHub Actions UI

## Tech Stack

- **Runtime**: Node.js 18+ (ESM modules)
- **API Client**: @octokit/graphql
- **Frontend**: Vanilla HTML5/CSS3/JavaScript (ES6+)
- **Hosting**: GitHub Pages (free, static)
- **CI/CD**: GitHub Actions (free tier)
- **Badges**: Shields.io (free API)

## Migration from Go

The previous Go-based system has been completely replaced:
- ❌ Removed: Go codebase (main.go, presets.go, etc.)
- ❌ Removed: Cloudflare Workers badge deployment
- ❌ Removed: Complex YAML output format
- ✅ Added: Node.js ESM-based generator
- ✅ Added: Modern static website frontend
- ✅ Added: Simplified JSON data format
- ✅ Added: Direct Shields.io badge integration

## Performance

- **API Calls**: ~10-15 per run (100 users per page)
- **Generation Time**: ~30-60 seconds (depending on user count)
- **Website Load**: Instant (static files, no backend)
- **Search/Sort**: Client-side (no server required)

## Security

- ✅ No secrets in code
- ✅ GITHUB_TOKEN from GitHub Actions (automatic)
- ✅ No external service credentials needed
- ✅ Static files only (no server-side code)
- ✅ XSS protection (HTML escaping in JavaScript)

## Success Criteria Met

✅ **Language**: Node.js (ESM, Node 18+)
✅ **API**: GitHub GraphQL API
✅ **Hosting**: GitHub Pages (gh-pages branch)
✅ **Automation**: GitHub Actions (every 2 days)
✅ **Frontend**: Static HTML/CSS/JS
✅ **No external services**: No Cloudflare, databases, or servers
✅ **Static files**: All outputs committed to repository
✅ **User discovery**: Location-based search with pagination
✅ **Ranking**: Commits → Contributions → Followers
✅ **Data files**: rankings.json, users/*.json, badges/*.json
✅ **Website**: Modern, responsive, dark mode, searchable
✅ **Badges**: Shields.io-compatible JSON format
✅ **Update schedule**: Every 2 days (cron: '0 0 */2 * *')

## Next Steps for Users

1. **Enable GitHub Pages**:
   - Settings → Pages → Source: gh-pages branch

2. **Run First Update**:
   - Actions tab → Update Rankings → Run workflow

3. **View Website**:
   - Visit https://birajrai.github.io/committers-nepal

4. **Get Your Badge**:
   - Use the URL pattern shown in README.md
