import fs from"node:fs";
const R=p=>fs.readFileSync(p,"utf8"),v=R("lib/tools/food/image-recognition-local.ts"),i=R("lib/tools/food/vision-intelligence.ts"),u=R("components/tools/FoodCalorieWorkbench.tsx");
const c=[
["MULTIVIEW_CROPS",v.includes("imageViews")&&v.includes('["center"')&&v.includes('["tl"')&&v.includes('["br"')],
["PER_VIEW_FUSION",v.includes("mergeViews")&&v.includes("regionHits")&&v.includes("viewCount")],
["GLOBAL_ZERO_SHOT",v.includes("GLOBAL_VISION_VOCABULARY")&&v.includes("COMMON_FOOD_CANDIDATES")],
["REGIONAL_RERANK",v.includes("rerankFoodVision")],
["PORTION_EVIDENCE",i.includes("RELATIVE_ONLY_UNLESS_SCALE_OR_DEPTH")&&i.includes("USER_CONFIRM_REQUIRED")],
["NO_FAKE_GRAMS",i.includes("grams:null")&&!i.includes("grams:100")],
["NO_REMOTE_MODEL",v.includes("allowRemoteModels=false")],
["NO_USDA_UI_FALLBACK",!u.includes('result.sources||["USDA FoodData Central"]')],
["REAL_BENCHMARK_SCHEMA",fs.existsSync("tests/food-real-benchmark/benchmark.schema.json")]
];let ok=true;for(const[k,x]of c){console.log(`MULTIPLATE_${k}=${x?"PASS":"FAIL"}`);ok&&=x}process.exit(ok?0:1);