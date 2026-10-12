import fs from "node:fs";
import path from "node:path";
const retired=[
 "scripts/audit-autonomy-v1583.mjs",
 "app/sasi/SasiComposer.tsx",
 "app/sasi/SasiProjectMemory.tsx",
 "components/SasiDramaLaunch.tsx",
 "app/sasi/SasiWorkspace.tsx",
 "app/sasi/SasiV3Panels.tsx",
 "app/sasi/SasiProductionPanels.tsx",
 "components/SasiSkillsPanel.tsx",
 "scripts/accept-v1466.mjs",
 "scripts/accept-v14462.mjs",
 "scripts/accept-v14460.mjs",
 "scripts/patch-sasi-workspace-v1465.mjs",
 "scripts/patch-sasi-production-v1465.mjs",
 "scripts/apply-source-patches-v1465.mjs",
 "tests/final-closure/r33-sasi-skill-creator.spec.ts",
 "scripts/accept-v14492.mjs",
 "scripts/accept-v14512.mjs",
 "scripts/audit/platform-stability-v9.mjs",
 "scripts/audit/platform-stability-v10.mjs",
 "scripts/audit/platform-stability-v11.mjs",
 "scripts/audit/platform-stability-v12.mjs",
 "scripts/audit/platform-stability-v13.mjs",
 "scripts/audit/retired-language-cleanup-v10.mjs",
 "scripts/audit/retired-language-cleanup-v11.mjs",
 "scripts/audit/retired-language-cleanup-v12.mjs",
 "scripts/audit/retired-language-cleanup-v13.mjs",
 "tests/final-closure/language-stability.spec.ts",
 "tests/final-closure/language-stability-v10.spec.ts",
 "tests/final-closure/language-stability-v11.spec.ts",
 "tests/final-closure/language-stability-v12.spec.ts",
 "tests/final-closure/language-stability-v13.spec.ts",
 "public/vendor/transformers",
 "public/onnxruntime"
];
const remains=retired.filter(p=>fs.existsSync(p));
if(fs.existsSync("lib/tools/platform/platform"))throw new Error("NESTED_PLATFORM_DIRECTORY_REMAINS");
if(remains.length)throw new Error(`RETIRED_PACKAGE_ARTIFACTS_REMAIN:${remains.join(",")}`);
const retiredModules=retired.filter(p=>/\.[cm]?[jt]sx?$/.test(p)).map(p=>p.replace(/\.[cm]?[jt]sx?$/,""));
function inspectImports(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())inspectImports(file);
  else if(/\.[cm]?[jt]sx?$/.test(entry.name)){
   const source=fs.readFileSync(file,"utf8");
   for(const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g)){
    const spec=match[1];
    if(!spec.startsWith(".")&&!spec.startsWith("@/"))continue;
    const resolved=(spec.startsWith("@/")?spec.slice(2):path.relative(".",path.resolve(path.dirname(file),spec))).replaceAll("\\","/").replace(/\.[cm]?[jt]sx?$/,"");
    if(retiredModules.includes(resolved))throw new Error(`RETIRED_RUNTIME_IMPORT:${file}:${spec}`);
   }
  }
 }
}
for(const dir of ["app","components","lib"])inspectImports(dir);
for(const name of ["LINGXIFIELD_SOURCE_INVENTORY.json","LINGXIFIELD_PROTECTED_MANIFEST.json"]){
 const manifest=JSON.parse(fs.readFileSync(name,"utf8"));
 const stale=(manifest.files||[]).filter(row=>retired.includes(row.path));
 if(stale.length)throw new Error(`RETIRED_MANIFEST_REFERENCES:${name}:${stale.map(row=>row.path).join(",")}`);
}
const burnToken=fs.readFileSync("lib/tools/burn-link-token.ts","utf8");
if(burnToken.includes("isTrustedBurnWebViewRequest"))throw new Error("RETIRED_BURN_WEBVIEW_EXEMPTION_RETURNED");

const css=fs.readFileSync("app/globals.css","utf8");
const i18n=fs.readFileSync("lib/lingxi-i18n.ts","utf8");
if(css.includes("html.lang-en"))throw new Error("OLD_LANG_EN_CSS_RETURNED");
if(/(^|\n)\s*\[data-lang\s*=\s*["']en["']\]\s*\{\s*display\s*:\s*none/i.test(css))throw new Error("ROOT_HIDE_RULE_RETURNED");
if(/classList\.toggle\(\s*["']lang-en["']/.test(i18n))throw new Error("OLD_LANG_RUNTIME_RETURNED");

console.log("RETIRED_VERSIONED_STABILITY_FILES=0");
console.log("RETIRED_LANGUAGE_IMPLEMENTATION=0");
console.log("OLD_PACKAGE_ARTIFACTS=0");
console.log("OLD_MEDIA_RUNTIME_RESIDUALS=0");
console.log("NESTED_PLATFORM_DIRECTORIES=0");
console.log("RETIRED_CODE_CLEANUP=PASS");
