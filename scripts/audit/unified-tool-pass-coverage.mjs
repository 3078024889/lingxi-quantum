#!/usr/bin/env node
/**
 * Conservative static coverage audit for the all-tools pass.
 * Gate must remain red until every published tool has a genuine start-of-use
 * authorization point and legacy per-tool charge has been retired.
 * Static coverage is never a substitute for real browser and payment tests.
 */
import {readFileSync,existsSync} from "node:fs";
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
 const relatives=code.split("\n").flatMap(line=>{
  const marker=line.includes("from './")?"from './":line.includes('from "./')?'from "./':"";
  return marker?[line.split(marker)[1]?.split(marker[5])[0]||""]:[];
 });
 imports.push(...relatives.filter(Boolean));
 return imports.some(x=>checkComponent("components/tools/"+x+".tsx",depth+1,seen));
};
const rows=slugs.map(slug=>{
 const p=join(dedicatedRoot,slug,"page.tsx");
 if(!existsSync(p))return {slug,entry:"generic",covered:fallbackCovered};
 const page=read("app/tools/"+slug+"/page.tsx");
 const redirect=page.match(/redirect\s*\(\s*["\x27]\/tools\/([a-z0-9-]+)["\x27]\s*\)/);
 if(redirect){
  const target=redirect[1];
  const targetPage=join(dedicatedRoot,target,"page.tsx");
  return {slug,entry:"redirect",covered:slugs.includes(target)&&!existsSync(targetPage)&&fallbackCovered,redirectTarget:target};
 }
 const imports=[...page.matchAll(/from\s*["']@\/components\/tools\/([^"']+)["']/g)].map(x=>x[1]);
 const covered=imports.some(x=>checkComponent("components/tools/"+x+".tsx"));
 return {slug,entry:"dedicated",covered,imports};
});
const missing=rows.filter(row=>!row.covered);
// Migration means NEW invoices are prohibited, not historical payment records deleted.
// Each old route is retained for paid fulfillment, refunds and reconciliation only.
const mustContain={
 "app/api/tools/quote/route.ts":["toolPassCutoverRequested()","SINGLE_TOOL_CHECKOUT_RETIRED"],
 "app/api/tools/pay/create/route.ts":["toolPassCutoverRequested()","SINGLE_TOOL_CHECKOUT_RETIRED",'quote.status==="paid"'],
 "app/api/tools/free-export/route.ts":["toolPassCutoverRequested()","SINGLE_TOOL_CHECKOUT_RETIRED","tool_export_requests"],
 "app/api/tools/pricing/route.ts":["toolPassCutoverRequested()","SINGLE_TOOL_PRICING_RETIRED"],
 "app/api/tools/quote/topup/route.ts":["toolPassCutoverRequested()","SINGLE_TOOL_TOPUP_RETIRED"],
 "components/tools/PaidExportButton.tsx":["TOOL_PASS_ENFORCED","ToolPassUpgradeLink","legacyResume"],
 "components/tools/PaidActionButton.tsx":["TOOL_PASS_ENFORCED","ToolPassUpgradeLink","legacyResume"]
};
const legacyAudit=Object.entries(mustContain).map(([path,rules])=>{
 const found=existsSync(join(root,path));
 const src=found?read(path):"";
 const missingGuards=rules.filter(rule=>!src.includes(rule));
 return {path,preservedForHistory:found,protected:found&&missingGuards.length===0,missingGuards};
});
const incompleteLegacy=legacyAudit.filter(row=>!row.protected);
const summary={catalogCount:slugs.length,staticLikelyCovered:rows.length-missing.length,
 unverified:missing.map(x=>({slug:x.slug,entry:x.entry,imports:x.imports||[]})),
 legacyHistoryPreserved:legacyAudit.filter(x=>x.preservedForHistory).map(x=>x.path),
 legacyUnretiredEntrypoints:incompleteLegacy,
 staticToolAndLegacyGuardsPassed:missing.length===0&&incompleteLegacy.length===0,
 note:"Other independent gates: backend API execution coverage, payment/refund browser E2E, production-schema staging. This audit alone cannot authorize deployment."};
process.stdout.write(JSON.stringify(summary,null,2)+"\n");
if(!summary.staticToolAndLegacyGuardsPassed)process.exitCode=1;
