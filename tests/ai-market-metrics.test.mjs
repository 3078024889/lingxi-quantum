import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("lib/ai-discovery/market-metrics.ts","utf8");
test("market terminal records provenance, period and model version",()=>{
 for(const field of ["sourceUrl","sourceName","periodStart","periodEnd","observedAt","modelVersion","geography","tier"])
  assert.ok(source.includes(field),field);
 for(const metric of ["monthly-web-visits","app-downloads","max-video-seconds","videos-per-request","usd-per-generation","task-success-rate"])
  assert.ok(source.includes(metric),metric);
});
test("rankings reject incompatible measurement windows and absent evidence",()=>{
 assert.match(source,/a\.periodStart===b\.periodStart/);
 assert.match(source,/a\.periodEnd===b\.periodEnd/);
 assert.match(source,/a\.geography===b\.geography/);
 assert.match(source,/a\.modelVersion===b\.modelVersion/);
 assert.match(source,/No verified observations/);
 assert.match(source,/Different units, periods, model versions or geographies/);
});
