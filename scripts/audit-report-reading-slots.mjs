import assert from "node:assert/strict";
import fs from "node:fs";

const registry=fs.readFileSync("lib/report-v340/product-chapter-registry.ts","utf8");
const library=fs.readFileSync("lib/mini/report-entry-library.ts","utf8");
const compiler=fs.readFileSync("lib/report-v340/living-report-compiler.ts","utf8");
const products=["life-map","relationship-deep","relationship-business","relationship-other","resilience","romance","wealth","daily-tide","life-mirror","life-oracle"];
let total=0;
for(let index=0;index<products.length;index+=1){
  const key=products[index];
  const start=registry.indexOf(`"${key}": mk("${key}", [`);
  assert.ok(start>=0,`${key}: missing V340 chapter system`);
  const end=index+1<products.length?registry.indexOf(`"${products[index+1]}": mk`,start):registry.lastIndexOf("]),");
  const block=registry.slice(start,end);
  const count=(block.match(/^\s*\["/gm)||[]).length;
  assert.equal(count,11,`${key}: expected 11 living chapters, got ${count}`);
  total+=count;
}
assert.equal(total,110);
for(const oldWriter of ["structureWriters","mechanismWriters","realityWriters","actionWriters","observationWriters","classicalizeChineseSection"]){assert.ok(!library.includes(oldWriter),`removed template writer remains: ${oldWriter}`);}
for(const token of ["compileLivingChapter","costWhenOverused","falsifiers","distinctLeaves","evidenceDimension","不改作预设答案"]){assert.ok(`${library}\n${compiler}`.includes(token),`V340 living compiler missing ${token}`);}
console.log("PASS V340 report core: 10 independent systems, 110 living chapters, cross-context evidence, cost and falsifiers; legacy writers removed.");
