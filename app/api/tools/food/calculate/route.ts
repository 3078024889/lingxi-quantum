import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {recoverToolQuotePayment} from "@/lib/tools/payment-recovery";
import {calcLocalFood,isLocalFoodId} from "@/lib/tools/food/local-catalog";

export const runtime="nodejs";
type InputItem={food_id?:unknown;grams?:unknown};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function legacyNutrients(x:any){
 const n:Record<string,{value:number;unit:string}>={};
 const put=(code:string,value:unknown,unit:string)=>{const v=Number(value);if(Number.isFinite(v))n[code]={value:v,unit}};
 put("protein_g",x.protein_g,"g");put("carbs_g",x.carbs_g,"g");put("fat_g",x.fat_g,"g");
 put("fiber_g",x.fiber_g,"g");put("sugar_g",x.sugar_g,"g");put("sodium_mg",x.sodium_mg,"mg");
 return n;
}
function normalizeItem(x:any){return x&&typeof x==="object"?{...x,nutrients:x.nutrients&&typeof x.nutrients==="object"?x.nutrients:legacyNutrients(x)}:x}
function mergeTotals(items:any[]){
 const sums:any={grams:0,kcal:0,protein_g:0,carbs_g:0,fat_g:0,nutrients:{} as Record<string,{value:number;unit:string}>};
 for(const x of items){
  for(const k of ["grams","kcal","protein_g","carbs_g","fat_g"])sums[k]+=Number(x?.[k]||0);
  const map=x?.nutrients&&typeof x.nutrients==="object"?x.nutrients:legacyNutrients(x);
  for(const [code,v] of Object.entries(map as Record<string,any>)){
   const value=Number(v?.value),unit=String(v?.unit||"");if(!Number.isFinite(value)||!unit)continue;
   const prev=sums.nutrients[code];sums.nutrients[code]={value:(prev?.value||0)+value,unit};
  }
 }
 return sums;
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null) as{quoteId?:unknown;items?:InputItem[]}|null;
 const quoteId=String(body?.quoteId||"");if(!UUID.test(quoteId))return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});
 const payment=await recoverToolQuotePayment({userId:user.id,quoteId});
 if(!payment.ok||!payment.paid||payment.quote?.toolId!=="food-calorie")return NextResponse.json({error:"PAYMENT_REQUIRED"},{status:402});

 const raw=Array.isArray(body?.items)?body!.items:[];if(!raw.length||raw.length>50)return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});
 const items=raw.map(item=>({food_id:Number(item.food_id),grams:Number(item.grams)}));
 if(items.some(x=>!Number.isInteger(x.food_id)||x.food_id<=0||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000))return NextResponse.json({error:"INVALID_FOOD_ITEMS"},{status:400});

 const local=items.filter(x=>isLocalFoodId(x.food_id)).map(x=>calcLocalFood(x.food_id,x.grams)).filter(Boolean).map(normalizeItem);
 const remoteInput=items.filter(x=>!isLocalFoodId(x.food_id));
 let remote:any[]=[];
 if(remoteInput.length){
  let data:any=null,error:any=null;
  ({data,error}=await supabase.rpc("calculate_food_nutrition_v2",{p_items:remoteInput}));
  if(error)({data,error}=await supabase.rpc("calculate_food_nutrition",{p_items:remoteInput}));
  if(error)return NextResponse.json({error:"CALCULATION_UNAVAILABLE"},{status:503});
  remote=(Array.isArray(data?.items)?data.items:Array.isArray(data)?data:[]).map(normalizeItem);
 }
 const all=[...remote,...local];
 const total=mergeTotals(all);
 return NextResponse.json({items:all,total,source_note:"Food composition values vary by variety, brand and preparation."},{headers:{"Cache-Control":"no-store"}});
}
