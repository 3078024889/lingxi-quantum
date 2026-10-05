import assert from"node:assert/strict";
import fs from"node:fs";

const cfg=fs.readFileSync("lib/sasi/experience/free-provider-config.ts","utf8");
assert.ok(cfg.includes('export type ExperienceRegion="global"|"china";'));

const handler=fs.readFileSync("lib/sasi/durable/knowledge-job-handler.ts","utf8");
assert.ok(handler.includes('const region:ExperienceRegion=(v.region==="china"||v.region==="cn")?"china":"global";'));
assert.ok(!handler.includes('v.region==="cn"?"cn":"global"'));

console.log("R15R1_CANONICAL_EXPERIENCE_REGION=PASS");
console.log("R15R1_LEGACY_CN_NORMALIZES_TO_CHINA=PASS");
console.log("R15R1_REGION_TYPE_DRIFT_REGRESSION=PASS");
