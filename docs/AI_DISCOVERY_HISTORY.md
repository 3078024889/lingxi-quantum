# AI discovery history and manual automation
Workflow: `.github/workflows/ai-discovery-refresh.yml` (workflow_dispatch only). It is intentionally read-only, uploads reviewed artifacts, and does NOT commit, merge, deploy, or activate a schedule.
The GitHub Actions UI may require the workflow to exist on the default branch before it can be manually dispatched. Until release, use a checked-out branch and run:
`node scripts/ai-discovery/refresh-github.mjs && node scripts/ai-discovery/append-github-history.mjs && node --test tests/ai-github*.test.mjs`.
History is append-only by (repository, observedAt); conflicting values are rejected. It preserves earlier observations and adds new ones only after all validations pass.
The initial history contains a single actual GitHub API snapshot, so trends require at least two independent timestamps. Never calculate growth from a single snapshot.
GitHub scheduled workflows execute from the default branch, not an isolated feature branch. A production schedule is therefore intentionally omitted until the user approves a release and tests pass. See https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
No commercial payments or user-submission API are enabled. These require authentication, authorization, anti-abuse controls and end-to-end tests.
