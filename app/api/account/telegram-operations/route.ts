import {NextResponse} from "next/server";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET() {
  try {
    if(!await moneyAdministrator())return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:{"Cache-Control":"private,no-store"}});
    const db=createAdminClient();
    const start=new Date(Date.now()-30*86400000).toISOString();
    const [telegram,qq,delivered,failed,snapshots]=await Promise.all([
      db.from("site_page_views").select("id",{count:"exact",head:true}).eq("utm_source","telegram").gte("occurred_at",start),
      db.from("site_page_views").select("id",{count:"exact",head:true}).eq("utm_source","qq").gte("occurred_at",start),
      db.from("telegram_community_events").select("event_key",{count:"exact",head:true}).eq("event_kind","daily").eq("status","delivered").gte("created_at",start),
      db.from("telegram_community_events").select("event_key",{count:"exact",head:true}).eq("event_kind","daily").eq("status","failed").gte("created_at",start),
      db.from("telegram_community_daily_metrics").select("snapshot_day,member_count,posts_delivered").order("snapshot_day",{ascending:false}).limit(30),
    ]);
    if([telegram,qq,delivered,failed,snapshots].some(x=>x.error))throw new Error("METRICS_UNAVAILABLE");
    const latest=snapshots.data?.[0];
    return NextResponse.json({
      periodDays:30,telegramVisits:telegram.count||0,qqVisits:qq.count||0,
      postsDelivered:delivered.count||0,postsFailed:failed.count||0,
      members:latest?.member_count??null,
      latestSnapshot:latest?.snapshot_day??null,snapshots:snapshots.data||[],
      revenueAttribution:"not_available",
      note:"Visits and group-member totals do not prove paid conversion. Orders need verified payment-source attribution.",
    },{headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex"}});
  }catch{return NextResponse.json({error:"REPORT_UNAVAILABLE"},{status:503});}
}
