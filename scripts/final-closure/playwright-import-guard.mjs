import fs from"node:fs";let ok=true;
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")),deps={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
const files=["playwright.food.config.ts","tests/final-closure/food-results.spec.ts"];
for(const f of files){const s=fs.readFileSync(f,"utf8");const good=s.includes('from"playwright/test"')&&!s.includes('@playwright/test');console.log(`PLAYWRIGHT_IMPORT_${f.replaceAll("/","_")}=${good?"PASS":"FAIL"}`);ok&&=good;}
const dep=Boolean(deps.playwright);console.log(`PLAYWRIGHT_PACKAGE=${dep?"PASS":"FAIL"}`);ok&&=dep;
process.exit(ok?0:1);