import fs from "node:fs";
const s=fs.readFileSync("app/api/tools/food/search/route.ts","utf8");
const start=s.indexOf("export async function GET");
if(start<0){console.log("FOOD_HANDLER=FAIL");process.exit(1)}
const body=s.slice(start);
const local=body.indexOf("searchLocalFoods"),admin=body.indexOf("createAdminClient");
const guarded=/try\s*\{\s*const admin=createAdminClient\(\)/.test(body);
const fallback=body.includes("databaseAvailable=false")&&body.includes("NO_CLEARED_SOURCE");
const pass=local>=0&&admin>=0&&local<admin&&guarded&&fallback;
console.log(`FOOD_LOCAL_BEFORE_REMOTE=${local>=0&&admin>=0&&local<admin?"PASS":"FAIL"}`);
console.log(`FOOD_REMOTE_GUARDED=${guarded?"PASS":"FAIL"}`);
console.log(`FOOD_NO_DB_FALLBACK=${fallback?"PASS":"FAIL"}`);
process.exit(pass?0:1);