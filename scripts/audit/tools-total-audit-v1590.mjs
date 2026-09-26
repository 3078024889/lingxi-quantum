#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repo=process.cwd();
const read=p=>fs.readFileSync(path.join(repo,p),"utf8");
const exists=p=>fs.existsSync(path.join(repo,p));
const fail=[];const pass=[];
const assert=(ok,msg)=>{(ok?pass:fail).push(msg)};

const required=[
 "lib/tools/engine/types.ts","lib/tools/engine/catalog.ts","lib/tools/engine/router.ts",
 "lib/tools/nutrition/types.ts","lib/tools/nutrition/canonical.ts",
 "components/tools/FoodCalorieWorkbench.tsx","app/api/tools/food/search/route.ts","app/api/tools/food/calculate/route.ts",
 "supabase/migrations/20260926153000_nutrition_engine_v2.sql","scripts/nutrition/import-usda-fdc.mjs"
];
for(const p of required)assert(exists(p),`required:${p}`);

if(exists("components/tools/ToolsHubV11.tsx")){
 const hub=read("components/tools/ToolsHubV11.tsx");
 assert(!/food-calorie[\s\S]{0,240}从食物图片估算/.test(hub),"food card does not claim unimplemented image recognition");
}

const food=read("components/tools/FoodCalorieWorkbench.tsx");
for(const token of ["fiber_g","sugar_g","sodium_mg","完整成分","NUTRIENTS"])assert(food.includes(token),`food-ui:${token}`);
const migration=read("supabase/migrations/20260926153000_nutrition_engine_v2.sql");
for(const token of ["nutrition_foods","nutrition_nutrients","nutrition_portions","search_food_nutrition_v2","calculate_food_nutrition_v2","pg_trgm"])assert(migration.includes(token),`nutrition-db:${token}`);
const importer=read("scripts/nutrition/import-usda-fdc.mjs");
for(const token of ["food.csv","food_nutrient.csv","nutrient.csv","USDA FoodData Central","CC0 / Public Domain"])assert(importer.includes(token),`nutrition-import:${token}`);
const catalog=read("lib/tools/engine/catalog.ts");
for(const token of ["paddleocr","whispercpp","qpdf","real-esrgan","readability","usda-fdc","BLOCKED_BY_DEFAULT"])assert(catalog.includes(token),`engine-catalog:${token}`);

const dangerous=["ghostscript","pymupdf","ultralytics-yolo"];
for(const id of dangerous)assert(catalog.includes(id),`license-deny-recorded:${id}`);

console.log(`V1590_CHECKS_PASS=${pass.length}`);
for(const x of pass)console.log(`PASS ${x}`);
if(fail.length){for(const x of fail)console.error(`FAIL ${x}`);console.error(`V1590_TOTAL_AUDIT=FAIL count=${fail.length}`);process.exit(1)}
console.log("V1590_TOTAL_AUDIT=PASS");
