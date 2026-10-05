import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root=process.cwd();
const fail=(m)=>{throw new Error(m)};
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");

const advanced=read("lib/tools/advanced-catalog.ts");
const hrefs=[...advanced.matchAll(/href:"(\/tools\/[^"]+)"/g)].map(m=>m[1]);
const dup=[...new Set(hrefs.filter((x,i,a)=>a.indexOf(x)!==i))];
if(dup.length)fail("ADVANCED_DUPLICATE_SLUGS:"+dup.join(","));

const hubPath=path.join(root,"components/tools/ToolsHubV11.tsx");
const hub=read("components/tools/ToolsHubV11.tsx");
const sf=ts.createSourceFile(hubPath,hub,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
if((sf.parseDiagnostics??[]).length)fail("HUB_PARSE_FAILED");

let hasUnified=false,hasOld=false,allTools=null;
for(const stmt of sf.statements){
  if(ts.isImportDeclaration(stmt)&&ts.isStringLiteral(stmt.moduleSpecifier)){
    if(stmt.moduleSpecifier.text==="@/lib/tools/public-surface")hasUnified=true;
    if(stmt.moduleSpecifier.text==="@/lib/tools/registry")hasOld=true;
  }
  if(ts.isFunctionDeclaration(stmt)&&stmt.name?.text==="allTools")allTools=stmt;
}
if(!hasUnified)fail("HUB_UNIFIED_IMPORT_MISSING");
if(hasOld)fail("HUB_OLD_REGISTRY_IMPORT_PRESENT");
if(!allTools||!allTools.getText(sf).includes("publicToolSurface()"))fail("HUB_NOT_USING_UNIFIED_SURFACE");

const critical=[
 "batch-pdf","pdf-protect","pdf-unlock","pdf-permissions","pdf-web-optimize",
 "pdf-inspect","pdf-attachments","pdf-bookmarks","pdf-overlay","pdf-header-footer",
 "pdf-bates-numbering","pdf-remove-annotations","pdf-grayscale","pdf-page-size",
 "pdf-metadata-editor","regex-tester","text-diff","csv-json","xml-formatter",
 "jwt-decoder","url-parser","case-converter","number-base-converter",
 "reverse-video","loop-video","stop-motion-video","audio-cleanup","cron-parser"
];

const routeRoot=path.join(root,"app","tools");
const routeSlugs=fs.readdirSync(routeRoot,{withFileTypes:true})
 .filter(d=>d.isDirectory()&&fs.existsSync(path.join(routeRoot,d.name,"page.tsx")))
 .map(d=>d.name);
const advancedSlugs=hrefs.map(x=>x.replace("/tools/",""));
const seo=read("lib/seo/global-seo.ts");
const seoSlugs=[...seo.matchAll(/\{slug:"([^"]+)"/g)].map(m=>m[1]);

for(const slug of critical){
  if(!routeSlugs.includes(slug))fail("CRITICAL_ROUTE_MISSING:"+slug);
  if(!advancedSlugs.includes(slug))fail("CRITICAL_DISCOVERY_MISSING:"+slug);
  if(!seoSlugs.includes(slug))fail("CRITICAL_SEO_MISSING:"+slug);
}
for(const slug of advancedSlugs){
  if(!routeSlugs.includes(slug))fail("ADVANCED_ROUTE_MISSING:"+slug);
}

console.log("ADVANCED_DUPLICATE_SLUGS=PASS");
console.log("UNIFIED_PUBLIC_SURFACE=PASS");
console.log("CRITICAL_NEW_TOOLS_VISIBLE_SOURCE=PASS");
console.log("ADVANCED_ROUTE_COVERAGE=PASS");
console.log("SEO_COVERAGE=PASS");
console.log("TOOL_SURFACE_REFACTOR_R4=PASS");
