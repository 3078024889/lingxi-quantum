export const NUTRIENTS = ['kcal','protein_g','carbs_g','fat_g','fiber_g','sugar_g','sodium_mg'] as const;
export type Nutrients = Partial<Record<typeof NUTRIENTS[number], number | null>>;
export type FoodChoice = {food_id:number;name_zh:string;name_en?:string|null;displayNames?:Record<string,string>;source?:string;source_url?:string;manualOnly?:boolean;per100?:Nutrients;portions?:{label:string;grams:number}[]};
export type MealItem = FoodChoice & Nutrients & {grams:number};
export type MealResult = {items:MealItem[];total:Nutrients & {grams:number};sources:string[]};

// Keep editing state as text; validate only when adding or calculating.
export function portionValue(text:string):number|null {
 if(!/^\d+(?:[.,]\d+)?$/.test(text.trim()))return null;
 const n=Number(text.replace(',','.'));return Number.isFinite(n)&&n>0&&n<=10000?n:null;
}
export function totalMeal(items:MealItem[]):MealResult {
 const total:MealResult['total']={grams:items.reduce((s,x)=>s+x.grams,0)};
 for(const key of NUTRIENTS) total[key]=items.every(x=>typeof x[key]==='number'&&Number.isFinite(x[key]))?items.reduce((s,x)=>s+(x[key] as number),0):null;
 return {items,total,sources:[...new Set(items.map(x=>x.source||'').filter(Boolean))]};
}
export function calculateReferences(items:{food:FoodChoice;grams:string}[]):MealResult|null {
 if(!items.length||items.length>30)return null;
 const out:MealItem[]=[];
 for(const {food,grams:text} of items){
  const grams=portionValue(text);if(grams===null||!food.per100)return null;
  const item:MealItem={...food,grams};
  for(const key of NUTRIENTS){const value=food.per100[key];item[key]=typeof value==='number'&&Number.isFinite(value)?value*grams/100:null;}
  out.push(item);
 }
 return totalMeal(out);
}
