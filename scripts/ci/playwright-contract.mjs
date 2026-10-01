import fs from"node:fs";
import path from"node:path";

function walk(dir,out=[]){
 if(!fs.existsSync(dir))return out;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory())walk(p,out);
  else if(/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name))out.push(p);
 }
 return out;
}

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const deps={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
const hasCore=typeof deps.playwright==="string";
const hasTest=typeof deps["@playwright/test"]==="string";

const configs=fs.readdirSync(".").filter(n=>/^playwright\..*\.config\.ts$/.test(n));
const files=[...walk("tests"),...configs];
const bad=[];
for(const f of files){
 const s=fs.readFileSync(f,"utf8");
 if(s.includes("@playwright/test")&&!hasTest)bad.push(`${f}:imports @playwright/test without dependency`);
 if(s.includes('playwright/test')&&!hasCore&&!hasTest)bad.push(`${f}:imports playwright/test without Playwright dependency`);
}

if(bad.length){
 console.error(bad.join("\n"));
 throw new Error(`PLAYWRIGHT_IMPORT_DEPENDENCY_MISMATCH:${bad.length}`);
}

if(hasCore&&!hasTest){
 for(const f of files){
  const s=fs.readFileSync(f,"utf8");
  if(s.includes("@playwright/test"))throw new Error(`UNNORMALIZED_PLAYWRIGHT_TEST_IMPORT:${f}`);
 }
}

console.log(`PLAYWRIGHT_FILES_SCANNED=${files.length}`);
console.log(`PLAYWRIGHT_CORE_DEPENDENCY=${hasCore?"YES":"NO"}`);
console.log(`PLAYWRIGHT_TEST_DEPENDENCY=${hasTest?"YES":"NO"}`);
console.log("PLAYWRIGHT_IMPORT_DEPENDENCY_CONTRACT=PASS");
