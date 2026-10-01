# LINGXIFIELD Production Clean Baseline V30

Minimum canonical baseline commit:
`7ffe4911b0a678200feae9049d3ee02d25f27d00`

Current verified GitHub main when this package was created:
`695ee922074c3a39421733a957cf3c649d35580f`

V30 ends the historical cumulative-patcher release method.

## New release model

Every change starts from the current Git `main`:

1. clean checkout
2. frozen dependency install
3. canonical source audits
4. production `next build`
5. desktop Playwright closure
6. mobile Playwright closure
7. only then merge / deploy

Historical V21–V29 installer patchers are not part of the V30 release model.

## GitHub required check

Use the single unique job name:

`production-gate`

After the workflow has run once successfully, configure the `main` ruleset / branch protection to require this check before merging.

Recommended:
- require pull request
- require `production-gate`
- require branch to be up to date
- block force pushes
- block deletion
- do not allow bypass unless emergency owner access is intentionally retained

## Vercel

Keep the repository Git integration on `main`.

Recommended Vercel project settings:
- Production Branch: `main`
- Native Typecheck check: required
- Native Lint check: optional until the current legacy warnings are intentionally cleaned
- do not promote a failed deployment

## Reproducible toolchain

- Node: 24.19.0
- pnpm CI runner: 11.28.0
- install: `pnpm install --frozen-lockfile`
- Playwright CI workers: 1

The project lockfile remains authoritative.

## Protected zones

V30 accepts any clean `main` commit that contains the minimum canonical baseline. It does not require HEAD to remain frozen forever.

V30 does not alter:
- food-calorie business internals
- payment execution
- withdrawals
- production user data
- core/origin modules


## V30R2: isolated validation worktree

Local validation no longer requires the developer's main working directory to be clean.

V30R2:
1. reads the committed current HEAD
2. creates a disposable detached Git worktree at that exact commit
3. applies V30 only inside that worktree
4. installs dependencies with the frozen lockfile
5. runs all source gates, production build, desktop and mobile browser closure
6. emits `V30_VALIDATED_CHANGESET.patch`
7. removes the disposable worktree

The user's ordinary working directory is never reset, stashed, cleaned, or overwritten by validation.

`APPLY_VALIDATED_V30.ps1` is a separate explicit promotion step. It refuses to overwrite tracked local changes, while unrelated untracked files are preserved.


## V30R3: Playwright contract

The production build passed, then browser closure failed because the repository installed `playwright` but two newer tests imported `@playwright/test`.

R3 normalizes test imports to the dependency already pinned by the repository (`playwright/test`) and adds a permanent `ci:playwright-contract` gate so import/dependency drift is detected before browser startup.

A later dedicated dependency modernization can migrate the whole repository to `@playwright/test`; V30 does not mix that lockfile migration into the clean-baseline closure.

## Local old-backup cleanup

`CLEAN_OLD_BACKUPS.ps1` physically deletes only explicit historical LINGXIFIELD backup directories under the repository root. It refuses Git, production data, Supabase, model source data, and paths outside the repository.
