#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import {createClient} from "@supabase/supabase-js";

const root=process.argv[2];
if(!root){console.error("Usage: node scripts/nutrition/import-usda-fdc.mjs <extracted FoodData Central CSV folder> [foundation,legacy,survey,branded]");process.exit(2)}
const wanted=new Set((process.argv[3]||"foundation,legacy").toLowerCase().split(",").map(x=>x.trim()).filter(Boolean));
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");process.exit(2)}
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

function file(name){const p=path.join(root,name);if(!fs.existsSync(p))throw new Error(`Missing ${p}`);return p}

async function* csvRows(filePath){
 const stream=fs.createReadStream(filePath,{encoding:"utf8"});
 let row=[],field="",quoted=false,headers=null;
 for await(const chunk of stream){
  for(let i=0;i<chunk.length;i++){
   const c=chunk[i];
   if(quoted){if(c==='"'){if(chunk[i+1]==='"'){field+='"';i++}else quoted=false}else field+=c;continue}
   if(c==='"'){quoted=true;continue}
   if(c===','){row.push(field);field="";continue}
   if(c==='\n'){row.push(field.replace(/\r$/,""));field="";if(!headers)headers=row.map(x=>x.replace(/^\ufeff/,""));else{const o={};headers.forEach((h,j)=>o[h]=row[j]??"");yield o}row=[];continue}
   field+=c;
  }
 }
 if(field.length||row.length){row.push(field.replace(/\r$/,""));if(!headers)headers=row;else{const o={};headers.forEach((h,j)=>o[h]=row[j]??"");yield o}}
}

const dataTypeKey=(s="")=>{const x=s.toLowerCase();if(x.includes("foundation"))return"foundation";if(x.includes("sr legacy"))return"legacy";if(x.includes("survey"))return"survey";if(x.includes("branded"))return"branded";return"other"};
const num=x=>{const n=Number(x);return Number.isFinite(n)?n:null};
const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||"")?x:null;
const norm=x=>(x||"").trim().toLowerCase();

const nutrientDefs=[
 ["energy_kcal","kcal",["energy","energy (atwater general factors)","energy (atwater specific factors)"]],
 ["protein_g","g",["protein"]],["carbs_g","g",["carbohydrate, by difference","carbohydrate"]],["fat_g","g",["total lipid (fat)","total fat"]],
 ["fiber_g","g",["fiber, total dietary","dietary fiber"]],["sugar_g","g",["sugars, total including nlea","sugars, total"]],["added_sugar_g","g",["sugars, added"]],["starch_g","g",["starch"]],
 ["saturated_fat_g","g",["fatty acids, total saturated"]],["monounsaturated_fat_g","g",["fatty acids, total monounsaturated"]],["polyunsaturated_fat_g","g",["fatty acids, total polyunsaturated"]],["trans_fat_g","g",["fatty acids, total trans"]],["cholesterol_mg","mg",["cholesterol"]],
 ["sodium_mg","mg",["sodium, na"]],["potassium_mg","mg",["potassium, k"]],["calcium_mg","mg",["calcium, ca"]],["iron_mg","mg",["iron, fe"]],["magnesium_mg","mg",["magnesium, mg"]],["phosphorus_mg","mg",["phosphorus, p"]],["zinc_mg","mg",["zinc, zn"]],["copper_mg","mg",["copper, cu"]],["manganese_mg","mg",["manganese, mn"]],["selenium_ug","µg",["selenium, se"]],
 ["vitamin_a_ug","µg",["vitamin a, rae"]],["vitamin_c_mg","mg",["vitamin c, total ascorbic acid"]],["vitamin_d_ug","µg",["vitamin d (d2 + d3)","vitamin d"]],["vitamin_e_mg","mg",["vitamin e (alpha-tocopherol)"]],["vitamin_k_ug","µg",["vitamin k (phylloquinone)"]],["thiamin_mg","mg",["thiamin"]],["riboflavin_mg","mg",["riboflavin"]],["niacin_mg","mg",["niacin"]],["pantothenic_acid_mg","mg",["pantothenic acid"]],["vitamin_b6_mg","mg",["vitamin b-6"]],["folate_ug","µg",["folate, total"]],["vitamin_b12_ug","µg",["vitamin b-12"]],
 ["water_g","g",["water"]],["caffeine_mg","mg",["caffeine"]],["alcohol_g","g",["alcohol, ethyl"]],
];

const nutrientNameMap=new Map();for(const [code,unit,aliases] of nutrientDefs)for(const a of aliases)nutrientNameMap.set(norm(a),{code,unit});
const nutrientIdMap=new Map();
for await(const r of csvRows(file("nutrient.csv"))){
 const def=nutrientNameMap.get(norm(r.name));if(!def)continue;
 const srcUnit=norm(r.unit_name).replace("mcg","ug");const expected=def.unit.toLowerCase().replace("µ","u");
 if(def.code==="energy_kcal"&&!srcUnit.includes("kcal"))continue;
 if(def.code!=="energy_kcal"&&expected&&srcUnit&&srcUnit!==expected)continue;
 nutrientIdMap.set(String(r.id),{...def,name:r.name});
}
console.log(`NUTRIENT_MAP=${nutrientIdMap.size}`);

const selected=[];
for await(const r of csvRows(file("food.csv"))){if(wanted.has(dataTypeKey(r.data_type)))selected.push(r)}
console.log(`FOODS_SELECTED=${selected.length}`);

await db.from("nutrition_sources").upsert({source_key:"usda-fdc",label:"USDA FoodData Central",license:"CC0 / Public Domain",source_url:"https://fdc.nal.usda.gov",dataset_version:path.basename(root),metadata:{data_types:[...wanted]}},{onConflict:"source_key"});

const idMap=new Map();
for(let i=0;i<selected.length;i+=500){
 const batch=selected.slice(i,i+500).map(r=>({source_key:"usda-fdc",source_food_id:String(r.fdc_id),description_en:r.description||`FDC ${r.fdc_id}`,category:r.food_category_id||null,data_type:r.data_type||null,publication_date:date(r.publication_date),source_url:`https://fdc.nal.usda.gov/fdc-app.html#/food-details/${r.fdc_id}/nutrients`}));
 const {data,error}=await db.from("nutrition_foods").upsert(batch,{onConflict:"source_key,source_food_id"}).select("id,source_food_id");
 if(error)throw error;for(const x of data||[])idMap.set(String(x.source_food_id),Number(x.id));
 if(i%5000===0)console.log(`FOODS_IMPORTED=${Math.min(i+500,selected.length)}/${selected.length}`);
}

let nutrients=[];let ncount=0;
for await(const r of csvRows(file("food_nutrient.csv"))){
 const foodId=idMap.get(String(r.fdc_id));const def=nutrientIdMap.get(String(r.nutrient_id));if(!foodId||!def)continue;
 const amount=num(r.amount);if(amount==null)continue;
 nutrients.push({food_id:foodId,nutrient_code:def.code,amount_per_100g:amount,unit:def.unit,source_nutrient_id:String(r.nutrient_id),source_nutrient_name:def.name,data_points:num(r.data_points),min_value:num(r.min),max_value:num(r.max),median_value:num(r.median)});
 if(nutrients.length>=1000){const {error}=await db.from("nutrition_nutrients").upsert(nutrients,{onConflict:"food_id,nutrient_code"});if(error)throw error;ncount+=nutrients.length;nutrients=[];if(ncount%50000===0)console.log(`NUTRIENTS_IMPORTED=${ncount}`)}
}
if(nutrients.length){const {error}=await db.from("nutrition_nutrients").upsert(nutrients,{onConflict:"food_id,nutrient_code"});if(error)throw error;ncount+=nutrients.length}

if(fs.existsSync(path.join(root,"food_portion.csv"))){
 const ids=[...idMap.values()];for(let i=0;i<ids.length;i+=500){const{error}=await db.from("nutrition_portions").delete().in("food_id",ids.slice(i,i+500));if(error)throw error}
 let portions=[];for await(const r of csvRows(file("food_portion.csv"))){const foodId=idMap.get(String(r.fdc_id));const gw=num(r.gram_weight);if(!foodId||!gw||gw<=0)continue;portions.push({food_id:foodId,amount:num(r.amount)||1,measure:r.modifier||null,description:r.portion_description||null,gram_weight:gw,sequence_no:num(r.seq_num)});if(portions.length>=1000){const {error}=await db.from("nutrition_portions").insert(portions);if(error)throw error;portions=[]}}if(portions.length){const {error}=await db.from("nutrition_portions").insert(portions);if(error)throw error}}

const aliases={
 "米饭":["rice, white, cooked","rice, cooked"],"白米饭":["rice, white, cooked"],"糙米":["rice, brown, cooked"],"面包":["bread"],"白面包":["bread, white"],"全麦面包":["bread, whole"],"吐司":["bread, toasted"],"鸡蛋":["egg, whole"],"水煮蛋":["hard-boiled egg"],"蛋白":["egg white"],"蛋黄":["egg yolk"],"鸡胸肉":["chicken breast"],"鸡肉":["chicken"],"牛肉":["beef"],"猪肉":["pork"],"鱼":["fish"],"苹果":["apple"],"香蕉":["banana"],"橙子":["orange"],"葡萄":["grape"],"草莓":["strawberry"],"牛奶":["milk"],"酸奶":["yogurt"],"奶酪":["cheese"],"土豆":["potato"],"红薯":["sweet potato"],"玉米":["corn"],"燕麦":["oat"],"西兰花":["broccoli"],"菠菜":["spinach"],"生菜":["lettuce"],"番茄":["tomato"],"黄瓜":["cucumber"],"胡萝卜":["carrot"],"洋葱":["onion"],"蘑菇":["mushroom"],"豆腐":["tofu"],"花生":["peanut"],"杏仁":["almond"],"核桃":["walnut"],"腰果":["cashew"],"米粉":["rice noodle"],"面条":["noodle"],"意大利面":["pasta"],"饺子":["dumpling"],"包子":["steamed bun"],"汉堡":["hamburger"],"披萨":["pizza"],"薯条":["french fries"],"巧克力":["chocolate"],"饼干":["cookie"],"蛋糕":["cake"],"冰淇淋":["ice cream"],"咖啡":["coffee"],"茶":["tea"],"可乐":["cola"],"豆浆":["soy milk"]};
const aliasRows=[];
for(const [zh,terms] of Object.entries(aliases)){
 const matches=selected.filter(f=>terms.some(t=>norm(f.description).includes(t))).slice(0,30);
 for(const m of matches){const foodId=idMap.get(String(m.fdc_id));if(foodId)aliasRows.push({food_id:foodId,alias:zh,lang:"zh",alias_kind:"curated",priority:10})}
}
for(let i=0;i<aliasRows.length;i+=1000){const {error}=await db.from("nutrition_aliases").upsert(aliasRows.slice(i,i+1000),{onConflict:"food_id,alias,lang"});if(error)throw error}

await db.from("nutrition_sources").update({row_count:selected.length,imported_at:new Date().toISOString(),metadata:{data_types:[...wanted],nutrients_imported:ncount}}).eq("source_key","usda-fdc");
console.log(`USDA_FDC_IMPORT=PASS foods=${selected.length} nutrients=${ncount} aliases=${aliasRows.length}`);
