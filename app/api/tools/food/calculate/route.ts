import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {recoverToolQuotePayment} from "@/lib/tools/payment-recovery";

export const runtime="nodejs";

type InputItem={food_id?:unknown;grams?:unknown};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});

 const body=await req.json().catch(()=>null) as{quoteId?:unknown;items?:InputItem[]}|null;
 const quoteId=String(body?.quoteId||"");
 if(!UUID.test(quoteId))return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});

 const payment=await recoverToolQuotePayment({userId:user.id,quoteId});
 if(!payment.ok||!payment.paid||payment.quote?.toolId!=="food-calorie"){
  return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 }

 const raw=Array.isArray(body?.items)?body!.items:[];
 if(!raw.length||raw.length>50)return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const items=raw.map(item=>({food_id:Number(item.food_id),grams:Number(item.grams)}));
 if(items.some(x=>!Number.isInteger(x.food_id)||x.food_id<=0||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000)){
  return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 }

 const{data,error}=await supabase.rpc("calculate_food_nutrition",{p_items:items});
 if(error)return NextResponse.json({error:"CALCULATION_UNAVAILABLE"},{status:503});
 return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}});
}
