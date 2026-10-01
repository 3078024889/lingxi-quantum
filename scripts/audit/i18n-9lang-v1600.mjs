#!/usr/bin/env node
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
function load(file){
 const src=fs.readFileSync(file,"utf8");
 const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const box={exports:{}};const context={module:box,exports:box.exports,require:()=>({})};
 vm.runInNewContext(js,context,{filename:file});
 return context.module.exports;
}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const composerSrc=fs.readFileSync("lib/sasi/composer-i18n.ts","utf8");
const foodSrc=fs.readFileSync("lib/tools/food/workbench-copy.ts","utf8");
const seriesSrc=fs.readFileSync("lib/sasi/series-i18n.ts","utf8");
const assemblerSrc=fs.readFileSync("lib/sasi/assembler-i18n.ts","utf8");
for(const lang of langs){
 assert(new RegExp(`const ${lang==="zh"?"zh":lang}:`).test(composerSrc),`COMPOSER_LANG_MISSING:${lang}`);
 assert(foodSrc.includes(`${lang}:{`),`FOOD_LANG_MISSING:${lang}`);
}
const composer=load("lib/sasi/composer-i18n.ts");
const food=load("lib/tools/food/workbench-copy.ts");
const series=load("lib/sasi/series-i18n.ts");
const assembler=load("lib/sasi/assembler-i18n.ts");
for(const lang of langs){
 for(const key of ["dramaTitle","buildTitle","creationSettings","rightsConsent","dramaFootnote","buildFootnote","sendDrama","sendWebsite"]){
  assert(typeof composer.composerText(lang,key)==="string"&&composer.composerText(lang,key).trim(),`COMPOSER_EMPTY:${lang}:${key}`);
 }
 for(const key of ["custom","upload","input","portion","view","next"]){
  assert(typeof food.foodText(lang,key)==="string"&&food.foodText(lang,key).trim(),`FOOD_EMPTY:${lang}:${key}`);
 }
 for(const key of ["title","lead","script","service","quote","assemble"]){
  assert(typeof series.seriesText(lang,key)==="string"&&series.seriesText(lang,key).trim(),`SERIES_EMPTY:${lang}:${key}`);
 }
 for(const key of ["title","lead","add","ratio","start","download"]){
  assert(typeof assembler.assemblerText(lang,key)==="string"&&assembler.assemblerText(lang,key).trim(),`ASSEMBLER_EMPTY:${lang}:${key}`);
 }
}
const studio=fs.readFileSync("components/SasiChatCreationStudio.tsx","utf8");
assert(studio.includes("useLingxiLang"),"COMPOSER_NOT_USING_GLOBAL_LANGUAGE");
assert(studio.includes("composerText"),"COMPOSER_NOT_USING_9LANG_DICT");
assert(!studio.includes('language:"zh"'),"COMPOSER_PROJECT_LANGUAGE_STILL_HARDCODED");
const calories=fs.readFileSync("components/tools/FoodCalorieWorkbench.tsx","utf8");
assert(calories.includes("foodText"),"FOOD_UI_NOT_9LANG");
assert(!calories.includes('const zh=lang==="zh"'),"FOOD_UI_STILL_BINARY_ZH_EN");
const seriesUi=fs.readFileSync("components/SasiMultiEpisodeWorkspace.tsx","utf8");
assert(seriesUi.includes("seriesText"),"SERIES_UI_NOT_9LANG");
const assemblerUi=fs.readFileSync("app/sasi/VideoAssembler.tsx","utf8");
assert(assemblerUi.includes("assemblerText"),"ASSEMBLER_UI_NOT_9LANG");
const proposal=fs.readFileSync("lib/sasi/project-proposal.ts","utf8");
for(const lang of langs)assert(proposal.includes(`"${lang}"`),`PROJECT_LANGUAGE_MISSING:${lang}`);
const functionMenuSrc=fs.readFileSync("lib/sasi/function-menu-i18n.ts","utf8");
for(const lang of langs)assert(functionMenuSrc.includes(`${lang}:`)||functionMenuSrc.includes(`const ${lang}:`),`FUNCTION_MENU_LANG_MISSING:${lang}`);
const functionMenuUi=fs.readFileSync("components/SasiFunctionMenu.tsx","utf8");
assert(functionMenuUi.includes("localizedFunctionOptions"),"FUNCTION_MENU_I18N_NOT_WIRED");
assert(functionMenuUi.includes("useLingxiLang"),"FUNCTION_MENU_LANGUAGE_HOOK_MISSING");
console.log("I18N_9_LANG_V1600=PASS");
