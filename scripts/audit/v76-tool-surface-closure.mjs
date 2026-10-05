import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const fail=(m)=>{throw new Error(m)};
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");

const hub=read("components/tools/ToolsHubV11.tsx");
const surface=read("lib/tools/public-surface.ts");
const advanced=read("lib/tools/advanced-catalog.ts");
const seo=read("lib/seo/global-seo.ts");

if(!hub.includes('publicToolSurface'))fail("HUB_NOT_USING_UNIFIED_SURFACE");
if(hub.includes('import { liveTools } from "@/lib/tools/registry";'))fail("HUB_STILL_DIRECTLY_BOUND_TO_BASE_REGISTRY");
if(!surface.includes("ADVANCED_TOOLS"))fail("SURFACE_MISSING_ADVANCED_CATALOG");
if(!surface.includes("liveTools()"))fail("SURFACE_MISSING_BASE_REGISTRY");

const routeRoot=path.join(root,"app","tools");
const routeSlugs=fs.readdirSync(routeRoot,{withFileTypes:true})
  .filter(d=>d.isDirectory()&&fs.existsSync(path.join(routeRoot,d.name,"page.tsx")))
  .map(d=>d.name)
  .sort();

const advancedSlugs=[...advanced.matchAll(/href:"\/tools\/([^"]+)"/g)].map(m=>m[1]);
const dup=advancedSlugs.filter((x,i,a)=>a.indexOf(x)!==i);
if(dup.length)fail("ADVANCED_DUPLICATE_SLUGS:"+[...new Set(dup)].join(","));

const critical=[
 "batch-pdf","pdf-protect","pdf-unlock","pdf-permissions","pdf-web-optimize",
 "pdf-inspect","pdf-attachments","pdf-bookmarks","pdf-overlay","pdf-header-footer",
 "pdf-bates-numbering","pdf-remove-annotations","pdf-grayscale","pdf-page-size",
 "pdf-metadata-editor","regex-tester","text-diff","csv-json","xml-formatter",
 "jwt-decoder","url-parser","case-converter","number-base-converter",
 "reverse-video","loop-video","stop-motion-video","audio-cleanup","cron-parser"
];

const missingRoute=critical.filter(x=>!routeSlugs.includes(x));
if(missingRoute.length)fail("CRITICAL_ROUTE_MISSING:"+missingRoute.join(","));
const missingAdvanced=critical.filter(x=>!advancedSlugs.includes(x));
if(missingAdvanced.length)fail("CRITICAL_DISCOVERY_MISSING:"+missingAdvanced.join(","));

const seoSlugs=[...seo.matchAll(/\{slug:"([^"]+)"/g)].map(m=>m[1]);
const missingSeo=critical.filter(x=>!seoSlugs.includes(x));
if(missingSeo.length)fail("CRITICAL_SEO_MISSING:"+missingSeo.join(","));

for(const slug of advancedSlugs){
 if(!routeSlugs.includes(slug))fail(`ADVANCED_ROUTE_MISSING:${slug}`);
}

console.log(`ROUTE_COUNT=${routeSlugs.length}`);
console.log(`ADVANCED_DISCOVERY_COUNT=${advancedSlugs.length}`);
console.log(`GLOBAL_SEO_COUNT=${new Set(seoSlugs).size}`);
console.log("UNIFIED_PUBLIC_SURFACE=PASS");
console.log("CRITICAL_NEW_TOOLS_VISIBLE_SOURCE=PASS");
console.log("ADVANCED_ROUTE_COVERAGE=PASS");
console.log("SEO_COVERAGE=PASS");
console.log("TOOL_SURFACE_REFACTOR=PASS");
