#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";
const root=process.cwd(),must=[
 "lib/tools/engine/types.ts","lib/tools/engine/license-registry.ts","lib/tools/engine/catalog.ts","lib/tools/engine/stage-graph.ts","lib/tools/engine/router.ts","lib/tools/engine/resource-governor.ts","lib/tools/engine/server/command.ts","lib/tools/engine/server/probe.ts",
 "lib/tools/engine/server/adapters/qpdf.ts","lib/tools/engine/server/adapters/pdfcpu.ts","lib/tools/engine/server/adapters/ffmpeg.ts","lib/tools/engine/server/adapters/whispercpp.ts","lib/tools/engine/server/adapters/python.ts",
 "services/local-engine/python/paddle_ocr.py","services/local-engine/python/argos_translate.py","services/local-engine/python/opencv_inpaint.py","app/api/tools/engine/health/route.ts",
 "scripts/nutrition/prepare-usda-copy.mjs","supabase/migrations/20260926161000_nutrition_private_runtime_v1591.sql"
];let fail=0;for(const p of must){const ok=fs.existsSync(path.join(root,p));console.log(`${ok?"PASS":"FAIL"} ${p}`);if(!ok)fail++}
const graph=fs.readFileSync(path.join(root,"lib/tools/engine/stage-graph.ts"),"utf8");for(const x of ["pdf-ocr","food-calorie","video-transcription","subtitle-translate","privacy-cleaner"]){const ok=graph.includes(`g(\"${x}\"`);console.log(`${ok?"PASS":"FAIL"} graph:${x}`);if(!ok)fail++}
const sql=fs.readFileSync(path.join(root,"supabase/migrations/20260926161000_nutrition_private_runtime_v1591.sql"),"utf8");for(const x of ["revoke all on public.nutrition_sources","search_food_nutrition_v3","statement_timeout","drop policy if exists nutrition_foods_public_read"]){const ok=sql.includes(x);console.log(`${ok?"PASS":"FAIL"} nutrition-security:${x}`);if(!ok)fail++}
const cat=fs.readFileSync(path.join(root,"lib/tools/engine/catalog.ts"),"utf8");for(const x of ["pdfcpu","opencc","jieba","nutrition5k","gfpgan-review"]){const ok=cat.includes(x);console.log(`${ok?"PASS":"FAIL"} catalog:${x}`);if(!ok)fail++}
const foodBlock=(graph.split('g(\"food-calorie\"')[1]||'').split('g(\"food-photo-analysis\"')[0]||'';if(foodBlock.includes('nutrition5k')){console.log("FAIL Nutrition5k must not be food-calorie fallback");fail++}else console.log("PASS Nutrition5k separated from food-calorie lookup");
if(fail){console.error(`V1591_RUNTIME_AUDIT=FAIL count=${fail}`);process.exit(1)}console.log("V1591_RUNTIME_AUDIT=PASS");
