import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type N={eventKey:string;kind:"topup"|"withdrawal"|"announcement";title:string;body:string;createdAt:string;href?:string;read?:boolean};

const money=(currency:string,minor:number)=>currency==="USD"?`$${(minor/100).toFixed(2)}`:`¥${(minor/100).toFixed(2)}`;

export async function GET(req:NextRequest){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const platform=req.nextUrl.searchParams.get("platform")==="miniapp"?"miniapp":"web";
 const [orders,withdrawals,announcements,reads]=await Promise.all([
  admin.from("orders").select("id,product_id,amount_rmb,amount_usd,status,created_at").eq("user_id",user.id).eq("status","paid").order("created_at",{ascending:false}).limit(30),
  admin.from("balance_withdrawals").select("id,currency,amount_minor,status,provider_status,failure_code,created_at,completed_at,updated_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50),
  admin.from("lingxifield_announcements").select("id,platform,version_label,title_zh,body_zh,title_en,body_en,published_at,expires_at").eq("is_active",true).in("platform",["all",platform]).order("published_at",{ascending:false}).limit(30),
  admin.from("lingxifield_notification_reads").select("event_key").eq("user_id",user.id).limit(500),
 ]);
 if(orders.error||withdrawals.error||announcements.error||reads.error)return NextResponse.json({error:"NOTIFICATIONS_UNAVAILABLE"},{status:500});
 const read=new Set((reads.data||[]).map(x=>String(x.event_key))); const items:N[]=[];
 for(const o of orders.data||[]){
  const pid=String(o.product_id||"");
  if(!pid.includes("balance"))continue;
  const usd=pid.includes("usd"); const minor=Math.round(Number(usd?o.amount_usd:o.amount_rmb||0)*100);
  const eventKey=`topup:${o.id}:paid`;
  items.push({eventKey,kind:"topup",title:"充值已到账",body:`${money(usd?"USD":"CNY",minor)} 已到账，可直接使用。`,createdAt:o.created_at,href:"/ai-wallet",read:read.has(eventKey)});
 }
 for(const w of withdrawals.data||[]){
  const amount=money(String(w.currency||"CNY"),Number(w.amount_minor||0));
  const status=String(w.status||""); const eventKey=`withdrawal:${w.id}:${status}`;
  let title="提现进度"; let body=`${amount} 已提交，正在退回原支付方式。`;
  if(status==="processing")body=`${amount} 已向原支付渠道发起，正在等待支付渠道处理。`;
  if(status==="completed"){title="提现已完成";body=`${amount} 的原路退款已由支付渠道确认完成。`;}
  if(status==="failed"||status==="released"){title="提现未完成";body=`${amount} 本次没有退回成功，可用金额已恢复，请查看记录后重新申请。`;}
  items.push({eventKey,kind:"withdrawal",title,body,createdAt:w.completed_at||w.updated_at||w.created_at,href:"/account/withdrawals",read:read.has(eventKey)});
 }
 for(const a of announcements.data||[]){
  const eventKey=`announcement:${a.id}`;
  items.push({eventKey,kind:"announcement",title:a.title_zh,body:a.body_zh,createdAt:a.published_at,href:"/account/notifications",read:read.has(eventKey)});
 }
 items.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 return NextResponse.json({items,unread:items.filter(x=>!x.read).length},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null) as {eventKeys?:unknown}|null;
 const keys=Array.isArray(body?.eventKeys)?body!.eventKeys.map(String).filter(x=>x.length>0&&x.length<=180).slice(0,100):[];
 if(!keys.length)return NextResponse.json({ok:true});
 const admin=createAdminClient();
 const {error}=await admin.from("lingxifield_notification_reads").upsert(keys.map(event_key=>({user_id:user.id,event_key,read_at:new Date().toISOString()})),{onConflict:"user_id,event_key"});
 if(error)return NextResponse.json({error:"NOTIFICATION_UPDATE_FAILED"},{status:500});
 return NextResponse.json({ok:true});
}
