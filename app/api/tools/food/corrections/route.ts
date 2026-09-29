import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";import {createAdminClient} from "@/lib/supabase/admin";import {isSameOriginMutation} from "@/lib/sasi/request-security";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const s=createClient(),{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const b=await req.json().catch(()=>null) as any;const predicted=String(b?.predicted||"").slice(0,120),correctedFoodId=Number(b?.correctedFoodId),grams=Number(b?.grams||0);
 if(!predicted||!Number.isInteger(correctedFoodId)||correctedFoodId<=0)return NextResponse.json({error:"INVALID_CORRECTION"},{status:400});
 const a=createAdminClient(),{error}=await a.from("nutrition_user_corrections").insert({user_id:user.id,predicted_label:predicted,corrected_food_id:correctedFoodId,grams:Number.isFinite(grams)&&grams>0?grams:null,lang:String(b?.lang||"und").slice(0,8)});
 if(error)return NextResponse.json({error:"CORRECTION_NOT_SAVED"},{status:503});return NextResponse.json({ok:true});
}
