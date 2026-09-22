import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";

function isAdmin(email:string|null|undefined){
  const allow=(process.env.TOOL_ADMIN_EMAILS||"")
    .split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  return !!email&&allow.includes(email.toLowerCase());
}

export async function GET(req:Request){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  if(!isAdmin(user.email))return NextResponse.json({error:"无权限"},{status:403});

  const days=Math.min(90,Math.max(1,Number(new URL(req.url).searchParams.get("days")||30)));
  const since=new Date(Date.now()-days*86400000).toISOString();
  const admin=createAdminClient();

  const [{data:events},{data:quotes},{data:jobs}]=await Promise.all([
    admin.from("tool_events").select("tool_id,event_type,metadata,created_at").gte("created_at",since).limit(20000),
    admin.from("tool_payment_quotes").select("tool_id,amount_rmb,status,created_at").gte("created_at",since).limit(10000),
    admin.from("tool_paid_jobs").select("tool_id,status,created_at").gte("created_at",since).limit(10000),
  ]);

  const perTool:Record<string,{opens:number,started:number,completed:number,failed:number,paid:number,revenue:number}>={};
  const get=(id:string)=>perTool[id]??=( {opens:0,started:0,completed:0,failed:0,paid:0,revenue:0} );

  for(const e of events||[]){
    const x=get(String(e.tool_id));
    if(e.event_type==="tool_open")x.opens++;
    if(e.event_type==="process_started")x.started++;
    if(e.event_type==="process_completed")x.completed++;
    if(e.event_type==="process_failed")x.failed++;
  }
  for(const q of quotes||[]){
    if(q.status==="paid"){const x=get(String(q.tool_id));x.paid++;x.revenue+=Number(q.amount_rmb||0)}
  }

  const searches=(events||[]).filter((e:any)=>e.event_type==="tool_search");
  const missMap:Record<string,number>={};
  for(const e of searches){
    const m=(e.metadata||{}) as any;
    if(Number(m.matched_count||0)===0&&typeof m.query==="string"){
      const q=m.query.trim().slice(0,100);if(q)missMap[q]=(missMap[q]||0)+1;
    }
  }

  const jobSummary={completed:0,failed:0,processing:0};
  for(const j of jobs||[]){
    if(j.status==="completed")jobSummary.completed++;
    else if(j.status==="failed")jobSummary.failed++;
    else jobSummary.processing++;
  }

  return NextResponse.json({
    days,
    totals:{
      events:(events||[]).length,
      paidQuotes:(quotes||[]).filter((q:any)=>q.status==="paid").length,
      revenueRmb:Number((quotes||[]).filter((q:any)=>q.status==="paid").reduce((s:number,q:any)=>s+Number(q.amount_rmb||0),0).toFixed(2)),
      searches:searches.length,
      unmatchedSearches:Object.values(missMap).reduce((a,b)=>a+b,0),
    },
    tools:Object.entries(perTool).map(([toolId,v])=>({toolId,...v,revenue:Number(v.revenue.toFixed(2))})).sort((a,b)=>b.opens-a.opens),
    jobs:jobSummary,
    unmatchedSearches:Object.entries(missMap).map(([query,count])=>({query,count})).sort((a,b)=>b.count-a.count).slice(0,100),
  });
}
