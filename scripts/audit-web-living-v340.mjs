import fs from "node:fs";
import assert from "node:assert/strict";

const read=(file)=>fs.readFileSync(file,"utf8");
const adapter=read("lib/report-v340/web-adapter.ts");
const compiler=read("lib/report-v340/living-report-compiler.ts");
const engine=read("lib/dendritic-engine.ts");
const hybrid=read("lib/hybrid-report.ts");
const resilience=read("app/api/resilience/generate-full/route.ts");
const wealth=read("app/api/wealth/generate-full/route.ts");
const relationship=read("lib/knowledge-loader.ts");
const editorial=read("lib/classical-editorial.ts");

for(const token of ["compileDendriticLivingText","compileHybridLivingSections","costWhenOverused","falsifiers","contradictions","evidenceLeaves"]){
  assert.ok(`${adapter}\n${compiler}`.includes(token),`missing V340 web token: ${token}`);
}
for(const mapping of ['"life-map":"life-map"','qian:"life-oracle"','romance:"romance"','"daily-tide":"daily-tide"','"life-mirror":"life-mirror"'])assert.ok(engine.includes(mapping),`missing product mapping ${mapping}`);
for(const product of ["relationship-deep","relationship-business","relationship-other"])assert.ok(relationship.includes(`"${product}"`),`relationship path not isolated: ${product}`);
assert.ok(resilience.includes('product:"resilience"')&&wealth.includes('product:"wealth"'),"hybrid web products do not use V340 compiler");
assert.ok(/V340\.1-LIVING-WEB/.test(editorial),"web cache marker was not advanced");
assert.ok(/if \(chinesePublication\)[\s\S]*compileDendriticLivingText/.test(engine),"Chinese web publication does not enter V340 before legacy composition");
assert.ok(!/qian\s*:\s*\(\).*knowledge\/resilience|tarot\s*:\s*\(\).*knowledge\/resilience|relationship\s*:\s*\(\).*knowledge\/resilience|life-map\s*:\s*\(\).*knowledge\/resilience|daily\s*:\s*\(\).*knowledge\/resilience/s.test(hybrid),"cross-product resilience fallback returned");

const products=["life-map","relationship-deep","relationship-business","relationship-other","resilience","romance","wealth","daily-tide","life-mirror","life-oracle"];
for(const product of products){
  assert.ok(fs.existsSync(`knowledge/${product}/V340-LIVING-CORE.md`),`missing independent product boundary: ${product}`);
}

console.log("PASS web V340: ten independent product paths now compile Chinese chapters from evidence, living nodes, cost and falsifiers; cache marker advanced.");
