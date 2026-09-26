import fs from "node:fs";import path from "node:path";
const repo=process.cwd();const read=p=>fs.readFileSync(path.join(repo,p),"utf8");const must=(v,m)=>{if(!v)throw new Error(m)};
const graph=read("lib/tools/engine/stage-graph.ts");
const registry=read("lib/tools/registry.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const registrySlugs=[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]);
const hubSlugs=[...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(x=>x[1]);
const all=[...new Set([...registrySlugs,...hubSlugs])].sort();
const infrastructure=new Set(["temp-mail","burn-after-read"]);
const aliases=new Map([
 ["pdf-compress","pdf-compress"],["pdf-merge-split","pdf-merge-split"],["image-to-pdf-pro","image-to-pdf-pro"],
 ["heic-local","heic-local"]
]);
const missing=[];
for(const slug of all){
 if(infrastructure.has(slug))continue;
 const id=aliases.get(slug)||slug;
 if(!graph.includes(`g("${id}"`))missing.push(slug);
}
console.log(`DISCOVERED_TOOL_SURFACES=${all.length}`);
console.log(`INFRASTRUCTURE_MANAGED=${[...infrastructure].join(",")}`);
if(missing.length){console.error("TOOL_GRAPH_MISSING="+missing.join(","));process.exit(1)}
console.log("TOOL_GRAPH_COVERAGE=PASS");
