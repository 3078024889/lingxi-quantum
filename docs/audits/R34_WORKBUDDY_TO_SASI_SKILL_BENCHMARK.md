# R34 SASI skill uplift — WorkBuddy screenshot benchmark, 2026-10-09

## Product principle

Do **not** clone a third-party plugin catalogue or advertise 15 skills simply because 15 skill cards exist. Build a reliable input → grounded evidence → relevant expertise → editable artifact → verification loop, using the existing SASI workspace.

## Reviewed open-source patterns

- [Agent Skills open specification](https://agentskills.io/specification): progressive disclosure, declarative name/description, on-demand references and scripts. **Already implemented in part** by SASI's catalogue/router; improve end-to-end triggering, not duplicate the kernel.
- [OpenAlex API](https://help.openalex.org/api/): public scholarly metadata search, time-filtered works, author/title/date/DOI; basic access may be free subject to quota. Implementation here uses verified metadata only and never claims it read full papers.
- [PptxGenJS](https://github.com/gitbrent/PptxGenJS): native editable PPTX text, tables, charts, slide layout. **Not yet installed/integrated into production SASI**; current R34 presentation skill provides planning/validation guidance, not a real PPTX file.
- [Apache ECharts](https://github.com/apache/echarts): browser charts, interaction and accessible/exportable chart design. Current R34 adds a chart-oriented skill but **not** a working dashboard exporter.
- [arxiv.py](https://github.com/lukasschwab/arxiv.py): bibliographic preprint API client. Evaluate supplementing OpenAlex when reliable arXiv submission-date coverage matters; no promise of an enabled integration.

## Implemented on R34 staging branch

1. Six specialized task skills: research tracking, deep paper reading, editable presentation planning, chart/data planning, work reports and author-voice editing.
2. Automatic intent routing and nine-language skill-selection labels.
3. An authenticated scholarly-search option at the **existing** `/api/sasi/research/search`, avoiding a duplicate resource/workspace; verified OpenAlex metadata only, limit 10, publication time filter, user/IP abuse guard, safe identifiers, error reporting. External free service availability and production response still need real-world acceptance.
4. Connect task intent to the existing research workspace before evidence synthesis, without overriding normal web research.
5. Unit tests for skill selection, localized labels, bounded date filters and suspicious identifier rejection.

## Still required for genuine completion

- Research: source ingestion of PDF full text and line/page citations, ranked research directions with methodology and repeatability; publisher metadata cannot prove conclusions; optional scheduled tracking requires a configured task runner.
- Presentations: native PPTX generation with actual editable OOXML, speaker notes, schema validation, real spreadsheet-backed charts, and roundtrip PowerPoint/LibreOffice compatibility.
- Charts: real Excel/CSV/JSON ingestion, metadata schema, interactive HTML, responsive dashboard, PNG/SVG export and independent data validation.
- Reports: authenticated evidence capture and report state persistence, correct/unknown task status and export formats; no inventing completed work.
- Writing: preserve original facts and citations; no claims of detector evasion.
- Important: no new paid model provider, billing policy change or production deployment authorized in this branch.

## Release acceptance

Build/type-check, existing production gate, Playwright desktop/mobile, honest source/provenance checks, API fault tests, end-to-end authenticated scholarly search and actual editable PPTX tests once implemented. All features must display honest unavailable states. No merge/deployment before gates pass and agreed release window.
