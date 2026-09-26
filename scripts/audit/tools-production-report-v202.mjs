import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const registry=read("lib/tools/registry.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const graph=read("lib/tools/engine/stage-graph.ts");
const paid=read("lib/tools/paid-catalog.ts");

const rows=[];
const reg=[...registry.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,520}?category:\s*"([^"]+)"[\s\S]{0,520}?status:\s*"([^"]+)"/g)]
  .map(m=>({slug:m[1],category:m[2],status:m[3],source:"registry"}));
const hubSlugs=[...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(m=>m[1]);
const map=new Map(reg.map(x=>[x.slug,x]));
for(const slug of hubSlugs)if(!map.has(slug))map.set(slug,{slug,category:"dedicated",status:"live",source:"hub"});
for(const item of [...map.values()].sort((a,b)=>a.slug.localeCompare(b.slug))){
 const sourcePage=fs.existsSync(path.join(root,`app/tools/${item.slug}/page.tsx`))?"dedicated":"dynamic";
 const hasGraph=graph.includes(`g("${item.slug}"`);
 const isPaid=paid.includes(`"${item.slug}"`);
 rows.push({...item,sourcePage,hasGraph,isPaid});
}
const outside=path.resolve(root,"..","lingxi-reports");
fs.mkdirSync(outside,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,"-");
const jsonPath=path.join(outside,`tools-production-v202-${stamp}.json`);
const mdPath=path.join(outside,`tools-production-v202-${stamp}.md`);
fs.writeFileSync(jsonPath,JSON.stringify({generatedAt:new Date().toISOString(),count:rows.length,rows},null,2));
const md=[
 "# LINGXIFIELD Tools Production Matrix V20.2","",
 `Generated: ${new Date().toISOString()}`,"",
 `Discovered surfaces: ${rows.length}`,"",
 "| Tool | Surface | Graph | Paid |",
 "|---|---|---:|---:|",
 ...rows.map(r=>`| ${r.slug} | ${r.sourcePage} | ${r.hasGraph?"yes":"no"} | ${r.isPaid?"yes":"no"} |`)
].join("\n");
fs.writeFileSync(mdPath,md);
console.log(`TOOLS_REPORT_JSON=${jsonPath}`);
console.log(`TOOLS_REPORT_MD=${mdPath}`);
console.log(`TOOLS_REPORT_COUNT=${rows.length}`);
console.log("TOOLS_PRODUCTION_MATRIX=PASS");
