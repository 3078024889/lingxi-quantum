#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {createClient} from "@supabase/supabase-js";

const file=process.argv[2]||path.join(process.cwd(),"data/nutrition/common-food-aliases.json");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");process.exit(2)}
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const rows=JSON.parse(fs.readFileSync(file,"utf8"));
let inserted=0,matched=0,missed=0;
for(const row of rows){
 const term=String(row.match||"").trim();
 if(!term)continue;
 const {data,error}=await db.from("nutrition_foods")
   .select("id,description_en")
   .eq("source_key","usda-fdc")
   .ilike("description_en",`%${term.replace(/[%_]/g,"\\$&")}%`)
   .limit(12);
 if(error)throw error;
 const candidates=(data||[]).sort((a,b)=>{
   const A=String(a.description_en||"").toLowerCase(),B=String(b.description_en||"").toLowerCase(),t=term.toLowerCase();
   const sa=A===t?0:A.startsWith(t)?1:2,sb=B===t?0:B.startsWith(t)?1:2;
   return sa-sb||A.length-B.length;
 }).slice(0,4);
 if(!candidates.length){missed++;continue}
 matched++;
 const aliasRows=[];
 for(const food of candidates){
   for(const [lang,names] of Object.entries(row.aliases||{})){
     for(const alias of names||[])aliasRows.push({food_id:food.id,alias:String(alias).trim(),lang,alias_kind:"curated-i18n",priority:20});
   }
 }
 if(aliasRows.length){
   const {error:e}=await db.from("nutrition_aliases").upsert(aliasRows,{onConflict:"food_id,alias,lang"});
   if(e)throw e;inserted+=aliasRows.length;
 }
}
console.log(`NUTRITION_I18N_ALIAS_SEED=PASS matched=${matched} missed=${missed} aliases=${inserted}`);
