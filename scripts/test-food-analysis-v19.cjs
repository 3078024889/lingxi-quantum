const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
let calls=0;
function load(name){
 let file=path.resolve(root,name);if(!path.extname(file))file+='.ts';
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(p=>p==='server-only'?{}:p==='@/lib/supabase/admin'?{createAdminClient:()=>({rpc:async()=>{calls++;return {error:{message:'unavailable'}}}})}:p.startsWith('@/')?load(p.slice(2)):p.startsWith('.')?load(path.resolve(path.dirname(file),p)):require(p),mod,mod.exports);
 return mod.exports;
}
(async()=>{
 const {parseFoodGroups,foodQuantity}=load('lib/tools/food/analysis-input.ts');
 const {resolveFoodMeal}=load('lib/tools/food/analysis-server.ts');
 const {searchReferenceFoods}=load('lib/tools/food/reference-catalog.ts');
 const groups=parseFoodGroups([[{food_id:919000001,grams:100},{food_id:919000001,grams:50}]]);
 assert.equal(foodQuantity(groups,'custom'),1);assert.equal(foodQuantity([groups[0],groups[0]],'image'),2);
 const salad=await resolveFoodMeal(groups.flat());assert(salad.total.kcal>0);assert.equal(salad.items.length,2);assert.equal(calls,0,'composite must not use legacy database calculation');
 for(const q of ['blueberries','油条','apple']){const hits=searchReferenceFoods(q);assert(hits.length,q);const food=hits[0];const meal=await resolveFoodMeal([{food_id:food.food_id,grams:150}]);assert.equal(meal.items[0].kcal,food.per100.kcal*1.5);assert(meal.items[0].source_url);}
 const label=parseFoodGroups([[{food_id:0,grams:200,label:'My cereal',per100:{kcal:200,protein_g:5,carbs_g:30,fat_g:7}}]]);
 const meal=await resolveFoodMeal(label.flat());assert.equal(meal.total.kcal,400);assert.equal(meal.total.sodium_mg,null);
 for(const grams of [0,-1,10001,NaN,'100'])assert.throws(()=>parseFoodGroups([[{food_id:1,grams}]]));
 assert.throws(()=>parseFoodGroups([[{food_id:0,grams:100,label:'bad',per100:{kcal:9000}}]]));
 assert.throws(()=>parseFoodGroups([[]]));assert.throws(()=>parseFoodGroups([Array.from({length:31},()=>({food_id:1,grams:100}))]));
 await assert.rejects(resolveFoodMeal([{food_id:123456789,grams:100}]),/FOOD_UNAVAILABLE/);
 const {foodBillingText}=load('lib/tools/food/billing-copy.ts');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])for(const key of ['pricing','freeNow','ready','saved','retry','used','unavailable','expired','edit'])assert.notEqual(foodBillingText(lang,key),key);
 console.log('PASS: composite/reference/label calculation, missing nutrients, distinct-food pricing, invalid portions, database failures, nine-language billing.');
})().catch(e=>{console.error(e);process.exitCode=1});
