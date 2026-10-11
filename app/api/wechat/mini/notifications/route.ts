import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireMiniSession} from "@/lib/mini/session";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(req:Request){
 const session=await requireMiniSession(req); if(!session)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient(); const url=new URL(req.url); const lang=String(url.searchParams.get("lang")||"zh-CN");
 const [orders,withdrawals,announcements,reads]=await Promise.all([
  admin.from("orders").select("id,product_id,amount_rmb,amount_usd,status,created_at,paid_at").eq("user_id",session.userId).like("product_id","%balance-%").in("status",["paid","pending","refunded"]).or("status.neq.pending,user_deleted_at.is.null").order("created_at",{ascending:false}).limit(30),
  admin.from("balance_withdrawals").select("id,currency,amount_minor,status,created_at,completed_at,updated_at").eq("user_id",session.userId).order("created_at",{ascending:false}).limit(50),
  admin.from("lingxifield_announcements").select("id,version_label,title_zh,body_zh,title_en,body_en,published_at,expires_at").eq("is_active",true).in("platform",["all","miniapp"]).order("published_at",{ascending:false}).limit(30),
  admin.from("lingxifield_notification_reads").select("event_key").eq("user_id",session.userId).limit(500)
 ]);
 if(orders.error||withdrawals.error||announcements.error||reads.error)return NextResponse.json({error:"NOTIFICATIONS_UNAVAILABLE"},{status:500});
 const read=new Set((reads.data||[]).map(x=>String(x.event_key))); const items:any[]=[];
 for(const o of orders.data||[]){const pid=String(o.product_id||"");if(!pid.includes("balance"))continue;const usd=pid.includes("usd");const minor=Math.round(Number(usd?o.amount_usd:o.amount_rmb||0)*100);const eventKey=`topup:${o.id}:${o.status}`;items.push({eventKey,kind:"topup",status:o.status,currency:usd?"USD":"CNY",amountMinor:minor,createdAt:o.paid_at||o.created_at,read:read.has(eventKey)});}
 for(const w of withdrawals.data||[]){const status=String(w.status||"");const eventKey=`withdrawal:${w.id}:${status}`;items.push({eventKey,kind:"withdrawal",status,currency:String(w.currency||"CNY"),amountMinor:Number(w.amount_minor||0),createdAt:w.completed_at||w.updated_at||w.created_at,read:read.has(eventKey)});}
 for(const a of announcements.data||[]){if(a.expires_at&&Date.parse(a.expires_at)<=Date.now())continue;const eventKey=`announcement:${a.id}`;items.push({eventKey,kind:"announcement",versionLabel:a.version_label||null,title:lang==="en"?(a.title_en||a.title_zh):a.title_zh,body:lang==="en"?(a.body_en||a.body_zh):a.body_zh,createdAt:a.published_at,read:read.has(eventKey)});}
 items.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
 return NextResponse.json({items,unread:items.filter(x=>!x.read).length},{headers:{"Cache-Control":"private, no-store"}});
}
