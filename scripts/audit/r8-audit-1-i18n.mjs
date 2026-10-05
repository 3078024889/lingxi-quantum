import fs from "node:fs";
import path from "node:path";

const root=process.cwd(),fail=m=>{throw new Error(m)};
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
const lingxi=fs.readFileSync(path.join(root,"lib/lingxi-i18n.ts"),"utf8");
for(const l of langs)if(!new RegExp(`\\b${l}\\b`).test(lingxi))fail("LANG_NOT_SUPPORTED:"+l);

for(const p of [
 "components/tools/ToolShell.tsx",
 "components/tools/ToolPromoStrip.tsx",
 "components/SasiStartGuide.tsx",
 "components/SasiModeHost.tsx",
 "lib/tools/card-i18n.ts",
 "lib/tools/hub-copy-v1470.ts",
 "lib/tool-runtime-i18n.ts",
 "lib/sasi/connection-i18n.ts",
 "lib/sasi/composer-i18n.ts"
]){
 if(!fs.existsSync(path.join(root,p)))fail("I18N_SURFACE_MISSING:"+p);
}

const promo=fs.readFileSync(path.join(root,"components/tools/ToolPromoStrip.tsx"),"utf8");
if(!promo.includes("toolTitle(lang,slug")||!promo.includes("toolFacts(slug,lang)"))fail("TOOL_PROMO_NOT_RUNTIME_LOCALIZED");
if(!promo.includes('lang==="zh"?item.alt'))fail("TOOL_PROMO_ALT_NOT_LOCALIZED");

const shell=fs.readFileSync(path.join(root,"components/tools/ToolShell.tsx"),"utf8");
if(!shell.includes("toolTitle(lang,tool.slug")||!shell.includes("toolCardLine(lang,tool.slug"))fail("DYNAMIC_TOOL_SHELL_NOT_LOCALIZED");

const guide=fs.readFileSync(path.join(root,"components/SasiStartGuide.tsx"),"utf8");
for(const l of langs)if(!guide.includes(`${l}:`))fail("SASI_GUIDE_LANG_MISSING:"+l);

console.log("AUDIT_1_I18N_9LANG_CORE=PASS");
console.log("TOOL_PROMO_RUNTIME_LOCALIZATION=PASS");
console.log("DYNAMIC_TOOL_SHELL_LOCALIZATION=PASS");
console.log("SASI_START_GUIDE_9LANG=PASS");
