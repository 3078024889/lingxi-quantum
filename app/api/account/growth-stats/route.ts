import {NextRequest,NextResponse} from "next/server";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {summarizeGrowthVisits,summarizeGrowthToolFunnel,type GrowthVisit,type GrowthToolEvent} from "@/lib/analytics/growth-attribution";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const privateHeaders={"Cache-Control":"private, no-store"};

/** Aggregate bounded source labels and anonymous completion events; never expose hashes or identities. */
export async function GET(req:NextRequest){
 try{
  if(!await moneyAdministrator())
   return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:privateHeaders});
  const n=Number(req.nextUrl.searchParams.get("days")||7);
  const days=[7,30,90].includes(n)?n:7;
  const since=new Date(Date.now()-days*86400000).toISOString();
  const admin=createAdminClient();
  const [visitsResult,eventsResult]=await Promise.all([
   admin.from("site_page_views")
    .select("occurred_at,path,session_hash,utm_source,utm_campaign,utm_content,referrer_host",{count:"exact"})
    .gte("occurred_at",since).order("occurred_at",{ascending:false}).limit(10000),
   admin.from("tool_events")
    .select("session_id,tool_id,event_type,metadata,created_at",{count:"exact"})
    .gte("created_at",since).order("created_at",{ascending:false}).limit(20000)
  ]);
  if(visitsResult.error||!visitsResult.data||eventsResult.error||!eventsResult.data)throw new Error("GROWTH_STATS_UNAVAILABLE");
  const visits=visitsResult.data as GrowthVisit[];
  const events=eventsResult.data as GrowthToolEvent[];
  const report=summarizeGrowthVisits(visits,visitsResult.count??visits.length);
  const funnel=summarizeGrowthToolFunnel(visits,events,eventsResult.count??events.length);
  return NextResponse.json({windowDays:days,generatedAt:new Date().toISOString(),...report,...funnel},
   {headers:privateHeaders});
 }catch{
  return NextResponse.json({error:"GROWTH_STATS_UNAVAILABLE"},{status:503,headers:privateHeaders});
 }
}
