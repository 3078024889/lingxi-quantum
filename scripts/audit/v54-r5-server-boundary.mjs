import fs from"node:fs";
import path from"node:path";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");
const policyPath="lib/pricing/tool-policy.ts";
const server=read(policyPath);

if(!server.includes('import "server-only";'))bad.push("operational tool policy lost server-only boundary");

const specs=[...server.matchAll(/(?:export\s+\{[^}]+\}|export\s+type\s+\{[^}]+\})\s+from\s+["'](\.[^"']+)["']/g)].map(m=>m[1]);
let publicFile=null;
for(const spec of specs){
 const base=path.resolve(path.dirname(policyPath),spec);
 for(const c of[`${base}.ts`,`${base}.tsx`,path.join(base,"index.ts"),path.join(base,"index.tsx")]){
  if(fs.existsSync(c)){publicFile=c.replaceAll("\\","/");break}
 }
 if(publicFile)break;
}
if(!publicFile)bad.push("server wrapper does not re-export a public data module");

if(publicFile){
 const pub=read(publicFile);
 for(const forbidden of['server-only',"process.env","next/headers","next/server","supabase/server"]){
  if(pub.includes(forbidden))bad.push(`public policy data contains server-only dependency: ${forbidden}`);
 }
 if(!pub.includes("toolBillingPolicy")&&!pub.includes("ToolBillingPolicy"))bad.push("public policy data lacks billing-policy API");
}

for(const candidate of[
 "lib/seo/site-facts.ts","lib/seo/global-seo.ts","lib/tools/seo.ts",
 "components/seo/ToolFacts.tsx","components/seo/ToolGuideContent.tsx"
]){
 if(!fs.existsSync(candidate))continue;
 const body=read(candidate);
 if(/pricing\/tool-policy["']/.test(body))bad.push(`${candidate} imports server-only tool-policy`);
 if(/pricing\/policy["']/.test(body))bad.push(`${candidate} imports server-only pricing/policy`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log(`V54R8_PUBLIC_POLICY_DISCOVERY=PASS:${publicFile}`);
console.log("V54R8_SERVER_ONLY_OPERATIONAL_BOUNDARY=PASS");
console.log("V54R8_NO_SERVER_ONLY_IMPORT_LEAK_TO_SEO=PASS");
