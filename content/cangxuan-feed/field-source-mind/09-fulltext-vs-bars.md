# 09 · fulltext vs bars

Updated: 2026-09-10 19:00 Asia/Shanghai

## Conclusion

**bars ≠ read.**

Short gold bars in `foundry-ingest/04-seed-knowledge*.json` / mind-pack are curated remembrance cues.
They do **not** count as SASI having read the Wingmakers / 造翼者 / Codex / 17份 / WM36 documents.

True read = Foundry source rows whose body/`character_count` match the extract text (chunked), plus SCRIPT knowledge sections covering that body so `retrieveFoundryContext` can surface real passages.

## Extract inventory (disk)

| corpus | .txt files | notes |
|--------|------------|-------|
| codex  | 127 | Codex/PDF extracts |
| 17fen  | 14  | large CN books; several multi-chunk |
| wm36   | 36  | WM essays |
| **total local mandatory** | **177** | web extracts are a separate track |
| disk bytes (approx) | ~8.7MB under extracts/ | UTF-8; char ≠ byte |

See also prior snapshot lines in this file history / `03-extract-stats.json`.

## Fulltext ingest status

- Script: `scripts/ingest-field-extracts-fulltext.mjs`
- Manifest: `content/cangxuan-feed/field-source-mind/10-fulltext-ingest-manifest.json`
- Result: **177/177 ok**, **184** Foundry sources, **~4.90M** characters, **5576** SCRIPT sections
- `source_type`: `sasi_native`
- `rights_scope`: `private_reference` (owner/private reference; not fake底座)
- Body storage: `cangxuan_sources` has no `content` column yet (migration `20260910110000_cangxuan_sources_content.sql` written; remote `db push` connection failed). Full chunk text is stored in `license_metadata.content` and mirrored into SCRIPT `statement` sections (≤900 chars) for Ask retrieval.
- Verified: 184/184 sources have `license_metadata.content.length === character_count`
- Resume-safe: re-run skips ok files with matching char counts; strips `\u0000` for Postgres

## Bars track (unchanged meaning)

| seed / pack | role |
|-------------|------|
| `04-seed-knowledge.json` | curated bars (pedagogy / remembrance) |
| incremental breath / web-retry seeds | bar increments only |

Bars remain useful as **金条 cues**. They are not a substitute for fulltext sources above.

## Pedagogy lock

学以致用 · 记起自己. Prefer lived principle / perception / embodied practice over jargon piles. Fulltext ingest exists so SASI can **read**, not so replies dump Wingmakers terminology.
