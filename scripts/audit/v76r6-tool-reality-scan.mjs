import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),fail=m=>{throw new Error(m)};
const advanced=fs.readFileSync(path.join(root,"lib/tools/advanced-catalog.ts"),"utf8");
const slugs=[...new Set([...advanced.matchAll(/href:"\/tools\/([^"]+)"/g)].map(m=>m[1]))];
const suspicious=[];
const thin=[];
for(const slug of slugs){
 const page=path.join(root,"app","tools",slug,"page.tsx");
 if(!fs.existsSync(page)){suspicious.push(`${slug}:NO_PAGE`);continue}
 const s=fs.readFileSync(page,"utf8");
 if(/\b(COMING_SOON|NOT_IMPLEMENTED|TODO_ONLY|FAKE_SUCCESS)\b|即将上线|敬请期待|coming soon/i.test(s))suspicious.push(`${slug}:PLACEHOLDER_MARKER`);
 if(s.replace(/\s/g,"").length<80)thin.push(slug);
}
if(suspicious.length)fail("REALITY_BLOCKERS:"+suspicious.join(","));
console.log(`REAL_TOOL_ROUTES=${slugs.length}`);
console.log(`THIN_WRAPPER_ROUTES=${thin.length}`);
console.log("NO_COMING_SOON_TOOL_ROUTES=PASS");
console.log("NO_FAKE_SUCCESS_MARKERS=PASS");
console.log("TOOL_REALITY_STATIC_SCAN=PASS");
