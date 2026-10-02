# LINGXIFIELD V35 Repository Final Cleanup

Purpose: remove obsolete tracked backups and retired product residue without touching protected production logic, food/calorie work, payment/withdrawal logic, or protected origin/source materials.

Removed:
- eight tracked `.lingxifield-*-backup-*` directories
- orphaned `imports/skills-devour-2026-09-18/INDEX.md`
- retired romance product research document
- retired number-energy implementation
- retired resilience/romance SQL-history file

Preserved:
- `content/cangxuan-feed/**` historical/origin source material
- all food/calorie changes already present in the worktree
- payment and withdrawal code
- production data and migrations not listed above
- current SASI, tools, document gateway, SEO, and 9-language production code

V35 also adds ignore rules so tracked local recovery directories do not re-enter the repository.
