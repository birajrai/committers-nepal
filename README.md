# Most Active GitHub Users Counter from Nepal

This CLI tool queries the GitHub GraphQL API for users from Nepal and ranks them according to number of contributions.

**GitHub Token**

In order to make requests against the GitHub API one needs an access token, which can be created [here](https://github.com/settings/tokens). The token needs `read:org` and `read:user` permissions.

**Example usage (dev environment):**

```
go run . \
   --token paste-your-token-here \
   --amount 500 \
   --consider 1000 \
   --output csv \
   --file ./output.csv
```

## GitHub Actions setup

-   Enable workflow permissions: Settings → Actions → General → Workflow permissions → set to "Read and write" for the repository (needed to push to `gh-pages`).
-   Secrets required:
    -   `GITHUB_TOKEN`: provided automatically by GitHub; no action needed unless you want to override with a PAT for higher limits.
    -   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`: only needed for the badge deploy workflow (`.github/workflows/deploy_badges.yml`).
-   Daily update workflow: `.github/workflows/daily_update.yml` runs hourly at `HH:45` or can be triggered manually via "Run workflow". It fetches latest Nepal rankings and publishes to `gh-pages`.

## Cloudflare + badge deploy setup

-   Create a Cloudflare API token (My Profile → API Tokens → Create Custom Token) with the minimal permissions:
    -   Account → Workers Scripts: Edit
    -   (optional) Account → Workers KV Storage: Edit if you later add KV
-   Copy your Cloudflare **Account ID** from the Cloudflare dashboard (left sidebar → Workers & Pages → right-side info card).
-   Add repository secrets:
    -   `CLOUDFLARE_API_TOKEN`: the token above
    -   `CLOUDFLARE_ACCOUNT_ID`: the account ID above
-   Badge deploy workflow: `.github/workflows/deploy_badges.yml` runs daily at `00:00 UTC` or can be triggered via "Run workflow". It packages badge data and uploads two Workers (`user-badge`, `org-badge`) using `badges/deploy`.
-   If you use a custom base URL, change the argument in `badges/deploy` (currently `https://committers.top`).

## Contribution

Contributions are accepted. Please report issues or make pull requests against either `master` or [branch for the website](https://github.com/birajrai/committers-nepal/tree/gh-pages) as appropriate.

_Please use the provided precommit hooks and run `go fmt`, `go vet` and `go lint` liberally._

### Contributing

Contributions are welcome! Since this project is focused exclusively on Nepal, any updates to the list of cities/locations in Nepal should be made in `presets.go`.

## FAQ

### Why am I not on this list?

This could be due to a number of things.

1. Firstly, GitHub API doesn't allow sorting by contributions, so instead it is first sorted by number of followers to get a larger list, which is then sorted by contributions. You need at least 20 followers to appear on this list. Each page shows the minimum follower threshold used for that run.

2. You live in a city which is not included in the query. Unfortunately the query is free-text and not strictly geographical. Rural areas may be excluded from the list, but you can often remedy this by adding the country name to your location in GitHub.

3. You have mostly private commits. These are included too, but they are not listed on the main country page anymore. Instead you will find a subpage with a list that also has private contributions included. This arrangement is done to favor open source contributions over private contributions.

### Why is my contribution count not the same as on my GitHub profile?

Depending on your settings, your GitHub profile displays either only your public contributions or both your public and private ones. commits.top by default shows only public contributions, but public+private count is accessible on a subpage on each region page. You can use the [GitHub API GraphQL Explorer](https://developer.github.com/v4/explorer/) and run the following query to see what the API returns for your user:

```
query {
  viewer {
    login
    contributionsCollection {
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
      }
    }
  }
}
```
