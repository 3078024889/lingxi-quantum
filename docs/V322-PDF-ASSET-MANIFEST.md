# V322 PDF artwork manifest

The supplied `新的PDF60张.zip` is the single source for this release's Mini Program publication artwork. The files are copied into a stable, product-owned registry; runtime code never depends on the original Chinese filenames or the external D: drive.

Each formal product owns six text-free vertical plates:

| Product | Registry directory | Original group |
| --- | --- | --- |
| Life Blueprint | `/shared/report-assets/life-map/01..06.png` | 生命图谱 7..12 |
| Deep Relationship Resonance | `/shared/report-assets/deep-relationship/01..06.png` | 亲密关系共振 7..12 |
| Business Partnership Resonance | `/shared/report-assets/business-relationship/01..06.png` | 合伙商业关系 7..12 |
| Other Relationship Resonance | `/shared/report-assets/other-relationship/01..06.png` | 其他关系共振 7..12 |
| Life Resilience | `/shared/report-assets/resilience/01..06.png` | 生命韧性指数 7..12 |
| Romance Field | `/shared/report-assets/romance/01..06.png` | 桃花磁场 7..12 |
| Wealth Creation Map | `/shared/report-assets/wealth/01..06.png` | 财富创造地图 7..12 |
| Today's Tide | `/shared/report-assets/daily-tide/01..06.png` | 今日运势潮汐 7..12 |
| Life Mirror | `/shared/report-assets/life-mirror/01..06.png` | 灵犀量子塔罗 7..12 |
| Life Oracle | `/shared/report-assets/life-oracle/01..06.png` | 灵犀生命灵签 7..12 |

`lib/report-art-registry.ts` is the runtime source of truth. Selection is deterministic per report ID and page number, so a regenerated PDF retains its editorial identity while cycling the six plates.

The web Life Archetype publication uses `WEB_ARCHETYPE_PDF_ART_POOL`, a dedicated cross-field set selected only from these text-free plates. It never uses the 64 Life Oracle card images.

Publication contract:

- fixed A4 pages only;
- artwork and report copy share each page;
- no navigation, buttons, or browser fragments inside PDF pages;
- missing artwork aborts the export;
- each 24-entry product publishes six chapters of four entries across twelve entry pages;
- the complete Life Archetype publishes 24 independent inference modules.
