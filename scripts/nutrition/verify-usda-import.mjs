#!/usr/bin/env node
import {createClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");process.exit(2)}
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const tables=["nutrition_foods","nutrition_nutrients","nutrition_portions","nutrition_aliases"];
const counts={};
for(const table of tables){
 const {count,error}=await db.from(table).select("*",{count:"exact",head:true});
 if(error)throw error;counts[table]=count??0;
}
const {data:dragon,error}=await db.rpc("search_food_nutrition_v3",{p_queries:["dragon fruit","火龙果"],p_limit:12});
if(error)throw error;
const ok=counts.nutrition_foods>5000&&counts.nutrition_nutrients>10000&&Array.isArray(dragon)&&dragon.length>0;
console.log(JSON.stringify({counts,dragonFruitMatches:Array.isArray(dragon)?dragon.length:0},null,2));
if(!ok){console.error("USDA_FDC_VERIFY=FAIL");process.exit(1)}
console.log("USDA_FDC_VERIFY=PASS");
