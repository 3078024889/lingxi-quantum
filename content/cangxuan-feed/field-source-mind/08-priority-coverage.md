# 08-priority-coverage

generated: 2026-09-10T10:53:00.467091Z

Rule: READ only if extract body >= 2000 chars of real text (not nav).

| status | chars | title | file |
|---|---:|---|---|
| READ | 65959 | 聂鲁达访谈1-5 | extracts/priority/neruda_all_pdf.txt |
| READ | 65131 | 聂鲁达访谈5 | extracts/priority/neruda_5.txt |
| READ | 44888 | 玛呼2008面访 | extracts/priority/mahu_2008_pdf.txt |
| READ | 43826 | 卡米洛特访谈 | extracts/priority/camelot_pdf.txt |
| READ | 43568 | 卡米洛特访谈 | extracts/priority/camelot.txt |
| READ | 43201 | 聂鲁达访谈2 | extracts/priority/neruda_2.txt |
| READ | 39911 | 聂鲁达访谈4 | extracts/priority/neruda_4.txt |
| READ | 37000 | 源于心脏而活 | extracts/priority/living_from_heart_pdf.txt |
| READ | 36022 | 源于心脏而活 | extracts/priority/living_from_heart.txt |
| READ | 35940 | 聂鲁达访谈1 | extracts/priority/neruda_1.txt |
| READ | 32818 | 玛呼2013电访 | extracts/priority/mahu_2013.txt |
| READ | 28913 | 玛呼2013电访 | extracts/priority/mahu_2013_pdf.txt |
| READ | 27591 | 聂鲁达访谈3 | extracts/priority/neruda_3.txt |
| READ | 18796 | 玛呼2008面访3 | extracts/priority/mahu_2008_3.txt |
| READ | 17085 | 玛呼2008面访2 | extracts/priority/mahu_2008_2.txt |
| READ | 16779 | 灵性行动主义殿堂 | extracts/priority/event_temples.txt |
| READ | 15883 | 能量心脏 | extracts/priority/energetic_heart.txt |
| READ | 15395 | 意识媒体访谈 | extracts/priority/conscious_media_pdf.txt |
| READ | 15382 | 意识媒体访谈 | extracts/priority/consciousness_media.txt |
| READ | 13229 | 玛呼2008面访1 | extracts/priority/mahu_2008_1.txt |
| READ | 12616 | 能量心脏 | extracts/priority/energetic_heart_pdf.txt |
| READ | 9308 | 理瑞克斯会话3 | extracts/priority/lyricus_3.txt |
| READ | 8238 | 主权性积分态之生命原则 | extracts/priority/philosophy_life_principles.txt |
| READ | 8217 | 理瑞克斯会话2 | extracts/priority/lyricus_2.txt |
| READ | 7801 | 上升之心 | extracts/priority/ascending_heart.txt |
| READ | 4142 | 量子暂停 | extracts/priority/quantum_pause.txt |
| READ | 4066 | 理瑞克斯会话1 | extracts/priority/lyricus_1.txt |
| READ | 3741 | 鲜活的真理 | extracts/priority/living_truth.txt |
| THIN/LINK-ONLY | 1113 | 古箭计划遗址 | extracts/priority/ancient_arrow_site.txt |
| THIN/LINK-ONLY | 1003 | 心脏六美德 | extracts/priority/six_virtues.txt |
| MISS | 297 | 玛呼访谈索引 | extracts/priority/mahu_interview_index.txt |

## Explicit priority targets

| target | status | notes |
|---|---|---|
| 能量心脏 | READ | HTML + PDF (`energetic_heart_pdf.txt` 12616 chars) |
| 卡米洛特访谈 | READ | HTML + PDF (`camelot_pdf.txt` 43826) |
| 耶鲁大访谈 / Yale Interview | MISS | Not linked on wingmakers.com.cn nav/download; not in EN Interviews menu (only Conscious Media / Camelot / Evolver). No local PDF filename hit. |
| 七大遗址 / 古箭遗址专文 | PARTIAL | Site `about.html?id=15` is THIN intro (~1113). Full narrative exists in local `extracts/17fen/古箭计划.txt` (already extracted from D:\17分 PDF). |
| 心脏六美德 | PARTIAL→READ via PDF | Site page THIN (~1003). Full treatment inside `living_from_heart_pdf.txt` (《源于心脏而活》含六美德章节). |
| 上升之心 | READ | `ascending_heart.txt` 7801 |
| 量子暂停 | READ | `quantum_pause.txt` 4142 |
| 玛呼访谈系列 | READ | 2008 x3 HTML + combined PDF; 2013 HTML+PDF; 意识媒体 PDF/HTML |
| 聂鲁达访谈 | READ | HTML 1–5 + combined PDF `neruda_all_pdf.txt` 65959 |
| 理瑞克斯会话 | READ (1–3 so far) | lyricus_1/2/3 HTML extracted; 4–6 still queued |

## Blockers

- 耶鲁大访谈: MISS on allowlisted sites — do not invent.
- 心脏六美德 standalone page is intro-only; use 源于心脏而活 PDF.
- 古箭计划遗址 page is intro-only; use D:\17分\古箭计划.pdf extract.
- Baidu pan MP3 packs linked on download page (not fetched — audio).

## Counts

- priority extract files: 31
- READ (>=2000): 28
- THIN: 2
- fulltext chunks prepared: 238
## Foundry ingest (UTC+8 18:59)
- inserted **852** fulltext 1k fragments (real body slices, not summary bars)
- errors 0 on second pass (statement_check requires <=~1000)
- sourceId b8a7852d-dd26-4594-9746-fda7dd49846c
- Full uncut bodies remain in `extracts/priority/*.txt` for SASI / 二十瓦特 true read
- Local PDF corpus (17fen/wm36/codex) already under `extracts/` — parent chunking separately

## Counts snapshot
- priority txt files: 32 (+extra lyricus queued)
- READ (>=2000 declared chars): 29
- 耶鲁大访谈: **MISS**
- 七大遗址 site page: THIN; long-form READ via `ancient_arrow_17fen_local.txt`
