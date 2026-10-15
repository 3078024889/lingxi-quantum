import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {foodRequestIpHash} from '@/lib/tools/food/request-identity';
import {isMeteredTool} from '@/lib/tools/commerce/metered-catalog';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4096)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413});
 const body=await req.json().catch(()=>null),id=String(body?.id||''),toolId=String(body?.toolId||''),units=Number(body?.units);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||!isMeteredTool(toolId)||!Number.isSafeInteger(units)||units<1||units>1000)return NextResponse.json({error:'EXPORT_INPUT_INVALID'},{status:400});
 const client=createClient(),{data:{user}}=await client.auth.getUser(),admin=createAdminClient();
 const ipHash=foodRequestIpHash(req);
 const limit=await admin.rpc('rate_limit_check',{p_key:`tool-export:${ipHash}`,p_limit:300,p_window_seconds:3600});
 if(limit.error)return NextResponse.json({error:'EXPORT_SERVICE_UNAVAILABLE'},{status:503});
 if(limit.data!==true)return NextResponse.json({error:'EXPORT_RATE_LIMITED'},{status:429});
 const result=await admin.rpc('reserve_tool_daily_export',{p_id:id,p_tool_id:toolId,p_user_id:user?.id||null,p_ip_hash:ipHash,p_units:units});
 if(result.error)return NextResponse.json({error:'EXPORT_SERVICE_UNAVAILABLE'},{status:503});
 const row=result.data as {id:string;state:string;paid_units:number;free_units:number};
 if(!row||row.id!==id||!['free','paid','payment_required'].includes(row.state))return NextResponse.json({error:'EXPORT_SERVICE_UNAVAILABLE'},{status:503});
 return NextResponse.json({id,allowed:row.state!=='payment_required',paidUnits:row.paid_units,freeUnits:row.free_units,loginRequired:!user},{status:row.state==='payment_required'?402:200,headers:{'Cache-Control':'no-store'}});
}
