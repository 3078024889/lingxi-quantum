import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";import {recoverToolQuotePayment} from "@/lib/tools/payment-recovery";
export const runtime="nodejs";const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const n=(x:any,k:string)=>{const v=x?.nutrients?.[k];return v==null?null:Number(v)};
function legacyItem(x:any){return{food_id:Number(x.food_id),code:String(x.source_food_id||""),name_zh:String(x.name_zh||x.name_en||""),name_en:String(x.name_en||""),grams:Number(x.grams),kcal:n(x,"energy_kcal"),protein_g:n(x,"protein_g"),carbs_g:n(x,"carbs_g"),fat_g:n(x,"fat_g"),fiber_g:n(x,"fiber_g"),sugar_g:n(x,"sugar_g"),sodium_mg:n(x,"sodium_mg"),nutrients:x.nutrients||{},source:"USDA FoodData Central"}}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const b=await req.json().catch(()=>null) as any,quoteId=String(b?.quoteId||"");if(!UUID.test(quoteId))return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 const payment=await recoverToolQuotePayment({userId:user.id,quoteId});if(!payment.ok||!payment.paid||payment.quote?.toolId!=="food-calorie")return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 const raw=Array.isArray(b?.items)?b.items:[];if(!raw.length||raw.length>50)return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const items=raw.map((x:any)=>({food_id:Number(x.food_id),grams:Number(x.grams)}));if(items.some((x:any)=>!Number.isInteger(x.food_id)||x.food_id<=0||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000))return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const admin=createAdminClient();const{data,error}=await admin.rpc("calculate_food_compact_v1",{p_items:items});if(error)return NextResponse.json({error:"CALCULATION_UNAVAILABLE"},{status:503});
 const out=(data?.items||[]).map(legacyItem),tn=data?.total?.nutrients||{};
 const total={food_id:0,code:"meal",name_zh:"这一餐",name_en:"Meal",grams:items.reduce((s:number,x:any)=>s+x.grams,0),kcal:n({nutrients:tn},"energy_kcal"),protein_g:n({nutrients:tn},"protein_g"),carbs_g:n({nutrients:tn},"carbs_g"),fat_g:n({nutrients:tn},"fat_g"),fiber_g:n({nutrients:tn},"fiber_g"),sugar_g:n({nutrients:tn},"sugar_g"),sodium_mg:n({nutrients:tn},"sodium_mg"),nutrients:tn};
 return NextResponse.json({items:out,total,source:"USDA FoodData Central",source_note:data?.source_note||"Missing nutrients are not assumed to be zero."},{headers:{"Cache-Control":"no-store"}});
}