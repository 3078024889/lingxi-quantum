import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {recoverToolQuotePayment} from "@/lib/tools/payment-recovery";
import {calcLocalFood,isLocalFoodId} from "@/lib/tools/food/local-catalog";

export const runtime="nodejs";

type InputItem={food_id?:unknown;grams?:unknown};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req)){
  return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 }

 const supabase=createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});

 const body=await req.json().catch(()=>null) as{quoteId?:unknown;items?:InputItem[]}|null;
 const quoteId=String(body?.quoteId||"");
 if(!UUID.test(quoteId)){
  return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 }

 const payment=await recoverToolQuotePayment({userId:user.id,quoteId});
 if(!payment.ok||!payment.paid||payment.quote?.toolId!=="food-calorie"){
  return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 }

 const raw=Array.isArray(body?.items)?body!.items:[];
 if(!raw.length||raw.length>50){
  return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 }

 const items=raw.map(item=>({
  food_id:Number(item.food_id),
  grams:Number(item.grams),
 }));

 if(items.some(x=>
  !Number.isInteger(x.food_id)||
  x.food_id<=0||
  !Number.isFinite(x.grams)||
  x.grams<=0||
  x.grams>10000
 )){
  return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 }

 const localItems=items
  .filter(x=>isLocalFoodId(x.food_id))
  .map(x=>calcLocalFood(x.food_id,x.grams))
  .filter(Boolean) as any[];

 const remoteInput=items.filter(x=>!isLocalFoodId(x.food_id));
 let remoteItems:any[]=[];

 if(remoteInput.length){
  const{data,error}=await supabase.rpc("calculate_food_nutrition",{p_items:remoteInput});
  if(error){
   return NextResponse.json({error:"CALCULATION_UNAVAILABLE"},{status:503});
  }
  remoteItems=Array.isArray(data?.items)?data.items:[];
 }

 const all=[...remoteItems,...localItems];

 const total=all.reduce(
  (a:any,x:any)=>({
   grams:a.grams+Number(x.grams||0),
   kcal:a.kcal+Number(x.kcal||0),
   protein_g:a.protein_g+Number(x.protein_g||0),
   carbs_g:a.carbs_g+Number(x.carbs_g||0),
   fat_g:a.fat_g+Number(x.fat_g||0),
   fiber_g:a.fiber_g+Number(x.fiber_g||0),
   sugar_g:a.sugar_g+Number(x.sugar_g||0),
   sodium_mg:a.sodium_mg+Number(x.sodium_mg||0),
  }),
  {
   grams:0,
   kcal:0,
   protein_g:0,
   carbs_g:0,
   fat_g:0,
   fiber_g:0,
   sugar_g:0,
   sodium_mg:0,
  }
 );

 return NextResponse.json(
  {items:all,total},
  {headers:{"Cache-Control":"no-store"}}
 );
}
