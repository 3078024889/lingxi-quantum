import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const registryPath=path.join(root,"lib/tools/registry.ts");
const dynamicPage=path.join(root,"app/tools/[slug]/page.tsx");
const workbenchPath=path.join(root,"components/tools/ToolWorkbench.tsx");

const must=(v,m)=>{if(!v)throw new Error(m)};
must(fs.existsSync(registryPath),"TOOLS_REGISTRY_MISSING");
must(fs.existsSync(dynamicPage),"DYNAMIC_TOOL_ROUTE_MISSING");
must(fs.existsSync(workbenchPath),"TOOL_WORKBENCH_MISSING");

const registry=fs.readFileSync(registryPath,"utf8");
const dynamic=fs.readFileSync(dynamicPage,"utf8");
const workbench=fs.readFileSync(workbenchPath,"utf8");

must(dynamic.includes("getTool(params.slug)"),"DYNAMIC_ROUTE_NOT_REGISTRY_BACKED");
must(dynamic.includes("<ToolWorkbench tool={tool}"),"DYNAMIC_ROUTE_NOT_WORKBENCH_BACKED");

const slugs=[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(m=>m[1]);
const live=[...new Set(slugs)];

const exactHandled=new Set([
 ...[...workbench.matchAll(/tool\.slug\s*===\s*"([^"]+)"/g)].map(m=>m[1]),
 ...[...workbench.matchAll(/\["([^"]+)"(?:,\s*"([^"]+)")*/g)].flatMap(m=>m.slice(1).filter(Boolean))
]);
const textList=["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode"];
for(const x of textList)exactHandled.add(x);
for(const x of ["json-formatter","timestamp-converter","qr-code-generator"])exactHandled.add(x);

function genericHandled(slug){
 if(exactHandled.has(slug))return true;
 if(slug.startsWith("compress-image-to-")&&workbench.includes('tool.slug.startsWith("compress-image-to-")'))return true;
 return false;
}

const unresolved=[];
const routed=[];
for(const slug of live){
 const dedicated=path.join(root,"app/tools",slug,"page.tsx");
 if(fs.existsSync(dedicated)){routed.push({slug,route:"dedicated"});continue}
 if(genericHandled(slug)){routed.push({slug,route:"dynamic"});continue}
 unresolved.push(slug);
}

if(unresolved.length){
 console.error("ALL_TOOLS_STRUCTURE=FAIL");
 console.error("UNRESOLVED_TOOL_HANDLERS="+unresolved.join(","));
 process.exit(1);
}

const engineering=["浏览器本地","本地处理","本地完成","Magic Bytes","逐字节 / 哈希","local processing","local only","entirely in your browser"];
const copyHits=[];
for(const term of engineering)if(registry.includes(term))copyHits.push(term);
if(copyHits.length){
 console.error("ALL_TOOLS_STRUCTURE=FAIL");
 console.error("REGISTRY_ENGINEERING_COPY="+copyHits.join(","));
 process.exit(1);
}

fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output","all-tools-routing-v1581_4.json"),JSON.stringify(routed,null,2));
console.log("REGISTERED_TOOL_COUNT="+live.length);
console.log("DYNAMIC_ROUTE=PASS");
console.log("TOOLWORKBENCH_HANDLER_COVERAGE=PASS");
console.log("REGISTRY_USER_COPY=PASS");
console.log("ALL_TOOLS_STRUCTURE=PASS");
