// Imported by the server search route only. Never send the complete catalog to a browser.
import records from '@/data/nutrition/reference-foods.json';
import taiwan from '@/data/nutrition/tfda-foods.json';
import aliases from '@/data/nutrition/common-food-aliases.json';
import {COMMON_FOOD_VOCABULARY} from './common-food-vocabulary';
import {GLOBAL_FOOD_IDENTITIES} from './global-food-identity';
import {resolveFoodEntity} from './entity-resolver';
import type {FoodChoice,Nutrients} from './meal-calculation';

type Reference={id:number;name:string;n:Nutrients;portions:{label:string;grams:number}[]};
const BASE=1000000000;
export const normalizeReferenceQuery=(s:string)=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[_\W]+/g,' ').trim();
const normalizeAlias=(s:string)=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim().replace(/\s+/g,' ');
const terms=new Map<string,string>();
for(const a of aliases)for(const [lang,names] of Object.entries(a.aliases))for(const name of names){const n=normalizeAlias(name);terms.set(n,a.match);if(['fr','es','pt'].includes(lang))terms.set(n+'s',a.match);if(lang==='de')terms.set(n+'n',a.match);}
terms.set('heidelbeere','blueberries');terms.set('heidelbeeren','blueberries');
for(const f of COMMON_FOOD_VOCABULARY){terms.set(normalizeAlias(f.zh),f.label);}
for(const f of GLOBAL_FOOD_IDENTITIES)for(const a of f.aliases)if(!terms.has(normalizeAlias(a)))terms.set(normalizeAlias(a),f.names.en.split('/')[0].trim());
const index=(records as Reference[]).map(food=>({food,text:normalizeReferenceQuery(food.name)}));
export function referenceFoodById(id:number):FoodChoice|null{
 const regional=taiwan.find(f=>f.id===id);
 if(regional)return {food_id:id,name_zh:regional.name_zh,name_en:regional.name_en||regional.name_zh,source:'Taiwan FDA · Open Government Data License 1.0',source_url:'https://data.gov.tw/dataset/8543',per100:regional.n};
 const food=(records as Reference[]).find(f=>BASE+f.id===id);
 return food?{food_id:id,name_zh:food.name,name_en:food.name,displayNames:referenceNames(food.name),source:'USDA FoodData Central · CC0',source_url:`https://fdc.nal.usda.gov/food-details/${food.id}/nutrients`,per100:food.n,portions:food.portions.slice(0,8)}:null;
}
export function referenceSearchTerm(raw:string){
 const exact=terms.get(normalizeAlias(raw));if(exact)return exact;
 const entity=resolveFoodEntity(raw);return entity.confidence===1?entity.canonical:raw;
}
export function searchReferenceFoods(raw:string,limit=16):FoodChoice[]{
 const identity=GLOBAL_FOOD_IDENTITIES.find(f=>[f.key,...f.aliases].some(a=>normalizeAlias(a)===normalizeAlias(raw)));
 const native=normalizeAlias(identity?.names.zh||raw);
 const regional=(taiwan as {id:number;name_zh:string;name_en:string;aliases:string[];n:Nutrients}[]).filter(f=>[f.name_zh,f.name_en,...f.aliases].some(a=>a&&normalizeAlias(a).includes(native))).sort((a,b)=>Number(b.name_zh===raw)-Number(a.name_zh===raw)).slice(0,limit).map(f=>({food_id:f.id,name_zh:f.name_zh,name_en:f.name_en||f.name_zh,source:'Taiwan FDA · Open Government Data License 1.0',source_url:'https://data.gov.tw/dataset/8543',manualOnly:true,per100:f.n}));
 const query=referenceSearchTerm(raw),normalized=normalizeReferenceQuery(query);
 if(!normalized||/[^\x00-\x7F]/.test(query))return regional;
 const tokens=normalized.split(' ').filter(Boolean).map(x=>x.endsWith('ies')?x.slice(0,-3)+'y':x.length>3&&x.endsWith('s')?x.slice(0,-1):x);
 const international=index.map(({food,text})=>{
  const words=text.split(' ').map(x=>x.endsWith('ies')?x.slice(0,-3)+'y':x.length>3&&x.endsWith('s')?x.slice(0,-1):x);
  if(!tokens.every(t=>words.includes(t)))return null;
  const score=(text===normalized?1000:0)+(text.startsWith(normalized)?100:0)+(text.includes('raw')?10:0)-text.length/100;
  return {food,score};
 }).filter((x):x is NonNullable<typeof x>=>x!==null).sort((a,b)=>b.score-a.score).slice(0,limit).map(({food})=>({
  food_id:BASE+food.id,name_zh:food.name,name_en:food.name,displayNames:referenceNames(food.name),source:'USDA FoodData Central · CC0',source_url:`https://fdc.nal.usda.gov/food-details/${food.id}/nutrients`,manualOnly:true,per100:food.n,portions:food.portions.slice(0,8)
 }));
 return [...regional,...international].slice(0,limit);
}
function referenceNames(description:string):Record<string,string>{
 const normalized=normalizeReferenceQuery(description);
 const entry=aliases.find(a=>normalized===normalizeReferenceQuery(a.match)||normalized.startsWith(normalizeReferenceQuery(a.match)+' '));
 if(!entry)return {};
 return Object.fromEntries(Object.entries(entry.aliases).map(([lang,values])=>[lang,`${values[0]} · ${description}`]));
}
