export type MealTotals={kcal?:number|null;protein_g?:number|null;carbs_g?:number|null;fat_g?:number|null;fiber_g?:number|null;sugar_g?:number|null;sodium_mg?:number|null};
export type MealInsight={tone:"good"|"watch"|"add";key:string;value?:number;};
const n=(x:unknown)=>Number.isFinite(Number(x))?Number(x):null;
export function analyzeMeal(t:MealTotals):MealInsight[]{
 const out:MealInsight[]=[];const kcal=n(t.kcal),p=n(t.protein_g),fiber=n(t.fiber_g),sodium=n(t.sodium_mg),sugar=n(t.sugar_g);
 if(p!=null) out.push({tone:p>=25?"good":"add",key:p>=25?"protein_good":"protein_add",value:p});
 if(fiber!=null) out.push({tone:fiber>=8?"good":"add",key:fiber>=8?"fiber_good":"fiber_add",value:fiber});
 if(sodium!=null&&sodium>=900)out.push({tone:"watch",key:"sodium_high",value:sodium});
 if(sugar!=null&&sugar>=25)out.push({tone:"watch",key:"sugar_high",value:sugar});
 if(kcal!=null&&kcal>=900)out.push({tone:"watch",key:"energy_dense",value:kcal});
 if(!out.length)out.push({tone:"good",key:"recorded"});
 return out.slice(0,4);
}
export function nextMealActions(insights:MealInsight[]){
 const keys=new Set(insights.map(x=>x.key)),out:string[]=[];
 if(keys.has("fiber_add"))out.push("add_plants");
 if(keys.has("protein_add"))out.push("add_protein");
 if(keys.has("sodium_high"))out.push("less_salt");
 if(keys.has("sugar_high"))out.push("less_sugar");
 if(keys.has("energy_dense"))out.push("lighter_next");
 if(!out.length)out.push("keep_variety");
 return out.slice(0,3);
}
