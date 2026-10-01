# Lingxi source recovery — 2026-09-30

## Confirmed findings

- Before recovery, recursive PowerShell and Node enumeration both found zero files under `D:/lingxi-quantum/app`, `components`, and `.git`. Directory names remained. No files were deleted by this task.
- The pre-existing `LINGXIFIELD_V23_1_SOURCE_INVENTORY.json`, generated at 11:36:03 +08:00, already recorded empty `routes` and `api_routes` arrays.
- Directory modification times clustered around 08:45 +08:00: `.git/hooks` at 08:45:32, `app/about` at 08:45:38. Directory timestamps are circumstantial evidence, not a record of the deleting process.
- GitHub `3078024889/lingxi-quantum` retained commit `f35289a2dc83075959eb4c62717a05f00cdd649c`, committed at 08:04:18 +08:00. It is the remote main baseline used for recovery.

## Highly probable cause, not proven process attribution

The recycled package `LINGXIFIELD_PRODUCTION_CLOSURE_MASTER_20260930_R2` contains `INSTALL_PRODUCTION_CLOSURE_MASTER.ps1`. Its directory creation time is 08:44:26 +08:00. Line 44 pipes this enumeration directly into `Remove-Item -Force`:

```powershell
Get-ChildItem -LiteralPath $RepoRoot -File -Recurse -Force -Include '*.pyc','*.pyo'
```

A harmless reproduction under Windows `powershell.exe` used only two fixture files, `page.tsx` and `cache.pyc`, and only enumerated them. Both were returned. Thus the intended extension filter does not protect source files in this environment. Appending the installer's deletion stage can erase arbitrary repository files, including Git metadata, while leaving directories.

The mechanism and timing match this incident. However, no contemporaneous execution log proving that the R2 line ran has been recovered. PSReadLine records the original production-closure installer invocation twice (lines 12309–12310), but does not explicitly record the R2 invocation. Do not treat the original invocation as proof of R2 execution.

The disk USN journal metadata was readable, but reading journal records returned `Error 5: Access is denied`. No permission bypass was attempted. Recycle Bin metadata did not reveal deleted entries originally under the main repository. The suspect installer was copied here as `SUSPECT_R2_INSTALLER.txt` for inspection; it was not executed.

## Recovery performed

- Preserved 1,877 surviving files (63,803,362 bytes, including current generated artifacts and version backups) in `before/`, with hashes in `before-files.json` and directory timestamps in `before-directories.json`. Dependencies, the package store and `_local` were not duplicated in this snapshot.
- Cloned the remote main history to `remote-main/`. Sparse checkout excluded generated `.pnpm-store`, `.next`, and `node_modules`.
- Copied only missing files to the original project, with per-file SHA-256 verification. Restored 4,272 project files plus 99 Git metadata files. This includes 299 app files, 124 component files, 416 lib files, 278 scripts and 73 Supabase files.
- Preserved five existing files that differed from the remote checkout: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `scripts/prepare-media-runtime.cjs`, and `docs/research/CONSUME-HEARTBEAT-twentywatts.json`.
- Preserved all surviving September 30 additions. Migration directory now contains 88 files. No migration or production operation was executed.
- Moved damaged generated directories, without deleting them, to `D:/lingxi-quantum/_local/recovery-20260930/node_modules` and `.next` before reinstalling dependencies into a fresh store.
- Preserved six empty imported-submodule `.git` directories under `_local/recovery-20260930/empty-submodule-git/`. They caused Git status to fail; main repository status now works. Those gitlink repositories are uninitialized, not falsely claimed restored.

## Boundaries

- This recovers committed source plus surviving local additions. It cannot prove recovery of every deleted, never-committed local change, secret, downloaded model, or runtime data file.
- No credentials were invented or recovered from unrelated accounts. No deployment, Git push, database migration, or destructive cleanup was performed.
- Fresh dependency installation passed using pnpm 12.6.0 and a new store (646 packages). Media runtime preparation passed. `pnpm exec tsc --noEmit --incremental false` exited 0. `pnpm run build` exited 0 with Next.js 15.5.26; its lint phase completed with existing warnings. `git diff --check` passed. These are local build checks, not proof of production credentials, deployment, or payment execution.
- Destructive cleanup remains deferred to preserve incident evidence. The audit export excludes generated dependencies, caches, backup copies and sensitive configurations without deleting them from disk.

Detailed file provenance: `restoration-manifest.json`.
