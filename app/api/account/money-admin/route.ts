import {NextRequest,NextResponse} from "next/server";
import {moneyAdministrator,moneyOperatorSettings} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {flushMoneyNotifications} from "@/lib/money/operator-notifications";
import {reconcileWithdrawal} from "@/lib/money/reconcile-worker";
export const dynamic="force-dynamic";export const maxDuration=90;
export async function GET(req:NextRequest){
 try{if(!await moneyAdministrator())return NextResponse.json({error:"FORBIDDEN"},{status:403});
 const q=req.nextUrl.searchParams;
 const page=(key:string)=>Math.max(0,Math.min(100000,Math.floor(Number(q.get(key))||0)));
 const admin=createAdminClient();const [stats,withdrawals,notices,settings,dashboard]=await Promise.all([admin.rpc("money_operator_snapshot"),admin.from("balance_withdrawals").select("id,provider,currency,amount_minor,provider_currency,provider_amount_minor,status,failure_code,provider_refund_id,submission_confirmed_at,created_at,updated_at").order("updated_at",{ascending:false}).limit(100),admin.from("money_notification_outbox").select("id,event_type,status,attempt_count,last_error,created_at,sent_at").order("created_at",{ascending:false}).limit(30),moneyOperatorSettings(),admin.rpc("operator_dashboard_snapshot",{p_days:Math.max(1,Math.min(90,Math.floor(Number(q.get("days"))||30))),p_order_page:page("orderPage"),p_user_page:page("userPage"),p_search:(q.get("search")||"").slice(0,120),p_provider:["wechat","wechat_mini_virtual","alipay","paypal","sasi-balance"].includes(q.get("provider")||"")?q.get("provider"):"all",p_status:["paid","pending","refunded","failed","cancelled"].includes(q.get("status")||"")?q.get("status"):"all"})]);
 if(stats.error||withdrawals.error||notices.error||dashboard.error)throw new Error();return NextResponse.json({stats:stats.data,withdrawals:withdrawals.data,notices:notices.data,dashboard:dashboard.data,notifyEmail:settings.notify_email,emailConfigured:Boolean(process.env.RESEND_API_KEY)},{headers:{"Cache-Control":"private, no-store"}});
 }catch{return NextResponse.json({error:"MONEY_ADMIN_UNAVAILABLE"},{status:503});}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const user=await moneyAdministrator();if(!user)return NextResponse.json({error:"FORBIDDEN"},{status:403});
 const b=await req.json().catch(()=>null),admin=createAdminClient();const rate=await admin.rpc("rate_limit_check",{p_key:"money-admin:"+user.id,p_limit:30,p_window_seconds:3600});if(rate.error||rate.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});
 try{if(b?.action==="send-notices")return NextResponse.json(await flushMoneyNotifications(5,true));
 if(b?.action!=="retry"||!/^[0-9a-f-]{36}$/i.test(b?.id||""))return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
 const {data:w}=await admin.from("balance_withdrawals").select("status,submission_confirmed_at").eq("id",b.id).single();if(!w?.submission_confirmed_at||!['requested','processing'].includes(w.status))return NextResponse.json({error:"REQUEST_NOT_RETRYABLE"},{status:409});
 return NextResponse.json({result:await reconcileWithdrawal(b.id)});
 }catch{return NextResponse.json({error:"MONEY_OPERATION_UNAVAILABLE"},{status:503});}
}
