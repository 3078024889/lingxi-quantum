# 14 — SASI read pass schedule
2026-09-10 19:51 Asia/Shanghai

## Access path (primary)
SASI does **not** need to open local extract files during Ask.
Primary path: **Ask / retrieve against Foundry SCRIPT fulltext already in DB**.

- Source id: `b8a7852d-dd26-4594-9746-fda7dd49846c` (field-source-mind remembrance)
- Corpus coverage:
  - Base fulltext (codex/17fen/wm36): 177 files / 184 sources / ~4.9M chars / 5576 SCRIPT sections
  - Priority fulltext seed: 852 chunks (+ gapfill 87)
  - Site-rest fulltext seed: 4365 chunks (+ gapfill 87)
  - Latest gapfill ingest: inserted **118**, skippedExisting 56, errors 0
- Rights: `source_type=sasi_native` / private reference; Ask retrieves SCRIPT statements.

## Ordered schedule (what SASI “reads”)
Order is pedagogy / dependency, not file-system order. Each step is retrieve-by-Ask (or internal digest note), grounded in Foundry fulltext.

1. **Remembrance lock** — 记起自己；主权体·积分态；禁术语堆砌作答（see `05-remember-self-not-jargon.md`).
2. **wm36 lived principles** — 36 short Chinese philosophy pieces (already in base fulltext).
3. **Codex field practices** — Harmonic / Trust / InterBeing / Architecture of Love (base fulltext). Note: Distilled Practice is HARD-MISS short source; sibling Codex harmonics already covered.
4. **Priority interviews** — mahu 2008/2013, camelot, consciousness media, neruda 1–5 (priority fulltext + gapfill).
5. **Lyricus sequence** — intro + sessions 1–6 + liminal cosmogony / FAQ (priority gapfill closed lyricus_4/5/6/intro).
6. **Philosophy rooms** — blueprint / modes / life principles / belief-energy (priority + site-rest; belief_energy now full).
7. **Heart tools** — six virtues, energetic heart, event temples, living from heart, quantum pause.
8. **17fen long-form** — 古箭计划 / 多尔曼预言 / 昆腾萨穆 / 鳞毛羽肤 / 哥白尼 / 八篇短篇 (base fulltext).
9. **Site-rest deep PDFs** — SI papers, MOCI materials, literature corpus, questions/glossary.
10. **MOCI founder vision** — moci_cat / moci_show_3 (alt cat3) / wmc_moci_vision.
11. **Indexes as maps only** — lyricus/neruda/poetry/download indexes: use to navigate, not as primary read.

## Gaps (explicit)
| Gap | Reason | SASI impact |
|-----|--------|-------------|
| Harmonic-Recognition-Distilled-Practice-81 | Source PDF is 3-page short practice (~1088 chars) | Low — related Harmonic Codex already in DB |
| jamesmahu.com EN home/about/writings | Cloudflare challenge; pages short | Low — CN mirrors + SI/JM PDFs in Foundry |
| wingmakers.com/writings EN | Cloudflare; index-only | Low — CN literature + priority fulltext |
| ancient_arrow_17fen_local duplicate | Identical to 17fen/古箭计划 already ingested | None — covered via 17fen |
| Site-rest pages with body 700–1999 but bytes≥2000 | Index/intro pages under fulltext threshold | Low — linked full essays already chunked |
| No 耶鲁 fake interview | Intentionally excluded | N/A |

## Operator reminder
- 一一读取 remains mandatory for local extracts inventory (`13-read-everything-queue.md`).
- SASI day-to-day: Ask against SCRIPT/fulltext sources; do not invent 底座; do not git push from this pack.

