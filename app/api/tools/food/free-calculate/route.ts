import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";import {createClient} from "@/lib/supabase/server";import {createAdminClient} from "@/lib/supabase/admin";import {isSameOriginMutation} from "@/lib/sasi/request-security";import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const runtime="nodejs";
const n=(x:any,k:string)=>{const v=x?.nutrients?.[k];return v==null?null:Number(v)};
function ip(req:NextRequest){return(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("x-real-ip")?.trim()||"unknown").slice(0,128)}
function legacyItem(x:any){return{food_id:Number(x.food_id),code:String(x.source_food_id||""),name_zh:String(x.name_zh||x.name_en||""),name_en:String(x.name_en||""),grams:Number(x.grams),kcal:n(x,"energy_kcal"),protein_g:n(x,"protein_g"),carbs_g:n(x,"carbs_g"),fat_g:n(x,"fat_g"),fiber_g:n(x,"fiber_g"),sugar_g:n(x,"sugar_g"),sodium_mg:n(x,"sodium_mg"),nutrients:x.nutrients||{},source:"USDA FoodData Central"}}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 const guard=await enforceAbuseGuard(req,{scope:"food-free",userId:user?.id||null,accountLimit:4,ipLimit:6,windowSeconds:86400});if(!guard.ok)return NextResponse.json({error:"今天的免费体验已经使用过了。"},{status:429});
 const b=await req.json().catch(()=>null) as any,raw=Array.isArray(b?.items)?b.items:[];if(!raw.length||raw.length>30)return NextResponse.json({error:"请先确认食物。"},{status:400});
 const items=raw.map((x:any)=>({food_id:Number(x.food_id),grams:Number(x.grams)}));if(items.some((x:any)=>!Number.isInteger(x.food_id)||x.food_id<=0||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000))return NextResponse.json({error:"请重新确认食物和份量。"},{status:400});
 const admin=createAdminClient(),hash=createHash("sha256").update(ip(req)).digest("hex");
 const claim=await admin.rpc("claim_food_calorie_daily_free_v15",{p_account_id:user?.id||null,p_ip_hash:hash});if(claim.error||claim.data!==true)return NextResponse.json({error:"今天的免费体验已经使用过了。",freeUsed:true},{status:409});
 const{data,error}=await admin.rpc("calculate_food_compact_v1",{p_items:items});if(error)return NextResponse.json({error:"这次没有算完，请稍后再试。"}, {status:503});
 const out=(data?.items||[]).map(legacyItem),tn=data?.total?.nutrients||{},total={food_id:0,code:"meal",name_zh:"合计",name_en:"Total",grams:items.reduce((s:number,x:any)=>s+x.grams,0),kcal:n({nutrients:tn},"energy_kcal"),protein_g:n({nutrients:tn},"protein_g"),carbs_g:n({nutrients:tn},"carbs_g"),fat_g:n({nutrients:tn},"fat_g"),fiber_g:n({nutrients:tn},"fiber_g"),sugar_g:n({nutrients:tn},"sugar_g"),sodium_mg:n({nutrients:tn},"sodium_mg"),nutrients:tn};
 return NextResponse.json({items:out,total,free:true,sources:["USDA FoodData Central"]},{headers:{"Cache-Control":"private, no-store"}});
}