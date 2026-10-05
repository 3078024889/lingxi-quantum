import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const fail=(m)=>{throw new Error(m)};

const hub=read("components/tools/ToolsHubV11.tsx");
const surface=read("lib/tools/public-surface.ts");
const advanced=read("lib/tools/advanced-catalog.ts");
const seo=read("lib/seo/global-seo.ts");

if(!hub.includes('import {publicToolSurface} from "@/lib/tools/public-surface";'))fail("HUB_UNIFIED_IMPORT_MISSING");
if(hub.includes('import { liveTools } from "@/lib/tools/registry";'))fail("HUB_STILL_BOUND_TO_OLD_REGISTRY");
if(!hub.includes("for(const tool of publicToolSurface())"))fail("HUB_NOT_RENDERING_UNIFIED_SURFACE");
if(!surface.includes("ADVANCED_TOOLS"))fail("PUBLIC_SURFACE_ADVANCED_MISSING");
if(!surface.includes("liveTools()"))fail("PUBLIC_SURFACE_REGISTRY_MISSING");

const routeRoot=path.join(root,"app","tools");
const routeSlugs=fs.readdirSync(routeRoot,{withFileTypes:true})
  .filter(d=>d.isDirectory()&&fs.existsSync(path.join(routeRoot,d.name,"page.tsx")))
  .map(d=>d.name);

const advancedSlugs=[...advanced.matchAll(/href:"\/tools\/([^"]+)"/g)].map(m=>m[1]);
const duplicate=[...new Set(advancedSlugs.filter((x,i,a)=>a.indexOf(x)!==i))];
if(duplicate.length)fail("ADVANCED_DUPLICATE_SLUGS:"+duplicate.join(","));

const critical=[
 "batch-pdf","pdf-protect","pdf-unlock","pdf-permissions","pdf-web-optimize",
 "pdf-inspect","pdf-attachments","pdf-bookmarks","pdf-overlay","pdf-header-footer",
 "pdf-bates-numbering","pdf-remove-annotations","pdf-grayscale","pdf-page-size",
 "pdf-metadata-editor","regex-tester","text-diff","csv-json","xml-formatter",
 "jwt-decoder","url-parser","case-converter","number-base-converter",
 "reverse-video","loop-video","stop-motion-video","audio-cleanup","cron-parser"
];

for(const slug of critical){
 if(!routeSlugs.includes(slug))fail("CRITICAL_ROUTE_MISSING:"+slug);
 if(!advancedSlugs.includes(slug))fail("CRITICAL_DISCOVERY_MISSING:"+slug);
}

const seoSlugs=[...seo.matchAll(/\{slug:"([^"]+)"/g)].map(m=>m[1]);
for(const slug of critical){
 if(!seoSlugs.includes(slug))fail("CRITICAL_SEO_MISSING:"+slug);
}

for(const slug of advancedSlugs){
 if(!routeSlugs.includes(slug))fail("ADVANCED_ROUTE_MISSING:"+slug);
}

console.log(`ROUTE_COUNT=${routeSlugs.length}`);
console.log(`ADVANCED_DISCOVERY_COUNT=${advancedSlugs.length}`);
console.log(`GLOBAL_SEO_COUNT=${new Set(seoSlugs).size}`);
console.log("UNIFIED_PUBLIC_SURFACE=PASS");
console.log("CRITICAL_NEW_TOOLS_VISIBLE_SOURCE=PASS");
console.log("ADVANCED_ROUTE_COVERAGE=PASS");
console.log("SEO_COVERAGE=PASS");
console.log("TOOL_SURFACE_REFACTOR_R2=PASS");
