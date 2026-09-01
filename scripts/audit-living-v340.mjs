import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");
const hybrid=read("lib/hybrid-report.ts");
const editorial=read("lib/classical-editorial.ts");
const compiler=read("lib/report-v340/living-report-compiler.ts");
const library=read("lib/mini/report-entry-library.ts");
const registry=read("lib/report-v340/product-chapter-registry.ts");
for(const product of ["life-map","relationship-deep","relationship-business","relationship-other","resilience","romance","wealth","daily-tide","life-mirror","life-oracle"]){
  assert.ok(registry.includes(`"${product}": mk("${product}"`),`${product} living chapter system missing`);
  assert.ok(fs.existsSync(`knowledge/${product}/V340-LIVING-CORE.md`),`${product} independent knowledge boundary missing`);
}
assert.ok(!/qian:\s*\(\).*knowledge\/resilience/s.test(hybrid));
assert.ok(!/tarot:\s*\(\).*knowledge\/resilience/s.test(hybrid));
assert.ok(!/relationship:\s*\(\).*knowledge\/resilience/s.test(hybrid));
assert.ok(hybrid.includes("V340 禁止回落到 resilience"));
assert.ok(!editorial.includes(".replace(/如果")&&!editorial.includes("CHAPTER_MOVES"),"lexical classicalization must be removed");
for(const token of ["costWhenOverused","falsifiers","livedScenes","minIndependentContexts","compileLivingChapter"]){assert.ok(`${compiler}\n${library}`.includes(token),`living compiler missing ${token}`);}
assert.ok(!library.includes("structureWriters")&&!library.includes("mechanismWriters"),"legacy report writers remain");
console.log("PASS V340 living report architecture: independent product boundaries, evidence contexts, cost, lived scenes and falsifiers.");
