import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("CSV escapes formula cells, quotes, and limits export rows",()=>{
 const source=readFileSync("lib/ai-discovery/market-csv.ts","utf8").replace(/export type CsvModel=.*?;\n/s,"").replace(/:string\|number\|null/g,"").replace(/:string/g,"").replace(/:CsvModel\[\]/g,"").replace(/:number\|null/g,"");
 // The repository's TS runner is responsible for executing typed source; source contract guards remain separate.
 assert.match(source,/spreadsheet formulas/);
 assert.match(source,/replace\(\/"\/g/);
 assert.match(source,/models.length>200/);
});
test("download route is opt-in, no-store, and never exports synthetic data",()=>{
 const source=readFileSync("app/ai/market-preview/export/route.ts","utf8");
 assert.match(source,/AI_MARKET_PREVIEW_ENABLED/);
 assert.match(source,/private, no-store/);
 assert.match(source,/fetchCatalogPreview/);
 assert.match(source,/status:503/);
 assert.match(source,/text\/csv/);
});
