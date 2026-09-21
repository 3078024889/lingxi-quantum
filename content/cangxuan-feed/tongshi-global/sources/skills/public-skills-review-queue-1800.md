# Public Skills Review Queue — 2026-09-10 18:00 (CST)

Policy: **metadata index only**. Do **not** install. Status for all rows: `queued_for_audit`.

Selection criterion: usefulness to **SASI** short-drama pipeline + agent tooling (一念成片、长上下文、技能自建/自迭代、任务拆解、文案语感) — not star count alone.

| rank | name | repo | path | why for SASI | status |
| ---: | --- | --- | --- | --- | --- |
| 1 | `context-engineering` | addyosmani/agent-skills | skills/context-engineering/SKILL.md | 长上下文/会话降质/规则与检索配置 — 直击 SASI Foundry 检索加厚与开拍上下文失效痛点 | queued_for_audit |
| 2 | `idea-refine` | addyosmani/agent-skills | skills/idea-refine/SKILL.md | 模糊一念 → 可执行概念；对齐「发想法→成片」入口的需求澄清 | queued_for_audit |
| 3 | `planning-and-task-breakdown` | addyosmani/agent-skills | skills/planning-and-task-breakdown/SKILL.md | 剧本→分镜→配音→成片多步编排的任务切分模板 | queued_for_audit |
| 4 | `continual-learning` | microsoft/skills | .github/skills/continual-learning/SKILL.md | hooks/memory/reflection — 对齐格鲁特/SASI 自学习自迭代活法（仅审结构，不装） | queued_for_audit |
| 5 | `skill-creator` | microsoft/skills | .github/skills/skill-creator/SKILL.md | 技能写作规范元技能；可对照 agentskills.io 规范自建 SASI 域内 skill（短剧/苍玄/开拍确认） | queued_for_audit |

## Notes

- Also strong runners-up (not in top 5): `using-agent-skills`, `writing-guidelines`, `spec-driven-development`, `incremental-implementation`.
- Prior seed `anthropics/skills` (`skill-creator`, `mcp-builder`, `canvas-design`) remains valuable but already indexed earlier — not re-queued here.
- `apify-ultimate-scraper` indexed for agent tooling awareness; **do not** use for unauthorized scraping / 整本盗版养料.
- License reminder: several Vercel skills declare MIT in frontmatter; repo-level SPDX may still be null — verify before any future audit install.

## Cycle artifacts

- Index: `public-skills-index-2026-09-10-1800.json`
- Stats: `public-skills-index-1800-stats.json`
