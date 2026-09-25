# SASI Isolated Self-Coding Sandbox — V10.22

V10.22 is the first executable self-code mutation layer.

It does not let SASI change the main working tree or production branch.

## Execution model

```text
current repository
→ detached git worktree
→ overlay non-secret current working snapshot
→ baseline TypeScript
→ validate proposal
→ write candidate only inside sandbox
→ candidate TypeScript
→ collect diff / SHA evidence
→ verify main worktree untouched
→ destroy sandbox
```

The overlay explicitly skips:

- `.env*`
- `.git`
- `.next`
- `node_modules`
- `.lingxi-backup-*`
- coverage / dist

The candidate patch validator accepts only the initial evolvable SASI zones:

```text
lib/sasi/ask/
lib/sasi/learning/
lib/sasi/memory/
lib/sasi/models/
lib/sasi/self/
lib/sasi/cangxuan/
```

Unknown paths default to protected.

## Why snapshot the dirty working tree

The current LINGXIFIELD repository intentionally contains uncommitted V10.x construction work.

A plain worktree created from `HEAD` would not contain those local foundations and could produce misleading test results.

V10.22 therefore creates a detached worktree from `HEAD` and then copies the current non-secret modified/untracked files into that isolated worktree before running the baseline test.

No secret `.env` files are copied.

## V10.22 self-test

The first test proposal creates:

```text
lib/sasi/self/__sandbox_probe__.ts
```

inside the temporary worktree only.

It runs TypeScript again, records evidence, verifies the main working tree does not contain the probe, then destroys the worktree.

This proves the mutation mechanism before any model is allowed to author meaningful code.

## Next stage

V10.23 can connect the learning loop to this executor:

```text
failure event
→ hypothesis
→ model-authored proposal
→ policy validation
→ V10.22 sandbox executor
→ development eval
→ sealed eval
→ human review
```
