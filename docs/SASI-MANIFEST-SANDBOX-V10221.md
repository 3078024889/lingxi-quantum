# V10.22.1 Manifest Self-Coding Sandbox

V10.22 stalled because it enumerated the full dirty/untracked repository.

V10.22.1 removes that mechanism.

It overlays only an explicit SASI foundation manifest into a detached worktree.

## Why this is safer

The old flow:

```text
git status --untracked-files=all
→ enumerate the whole working tree
→ copy non-secret dirty files
```

The new flow:

```text
detached HEAD worktree
→ explicit SASI foundation manifest
→ copy only named foundation files
→ baseline TSC
→ sandbox-only mutation
→ candidate TSC
→ evidence
→ destroy worktree
```

No `.env*`, migrations, backups, node_modules or unrelated product work is enumerated.

The manifest is intentionally explicit and reviewable.
