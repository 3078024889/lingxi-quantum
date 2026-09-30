import fs from"node:fs";let ok=true;const R=f=>fs.readFileSync(f,"utf8");
const checks=[
["FOOD_DB_GUARD",R("app/api/tools/food/search/route.ts").includes("databaseAvailable=false")&&R("app/api/tools/food/search/route.ts").includes("try{")],
["FOOD_LOCAL_FIRST",(()=>{const s=R("app/api/tools/food/search/route.ts"),body=s.slice(s.indexOf("export async function GET"));return body.indexOf("searchLocalFoods")>=0&&body.indexOf("createAdminClient")>=0&&body.indexOf("searchLocalFoods")<body.indexOf("createAdminClient")})()],
["CALC_DB_GUARD",R("app/api/tools/food/manual-calculate/route.ts").includes('reason:"DATABASE_UNAVAILABLE"')],
["SUPPORT_DB_GUARD",R("app/api/support/tickets/route.ts").includes("try{admin=createAdminClient()}catch{return null}")],
["NOTIFICATION_DB_GUARD",R("app/api/notifications/route.ts").includes("databaseAvailable:false")],
["FOOD_SINGLE_PROJECT",R("playwright.food.config.ts").includes('name:"food-result"')],
["MAIN_EXCLUDES_FOOD",R("playwright.final.config.ts").includes("food-results.spec.ts")],
["NO_ADMIN_SECRET_IN_TEST",!R("playwright.food.config.ts").includes("SERVICE_ROLE")&&!R("playwright.food.config.ts").includes("SECRET_KEY")],
["VERSION",R("lib/release/version.ts").includes("2026.09.30.8")&&R("lib/release/version.ts").includes("4.8.5")]
];for(const[n,v]of checks){console.log(`RESILIENCE_${n}=${v?"PASS":"FAIL"}`);ok&&=v}process.exit(ok?0:1);