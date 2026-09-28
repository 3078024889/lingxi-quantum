#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repo=process.cwd();
const read=p=>fs.readFileSync(path.join(repo,p),"utf8");
const exists=p=>fs.existsSync(path.join(repo,p));
const fail=[]; const pass=[];
const assert=(ok,msg)=>{(ok?pass:fail).push(msg)};

const required=[
 "lib/tools/engine/types.ts",
 "lib/tools/engine/catalog.ts",
 "lib/tools/engine/router.ts",
 "lib/tools/nutrition/types.ts",
 "lib/tools/nutrition/canonical.ts",
 "components/tools/FoodCalorieWorkbench.tsx",
 "lib/tools/food/ui-i18n.ts",
 "app/api/tools/food/search/route.ts",
 "app/api/tools/food/calculate/route.ts",
 "supabase/migrations/20260926153000_nutrition_engine_v2.sql",
 "scripts/nutrition/import-usda-fdc.mjs"
];

for(const p of required) {
  assert(exists(p),`required:${p}`);
}

if(exists("components/tools/ToolsHubV11.tsx")) {
  const hub=read("components/tools/ToolsHubV11.tsx");
  assert(
    !/food-calorie[\s\S]{0,240}从食物图片估算/.test(hub),
    "food card does not claim unimplemented image recognition"
  );
}

const food=read("components/tools/FoodCalorieWorkbench.tsx");
const foodI18n=read("lib/tools/food/ui-i18n.ts");

/*
 V15.90 previously checked literal Chinese UI strings:
   完整成分
   NUTRIENTS

 V16.00 moved presentation copy into 9-language dictionaries.
 Audit semantic nutrition capability instead of a specific language string.
*/

for(const token of [
  "fiber_g",
  "sugar_g",
  "sodium_mg",
  "nutrients"
]) {
  assert(food.includes(token),`food-ui:${token}`);
}

assert(
  food.includes("foodUi(lang") || food.includes("foodUi("),
  "food-ui:9-language-dictionary-wired"
);

for(const key of [
  "fullResult",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "sodium",
  "missing"
]) {
  assert(
    foodI18n.includes(`${key}:`) || foodI18n.includes(`|"${key}"`),
    `food-i18n:${key}`
  );
}

assert(
  food.includes('data-food-version="v1600"'),
  "food-ui:v1600-marker"
);

assert(
  food.includes("result.total.fiber_g"),
  "food-ui:total-fiber"
);

assert(
  food.includes("result.total.sugar_g"),
  "food-ui:total-sugar"
);

assert(
  food.includes("result.total.sodium_mg"),
  "food-ui:total-sodium"
);

const migration=read(
  "supabase/migrations/20260926153000_nutrition_engine_v2.sql"
);

for(const token of [
  "nutrition_foods",
  "nutrition_nutrients",
  "nutrition_portions",
  "search_food_nutrition_v2",
  "calculate_food_nutrition_v2",
  "pg_trgm"
]) {
  assert(migration.includes(token),`nutrition-db:${token}`);
}

const importer=read("scripts/nutrition/import-usda-fdc.mjs");

for(const token of [
  "food.csv",
  "food_nutrient.csv",
  "nutrient.csv",
  "USDA FoodData Central",
  "CC0 / Public Domain"
]) {
  assert(importer.includes(token),`nutrition-import:${token}`);
}

const catalog=read("lib/tools/engine/catalog.ts");

for(const token of [
  "paddleocr",
  "whispercpp",
  "qpdf",
  "real-esrgan",
  "readability",
  "usda-fdc",
  "BLOCKED_BY_DEFAULT"
]) {
  assert(catalog.includes(token),`engine-catalog:${token}`);
}

for(const id of [
  "ghostscript",
  "pymupdf",
  "ultralytics-yolo"
]) {
  assert(catalog.includes(id),`license-deny-recorded:${id}`);
}

console.log(`V1590_CHECKS_PASS=${pass.length}`);

for(const x of pass) {
  console.log(`PASS ${x}`);
}

if(fail.length) {
  for(const x of fail) {
    console.error(`FAIL ${x}`);
  }

  console.error(`V1590_TOTAL_AUDIT=FAIL count=${fail.length}`);
  process.exit(1);
}

console.log("V1590_TOTAL_AUDIT=PASS");