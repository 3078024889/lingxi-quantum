import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {scheduleMoneyNotices} from "@/lib/money/operator-notifications";
export const maxDuration=60;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const b=await req.json().catch(()=>null);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b?.requestId||""))return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
 const admin=createAdminClient(),rate=await admin.rpc("rate_limit_check",{p_key:"withdrawal-cancel:"+user.id,p_limit:30,p_window_seconds:3600});if(rate.error||rate.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});
 const legacy=b.kind==="legacy",{data,error}=await admin.rpc(legacy?"cancel_legacy_refund":"cancel_balance_withdrawal",{[legacy?"p_request_id":"p_withdrawal_id"]:b.requestId,p_user_id:user.id});
 if(error||!data?.ok)return NextResponse.json({error:data?.error||"CANCELLATION_FAILED"},{status:409});
 scheduleMoneyNotices();return NextResponse.json(data,{headers:{"Cache-Control":"private, no-store"}});
}
