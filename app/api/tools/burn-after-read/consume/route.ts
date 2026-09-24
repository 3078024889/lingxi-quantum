import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const{id}=await req.json().catch(()=>({}));if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400});
 const admin=createAdminClient();const{data,error}=await admin.rpc("consume_burn_note",{p_id:String(id)});if(error)return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500});
 const row=Array.isArray(data)?data[0]:data;if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410});return NextResponse.json(row);
}
