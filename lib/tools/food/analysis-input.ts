import {NUTRIENTS, type Nutrients} from './meal-calculation';

export type AnalysisInput = {food_id:number;grams:number;label?:string;per100?:Nutrients};
export function parseFoodGroups(value:unknown):AnalysisInput[][] {
  if(!Array.isArray(value)||!value.length||value.length>20)throw new Error('INVALID_FOOD_ITEMS');
  let count=0;
  const groups=value.map(group=>{
    if(!Array.isArray(group)||!group.length)throw new Error('INVALID_FOOD_ITEMS');
    return group.map((x):AnalysisInput=>{
      count++;
      if(!x||!Number.isSafeInteger(x.food_id)||x.food_id<0||typeof x.grams!=='number'||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000)throw new Error('INVALID_FOOD_ITEMS');
      if(x.food_id!==0)return {food_id:x.food_id,grams:x.grams};
      const label=typeof x.label==='string'?x.label.trim():'';
      if(!label||label.length>100||!x.per100)throw new Error('INVALID_LABEL');
      const per100:Nutrients={};
      for(const key of NUTRIENTS){
        const n=x.per100[key];
        if(n==null){per100[key]=null;continue;}
        const max=key==='kcal'?900:key==='sodium_mg'?100000:100;
        if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>max)throw new Error('INVALID_LABEL');
        per100[key]=n;
      }
      if(['kcal','protein_g','carbs_g','fat_g'].some(k=>per100[k as keyof Nutrients]==null))throw new Error('INVALID_LABEL');
      return {food_id:0,grams:x.grams,label,per100};
    });
  });
  if(count>30)throw new Error('INVALID_FOOD_ITEMS');
  return groups;
}
export function foodQuantity(groups:AnalysisInput[][],mode:'image'|'custom'){
  if(mode==='image')return groups.length;
  return new Set(groups.flat().map(x=>x.food_id?String(x.food_id):JSON.stringify([x.label?.normalize('NFKC').toLowerCase(),x.per100]))).size;
}
