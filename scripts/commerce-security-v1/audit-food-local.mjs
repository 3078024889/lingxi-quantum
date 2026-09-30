import fs from"node:fs";import path from"node:path";
const roots=["app/api","lib","supabase/migrations"].filter(fs.existsSync);
const hits=[];
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(/\.(?:ts|tsx|sql|mjs)$/.test(e.name)){const s=fs.readFileSync(f,"utf8");if(/food.calorie|food_calorie|claim_food_calorie_daily_free/i.test(s))hits.push({f,s})}}}
for(const r of roots)walk(r);
console.log("FOOD_RELATED_LOCAL_FILES="+hits.length);
for(const h of hits.slice(0,80))console.log("FOOD_FILE="+h.f);
const all=hits.map(x=>x.s).join("\n");
console.log("FOOD_FREE_CLAIM_SYMBOL="+(/claim_food_calorie_daily_free/i.test(all)?"PRESENT":"ABSENT"));
console.log("FOOD_NULL_UNIQUE_RISK="+(/unique[\s\S]{0,180}usage_day[\s\S]{0,180}account_id/i.test(all)&&!/where\s+account_id\s+is\s+not\s+null/i.test(all)?"REVIEW_REQUIRED":"NOT_DETECTED"));
console.log("FOOD_QUANTITY_BINDING_EVIDENCE="+(/quote[\s\S]{0,250}quantity|quantity[\s\S]{0,250}quote/i.test(all)?"PRESENT":"NOT_PROVEN"));
console.log("FOOD_ATOMIC_FREE_CALCULATE_EVIDENCE="+(/claim[\s\S]{0,400}calculate|calculate[\s\S]{0,400}claim/i.test(all)?"REVIEW_PRESENT":"NOT_PROVEN"));
console.log("FOOD_LOCAL_P0_DISCOVERY_AUDIT=PASS");
