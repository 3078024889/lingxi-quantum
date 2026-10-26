# Real-data GitHub refresh operations
Official API: https://docs.github.com/en/rest/repos/repos#get-a-repository
Current coverage: a deliberately small, named registry of public GitHub repositories. Stars and forks are repository metrics, NOT product users, installs, quality or market share.
Manual refresh: `node scripts/ai-discovery/refresh-github.mjs` in the repository root with Node 22+. Optional `GITHUB_TOKEN` improves rate-limit allowance. Do not use a personal token in frontend code or committed files.
The script validates the repository identity, official URL, integer counts and archive status; requests are serial, have 15s timeouts, and a failed request preserves the previous snapshot.
Every refresh creates a new timestamp. Review diffs and GitHub API source before committing. It does not push or deploy automatically.
Rate limiting: official GitHub recommendations include authenticated conditional GET requests with ETag, obeying retry-after, and avoiding concurrent polling. This first implementation uses low-frequency manual runs and serial requests; conditional caching is a follow-up enhancement.
Data is not licensed for unrestricted republication of third-party product descriptions. Do not copy directory descriptions or commercial datasets without reviewing licensing.
