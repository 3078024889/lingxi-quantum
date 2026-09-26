import fs from "node:fs";
import path from "node:path";

const repo=process.cwd();
const assert=(v,m)=>{if(!v)throw new Error(m)};
const read=p=>fs.readFileSync(path.join(repo,p),"utf8");

assert(!fs.existsSync(path.join(repo,"app/api/ai/food-analyze/route.ts")),"FOOD_REMOTE_AI_ROUTE_STILL_EXISTS");

const food=read("components/tools/FoodCalorieWorkbench.tsx");
assert(!food.includes("/api/ai/"),"FOOD_WORKBENCH_REMOTE_AI_REFERENCE_REMAINS");
assert(food.includes("/api/tools/food/search"),"FOOD_DB_SEARCH_MISSING");
assert(food.includes("/api/tools/food/calculate"),"FOOD_DB_CALC_MISSING");

const search=read("app/api/tools/food/search/route.ts");
assert(search.includes("search_food_nutrition"),"FOOD_SEARCH_RPC_MISSING");

const calc=read("app/api/tools/food/calculate/route.ts");
assert(calc.includes("calculate_food_nutrition"),"FOOD_CALC_RPC_MISSING");

console.log("FOOD_REMOTE_AI_ROUTE_REMOVED=PASS");
console.log("FOOD_DETERMINISTIC_SEARCH=PASS");
console.log("FOOD_DETERMINISTIC_CALC=PASS");
console.log("V15.72_FOOD_NON_AI_RETIREMENT_AUDIT=PASS");
