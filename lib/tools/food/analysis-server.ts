import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {referenceFoodById} from './reference-catalog';
import {calcLocalFood} from './local-catalog';
import {calcCompositeFood} from './composite-catalog';
import {calculateReferences,NUTRIENTS,totalMeal,type MealItem} from './meal-calculation';
import type {AnalysisInput} from './analysis-input';

export async function resolveFoodMeal(inputs:AnalysisInput[]){
 const out:MealItem[]=[];
 for(const input of inputs){
  const {food_id,grams}=input;
  const reference=food_id===0?{food_id:0,name_zh:input.label!,name_en:input.label!,per100:input.per100,source:'User-provided nutrition label'}:referenceFoodById(food_id);
  if(reference){const meal=calculateReferences([{food:reference,grams:String(grams)}]);if(!meal)throw new Error('INVALID_FOOD_ITEMS');out.push(meal.items[0]);continue;}
  const composite=calcCompositeFood(food_id,grams);
  if(composite){out.push({...composite,source:'LINGXIFIELD recipe estimate'});continue;}
  const local=calcLocalFood(food_id,grams);
  if(local){out.push({...local,source:'LINGXIFIELD Curated References'});continue;}
  const {data,error}=await createAdminClient().rpc('calculate_food_compact_v1',{p_items:[{food_id,grams}]});
  if(error||data?.items?.length!==1)throw new Error('FOOD_UNAVAILABLE');
  const row=data.items[0];
  if(Number(row.food_id)!==food_id)throw new Error('FOOD_UNAVAILABLE');
  const item:MealItem={food_id,grams,name_zh:String(row.name_zh||row.name_en||''),name_en:String(row.name_en||''),source:String(row.source_label||row.source_key||'Nutrition database')};
  for(const key of NUTRIENTS){const n=row.nutrients?.[key==='kcal'?'energy_kcal':key];item[key]=n==null?null:Number(n);}
  if(item.kcal==null||!Number.isFinite(item.kcal))throw new Error('FOOD_UNAVAILABLE');
  out.push(item);
 }
 const result=totalMeal(out);if(result.total.kcal==null||!Number.isFinite(result.total.kcal))throw new Error('FOOD_UNAVAILABLE');return result;
}
