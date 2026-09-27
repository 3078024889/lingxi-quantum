import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {searchLocalFoods} from "@/lib/tools/food/local-catalog";
export const runtime="nodejs";
function terms(input:string){return Array.from(new Set(input.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean))).slice(0,8)}
function publicCandidate(item:any){return{food_id:Number(item.food_id),code:String(item.code||""),name_zh:String(item.name_zh||""),name_en:item.name_en?String(item.name_en):null,category:item.category?String(item.category):null,score:Number(item.score||0)}}
export async function GET(req:NextRequest){
 const q=new URL(req.url).searchParams.get("q")?.trim()||"";if(!q||q.length>120)return NextResponse.json({items:[]});
 const admin=createAdminClient(),rows:any[]=[];const qs=terms(q);
 for(const term of qs)for(const item of searchLocalFoods(term,8))rows.push(item);
 const {data:v3,error:v3e}=await admin.rpc("search_food_nutrition_v3",{p_queries:qs,p_limit:24});
 if(!v3e)for(const item of v3||[])rows.push(item);
 else for(const term of qs){const{data}=await admin.rpc("search_food_nutrition_v2",{p_query:term,p_limit:8});for(const item of data||[])rows.push(item)}
 const seen=new Set<number>();
 const items=rows.filter(item=>{const id=Number(item.food_id);if(!Number.isInteger(id)||id<=0||seen.has(id))return false;seen.add(id);return true}).sort((a,b)=>Number(b.score||0)-Number(a.score||0)).slice(0,24).map(publicCandidate);
 return NextResponse.json({items},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}
