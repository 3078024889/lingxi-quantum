# 世界全体·城市/物种实体切片 w1（格鲁特）

- date: 2026-09-25 (Asia/Shanghai)
- after WDQS cooldown probe: tiny SPARQL HTTP 200 → proceeded
- CORE-0 / foundation_*：未碰
- license: CC0 (Wikidata)；非地球镜像；无 novel 全文
- D sync: packs 留 box（machine fc6eaa00… 在线但未 CopyFromBox；格鲁特自行同步）

## Packs（box 绝对路径）

| pack | path | n |
|------|------|--:|
| cities | `/workspace/imports/tongshi-pipeline/compressed/cards/tongshi-world-cities-w1-2026-09-25.jsonl` | 108 |
| species | `/workspace/imports/tongshi-pipeline/compressed/cards/tongshi-world-species-w1-2026-09-25.jsonl` | 72 |
| relations located-in | `/workspace/imports/tongshi-pipeline/compressed/cards/tongshi-world-relations-locatedin-w1-2026-09-25.jsonl` | 108 |

Mirrors: `/workspace/uploads/` · `/workspace/lingxi-quantum/imports/tongshi-pipeline/compressed/cards/` · notes also at `/home/box/in-from-groot-world-w1-cities-species.md`

## Schema（对齐 country w1）

- `title` = 完整陈述/主张（非短名词）
- `summary` = 展开/证据说明
- `kind` = `世界-实体`（cities/species）或 `世界-关系`（located-in）
- `wikidata_id` / `source_url` / `license=CC0 (Wikidata)` / `source=wikidata`
- `entity_type` = city | species | relation
- relations: `rel=located_in`, `from`/`to` + `from_wikidata_id`/`to_wikidata_id`
- `core0_touched=false`, `evolvable=true`, `production_ready=false`

## Slice bounds

- **cities**: WDQS；P31/P279* ∈ {Q515, Q1549597, Q1637706}；P1082 pop > 2e6；LIMIT 120 → unique 108；zh+en、country(P17)、coords(P625)、population
- **species**: 有界知名分类单元 curated QID + WDQS labels-only 分批（全量 sitelinks/kingdom walk 曾 504）；剔除 Statue/sail/eukaryote/Diptera/breed 等；n=72
- **relations**: city.P17 → located-in；n=108

## Samples

- city: 城市实体：重庆市（Wikidata Q11725），位于中华人民共和国（Q148），Wikidata 记录人口约 32,054,159，坐标约 (29.5500, 106.5069)
- species: 物种/生物分类实体：獅（Wikidata Q140），英文名 lion，属开放知识图谱中的知名生物分类单元切片
- relation: 空间关系：城市重庆市（Q11725）位于国家/地区中华人民共和国（Q148）之内（Wikidata P17 / located-in）

## Prior

- country pack w1 n=80 已 ingest；本波补 living entity table 缺口（city/species + located-in）

## WDQS / API

- probe: 200 OK（无最终 429 blocker）
- heavy species SPARQL: 504/timeout → VALUES batches POST labels-only
- wbgetentities: transient 429 during burst；backoff；未阻断成包
