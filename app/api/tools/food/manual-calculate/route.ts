import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{enforceAbuseGuard}from"@/lib/security/abuse-guard";
import{isLocalFoodId,calcLocalFood}from"@/lib/tools/food/local-catalog";
export const runtime="nodejs";type FoodInput={food_id:number;grams:number};const n=(x:any,k:string)=>{const v=x?.nutrients?.[k];return v==null?null:Number(v)};
function remoteItem(x:any){return{food_id:Number(x.food_id),code:String(x.source_food_id||""),name_zh:String(x.name_zh||x.name_en||""),name_en:String(x.name_en||""),grams:Number(x.grams),kcal:n(x,"energy_kcal"),protein_g:n(x,"protein_g"),carbs_g:n(x,"carbs_g"),fat_g:n(x,"fat_g"),fiber_g:n(x,"fiber_g"),sugar_g:n(x,"sugar_g"),sodium_mg:n(x,"sodium_mg"),nutrients:x.nutrients||{},source:String(x.source_label||x.source_key||"Nutrition database"),provenance:{providerId:String(x.source_key||"nutrition-db"),licenseStatus:"cleared"}}}
const sum=(xs:any[],k:string)=>xs.some(x=>x[k]!=null)?xs.reduce((a,x)=>a+(x[k]==null?0:Number(x[k])),0):null;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const guard=await enforceAbuseGuard(req,{scope:"food-manual-calc",accountLimit:120,ipLimit:180,windowSeconds:3600});if(!guard.ok)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});
 const b=await req.json().catch(()=>null)as any,raw:unknown[]=Array.isArray(b?.items)?b.items:[];if(!raw.length||raw.length>30)return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const items:FoodInput[]=raw.map((x:any)=>({food_id:Number(x.food_id),grams:Number(x.grams)}));if(items.some(x=>!Number.isInteger(x.food_id)||x.food_id<=0||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000))return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const local=items.filter(x=>isLocalFoodId(x.food_id)),remote=items.filter(x=>!isLocalFoodId(x.food_id)),out:any[]=[];
 for(const x of local){const v=calcLocalFood(x.food_id,x.grams);if(v)out.push({...v,source:"LINGXIFIELD Curated References",provenance:{providerId:"local-curated",licenseStatus:"cleared"}});}
 if(remote.length){try{const admin=createAdminClient();const{data,error}=await admin.rpc("calculate_food_compact_v1",{p_items:remote});if(error)return NextResponse.json({error:"CALCULATION_UNAVAILABLE",reason:"DATABASE_UNAVAILABLE"},{status:503});out.push(...(data?.items||[]).map(remoteItem));}catch{return NextResponse.json({error:"CALCULATION_UNAVAILABLE",reason:"DATABASE_UNAVAILABLE"},{status:503});}}
 if(out.length!==items.length)return NextResponse.json({error:"CALCULATION_UNAVAILABLE"},{status:503});
 const total={food_id:0,code:"meal",name_zh:"合计",name_en:"Total",grams:sum(out,"grams"),kcal:sum(out,"kcal"),protein_g:sum(out,"protein_g"),carbs_g:sum(out,"carbs_g"),fat_g:sum(out,"fat_g"),fiber_g:sum(out,"fiber_g"),sugar_g:sum(out,"sugar_g"),sodium_mg:sum(out,"sodium_mg")};
 return NextResponse.json({items:out,total,manual:true,sources:Array.from(new Set(out.map(x=>x.source))),provenance:out.map(x=>x.provenance)},{headers:{"Cache-Control":"private, no-store"}});
}