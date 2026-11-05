import {NextRequest,NextResponse} from "next/server";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {summarizeGrowthVisits,type GrowthVisit} from "@/lib/analytics/growth-attribution";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const privateHeaders={"Cache-Control":"private, no-store"};

/** Aggregate source labels only; never send hashes, IPs or user identifiers to the UI. */
export async function GET(req:NextRequest){
 try{
  if(!await moneyAdministrator())
   return NextResponse.json({error:"FORBIDDEN"},{status:403,headers:privateHeaders});
  const n=Number(req.nextUrl.searchParams.get("days")||7);
  const days=[7,30,90].includes(n)?n:7;
  const since=new Date(Date.now()-days*86400000).toISOString();
  const {data,count,error}=await createAdminClient().from("site_page_views")
   .select("occurred_at,path,session_hash,utm_source,utm_campaign,utm_content,referrer_host",
    {count:"exact"})
   .gte("occurred_at",since)
   .order("occurred_at",{ascending:false})
   .limit(10000);
  if(error||!data)throw new Error("GROWTH_STATS_UNAVAILABLE");
  const report=summarizeGrowthVisits(data as GrowthVisit[],count??data.length);
  return NextResponse.json({windowDays:days,generatedAt:new Date().toISOString(),...report},
   {headers:privateHeaders});
 }catch{
  return NextResponse.json({error:"GROWTH_STATS_UNAVAILABLE"},{status:503,headers:privateHeaders});
 }
}
