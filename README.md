# 🇳🇵 Committers Nepal

**Automated ranking system for the most active GitHub users from Nepal**

A modern Node.js application that tracks and ranks GitHub contributors from Nepal, featuring a beautiful static website with real-time rankings and shareable badges.

## ✨ Features

- 🔄 **Automatic Updates**: Runs every 2 days via GitHub Actions
- 📊 **Beautiful Dashboard**: Modern, responsive website with dark/light mode
- 🏆 **Rankings**: Sort by commits, contributions, or followers
- 🔍 **Search**: Find users by username or name
- 🎖️ **Badges**: Shields.io-compatible badges for every user
- 📱 **Responsive**: Works perfectly on all devices

## 🚀 Live Website

Visit [https://birajrai.github.io/committers-nepal](https://birajrai.github.io/committers-nepal) to see the rankings!

## 🎖️ Get Your Badge

Add your Nepal rank badge to your GitHub profile:

```markdown
![Nepal Rank](https://img.shields.io/endpoint?url=https://birajrai.github.io/committers-nepal/badges/YOUR_USERNAME.json)
```

## 🛠️ Tech Stack

- **Language**: Node.js 18+ (ESM)
- **API**: GitHub GraphQL API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions

## 📋 Requirements

- Node.js 18 or higher
- GitHub Personal Access Token with `read:user` permission

## 💻 Local Development

1. **Clone the repository**
```bash
git clone https://github.com/birajrai/committers-nepal.git
cd committers-nepal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set your GitHub token**
```bash
export GITHUB_TOKEN="your_github_token_here"
```

4. **Generate rankings**
```bash
npm run generate
```

5. **View the website**
Open `index.html` in your browser or use a local server:
```bash
npx http-server -p 8080
```

## 🔧 Configuration

### Locations Tracked

The system searches for users with these locations in their GitHub profile:
- Nepal
- Kathmandu
- Pokhara
- Lalitpur
- Bhaktapur

To add more locations, edit `LOCATIONS` in `src/generate.js`.

### Minimum Followers

Users must have at least **20 followers** to appear in rankings (GitHub API limitation).

### Update Frequency

The GitHub Action runs every 2 days. You can also trigger it manually:
1. Go to Actions tab
2. Select "Update Rankings"
3. Click "Run workflow"

## 📁 Output Files

The system generates the following static files:

```
data/
  ├── rankings.json       # Complete rankings
  ├── users/
  │   └── {username}.json # Per-user data
  └── metadata.json       # Generation info

badges/
  └── {username}.json     # Shields.io badge data
```

## 🔄 GitHub Actions Setup

1. **Enable GitHub Pages**
   - Settings → Pages → Source: `gh-pages` branch

2. **Set Workflow Permissions**
   - Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"

3. **The workflow will automatically**:
   - Fetch latest user data from GitHub
   - Generate rankings and badges
   - Publish to GitHub Pages

## 🎯 Ranking Algorithm

Users are ranked by:
1. **Primary**: Total commits (descending)
2. **Secondary**: All contributions (descending)
3. **Tie-breaker**: Followers (descending)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- **Add locations**: Edit `src/generate.js` to include more Nepal cities
- **Improve design**: Enhance the frontend in `index.html`, `styles.css`, `app.js`
- **Fix bugs**: Report issues or submit pull requests
- **Suggest features**: Open an issue with your ideas

## 📊 Data Collection

We collect the following public data from GitHub:
- Username and display name
- Avatar URL
- Follower count
- Commit count (public repositories)
- Contributions (public and total)
- Organizations

All data is public and available through GitHub's API.

## ❓ FAQ

### Why am I not on the list?

1. **Follower count**: You need at least 20 followers
2. **Location**: Your GitHub location must include Nepal or a major city
3. **Recent activity**: Make sure you have recent contributions

### How do I update my ranking?

Your ranking updates automatically every 2 days. Just keep contributing to GitHub!

### Can I add my city?

Yes! Edit `src/generate.js` and submit a pull request.

### How accurate are the stats?

Stats are fetched directly from GitHub's API and reflect public data available at generation time.

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- GitHub GraphQL API for providing the data
- Shields.io for badge rendering
- The amazing Nepal developer community!
