#!/usr/bin/env node
/**
 * Conservative static coverage audit for the all-tools pass.
 * Gate must remain red until every published tool has a genuine start-of-use
 * authorization point and legacy per-tool charge has been retired.
 * Static coverage is never a substitute for real browser and payment tests.
 */
import {readFileSync,readdirSync,existsSync} from "node:fs";
import {join,resolve} from "node:path";
const root=resolve(process.cwd());
const read=path=>readFileSync(join(root,path),"utf8");
const catalog=read("lib/seo/global-seo.ts");
const left=catalog.indexOf("export const GLOBAL_TOOL_CATALOG=");
const right=catalog.indexOf("export type GlobalTool",left);
if(left<0||right<left)throw Error("GLOBAL_TOOL_CATALOG_NOT_FOUND");
const slugs=[...catalog.slice(left,right).matchAll(/slug:\s*["']([^"']+)["']/g)].map(x=>x[1]);
if(slugs.length<100||slugs.length!==new Set(slugs).size)throw Error("INVALID_PUBLISHED_TOOL_CATALOG");
const dedicatedRoot=join(root,"app/tools");
const fallback=read("components/tools/ToolWorkbench.tsx");
const fallbackCovered=fallback.includes("claimToolStart")&&fallback.includes("FileDropzone");
if(!fallbackCovered)throw Error("GENERIC_WORKBENCH_UNMETERED");
const checkComponent=(file,depth=0,seen=new Set())=>{
 if(depth>5||seen.has(file)||!existsSync(join(root,file)))return false;
 seen.add(file);
 const code=read(file);
 if(code.includes("claimToolStart(")||code.includes("<FileDropzone"))return true;
 // Note: this only identifies a likely wiring path, never guarantees
 // authorization is placed before the processing side effect.
 const imports=[...code.matchAll(/from\s*["']@\/components\/tools\/([^"']+)["']/g)].map(x=>x[1]);
 return imports.some(x=>checkComponent("components/tools/"+x+".tsx",depth+1,seen));
};
const rows=slugs.map(slug=>{
 const p=join(dedicatedRoot,slug,"page.tsx");
 if(!existsSync(p))return {slug,entry:"generic",covered:fallbackCovered};
 const page=read("app/tools/"+slug+"/page.tsx");
 const imports=[...page.matchAll(/from\s*["']@\/components\/tools\/([^"']+)["']/g)].map(x=>x[1]);
 const covered=imports.some(x=>checkComponent("components/tools/"+x+".tsx"));
 return {slug,entry:"dedicated",covered,imports};
});
const missing=rows.filter(row=>!row.covered);
const legacy=[
 "app/api/tools/quote/route.ts",
 "app/api/tools/pay/create/route.ts",
 "app/api/tools/free-export/route.ts",
 "components/tools/PaidExportButton.tsx",
 "components/tools/PaidActionButton.tsx",
].filter(path=>existsSync(join(root,path)));
const summary={catalogCount:slugs.length,staticLikelyCovered:rows.length-missing.length,
 unverified:missing.map(x=>({slug:x.slug,entry:x.entry,imports:x.imports||[]})),
 legacyPaymentEntrypoints:legacy,fullyMigrated:missing.length===0&&legacy.length===0};
process.stdout.write(JSON.stringify(summary,null,2)+"\n");
if(!summary.fullyMigrated)process.exitCode=1;
