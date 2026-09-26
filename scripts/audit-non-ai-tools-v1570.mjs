import fs from "node:fs";import path from "node:path";
const repo=process.cwd(),read=p=>fs.readFileSync(path.join(repo,p),"utf8"),assert=(v,m)=>{if(!v)throw new Error(m)};
const food=read("components/tools/FoodCalorieWorkbench.tsx");
assert(!food.includes("/api/ai/"),"FOOD_REMOTE_AI_ROUTE_REMAINS");
assert(food.includes("/api/tools/food/search"),"FOOD_DB_SEARCH_MISSING");
assert(food.includes("/api/tools/food/calculate"),"FOOD_DETERMINISTIC_CALC_MISSING");
assert(food.includes('engine:"deterministic-food-db"'),"FOOD_ENGINE_TAG_MISSING");

const search=read("app/api/tools/food/search/route.ts");
assert(search.includes("search_food_nutrition"),"FOOD_SEARCH_RPC_MISSING");
const calc=read("app/api/tools/food/calculate/route.ts");
assert(calc.includes("calculate_food_nutrition"),"FOOD_CALC_RPC_MISSING");

const video=read("components/tools/VideoToolkitWorkbench.tsx");
assert(!video.includes("/api/ai/"),"VIDEO_TOOLKIT_REMOTE_AI_ROUTE_REMAINS");
assert(video.includes("@ffmpeg/ffmpeg"),"VIDEO_TOOLKIT_FFMPEG_MISSING");

const registry=read("lib/tools/registry.ts");
assert(registry.includes("localOnly: true"),"LOCAL_ONLY_TOOL_METADATA_MISSING");

console.log("FOOD_REMOTE_AI_REMOVED=PASS");
console.log("FOOD_DETERMINISTIC_DB_PATH=PASS");
console.log("VIDEO_DETERMINISTIC_FFMPEG_PATH=PASS");
console.log("NON_AI_FIRST_TOOL_POLICY_AUDIT=PASS");
