const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cache=new Map();
function load(file){
 file=path.resolve(root,file);if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const m={exports:{}};cache.set(file,m);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(p=>p.startsWith('@/')?load(p.slice(2)):p.startsWith('.')?load(path.resolve(path.dirname(file),p)):require(p),m,m.exports);return m.exports;
}
const {searchReferenceFoods}=load('lib/tools/food/reference-catalog.ts');
const {portionValue,totalMeal,calculateReferences}=load('lib/tools/food/meal-calculation.ts');
const {mealInsight}=load('lib/tools/food/meal-insights.ts');
const queries=['蓝莓','blueberries','ブルーベリー','블루베리','myrtilles','Heidelbeeren','arándanos','mirtilos','توت أزرق'];
for(const query of queries)assert(searchReferenceFoods(query).some(f=>/blueberr/i.test(f.name_en)),query);
for(const query of ['油条','油條','youtiao','taco','タコス','타코','寿司','tofu','quinoa'])assert(searchReferenceFoods(query).length,query);
assert.equal(searchReferenceFoods('not-a-real-food-xyz').length,0);
assert.equal(portionValue(''),null);assert.equal(portionValue('0'),null);assert.equal(portionValue('-1'),null);assert.equal(portionValue('Infinity'),null);assert.equal(portionValue('10001'),null);assert.equal(portionValue('1e3'),null);assert.equal(portionValue('85,5'),85.5);
const blueberry=searchReferenceFoods('blueberries').find(f=>f.name_en==='Blueberries, raw'&&f.per100.kcal===57);assert(blueberry);
const meal=calculateReferences([{food:blueberry,grams:'200'}]);assert.equal(meal.total.kcal,114);
const partial=totalMeal([{food_id:1,name_zh:'a',grams:100,kcal:100,fiber_g:2},{food_id:2,name_zh:'b',grams:50,kcal:50,fiber_g:null}]);assert.equal(partial.total.fiber_g,null);assert.equal(partial.total.kcal,150);
assert.equal(mealInsight({kcal:400,protein_g:30,carbs_g:35,fat_g:10,fiber_g:null}).summaryKey,'recorded');
const tfda=searchReferenceFoods('油条')[0];assert.equal(tfda.name_zh,'油条');assert.equal(tfda.per100.kcal,551);assert(tfda.source_url.includes('8543'));
console.log('PASS: 9-language lookup, regional dishes, real reference values, portion validation, missing nutrients, advice boundaries');
