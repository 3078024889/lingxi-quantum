import{localFoodById,searchLocalFoods,calcLocalFood}from"./local-catalog";
const BASE=919000000;
type Composite={food_id:number;code:string;name_zh:string;name_en:string;aliases:string[];parts:{q:string;ratio:number}[]};
const C:Composite[]=[
 {food_id:BASE+1,code:"fruit-salad-estimated",name_zh:"水果沙拉（基础水果估算）",name_en:"Fruit salad (fruit-only estimate)",aliases:["水果沙拉","fruit salad","水果拼盘","fruit platter","mixed fruit"],parts:[{q:"apple",ratio:.34},{q:"banana",ratio:.33},{q:"orange",ratio:.33}]}
];
const norm=(x:string)=>x.trim().toLowerCase().replace(/\s+/g,"");
export const isCompositeFoodId=(id:number)=>C.some(x=>x.food_id===id);
export function searchCompositeFoods(q:string){const n=norm(q);return C.filter(x=>[x.name_zh,x.name_en,...x.aliases].map(norm).some(a=>a===n||a.includes(n)||n.includes(a))).map(x=>({...x,category:"复合餐",score:95,nutrition_available:true,source:"LINGXIFIELD recipe estimate",provenance:{providerId:"recipe-estimate",licenseStatus:"derived",method:"weighted local reference foods"}}));}
export function calcCompositeFood(id:number,grams:number){const c=C.find(x=>x.food_id===id);if(!c)return null;const parts=c.parts.map(p=>{const hit=searchLocalFoods(p.q,1)[0]as any;if(!hit)return null;return calcLocalFood(Number(hit.food_id),grams*p.ratio)}).filter(Boolean)as any[];if(parts.length!==c.parts.length)return null;const sum=(k:string)=>parts.every(x=>x[k]!=null&&Number.isFinite(Number(x[k])))?parts.reduce((a,x)=>a+(x[k]==null?0:Number(x[k])),0):null;return{food_id:c.food_id,code:c.code,name_zh:c.name_zh,name_en:c.name_en,grams,kcal:sum("kcal"),protein_g:sum("protein_g"),carbs_g:sum("carbs_g"),fat_g:sum("fat_g"),fiber_g:sum("fiber_g"),sugar_g:sum("sugar_g"),sodium_mg:sum("sodium_mg"),estimated:true,estimate_note:"按苹果/香蕉/橙子的基础水果配比估算；若含沙拉酱、奶油、坚果等，请分别添加。"};}
