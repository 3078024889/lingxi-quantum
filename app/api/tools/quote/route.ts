import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateToolQuote } from "@/lib/tools/pricing-server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";

import { toolRuntimeState } from "@/lib/tools/service-readiness";
export const runtime="nodejs";

export async function POST(req:NextRequest){
  try{
    if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
    const contentLength=Number(req.headers.get("content-length")||0);
    if(Number.isFinite(contentLength)&&contentLength>64*1024)return NextResponse.json({error:"QUOTE_REQUEST_TOO_LARGE"},{status:413});

    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"请先登录"},{status:401});

    const body=await req.json();
    const toolId=String(body.toolId||"").trim();
    const runtimeState=toolRuntimeState(toolId);
    if(!runtimeState.ready){
      return NextResponse.json({error:"TOOL_SERVICE_UNAVAILABLE",toolId,reason:runtimeState.reason},{status:503});
    }
    const quantity=Number(body.quantity);
    const metadata=(body.metadata&&typeof body.metadata==="object")?body.metadata:{};
    if(JSON.stringify(metadata).length>16*1024)return NextResponse.json({error:"QUOTE_METADATA_TOO_LARGE"},{status:413});

    const q=await calculateToolQuote(toolId,quantity);
    const admin=createAdminClient();
    const limited=await admin.rpc("rate_limit_check",{
      p_key:`tool-quote:${user.id}`,
      p_limit:120,
      p_window_seconds:3600,
    });
    if(limited.error)return NextResponse.json({error:"QUOTE_RATE_GUARD_UNAVAILABLE"},{status:503});
    if(limited.data!==true)return NextResponse.json({error:"QUOTE_RATE_LIMITED"},{status:429});
    const abuse=await enforceAbuseGuard(req,{scope:"tool-quote",userId:user.id,accountLimit:120,ipLimit:300});
    if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
    const {data,error}=await admin.from("tool_payment_quotes").insert({
      user_id:user.id,tool_id:q.toolId,billing_type:q.billingType,quantity:q.quantity,
      unit_name:q.unitName,amount_rmb:q.amountRmb,amount_usd:q.amountUsd,metadata,status:"quoted"
    }).select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,expires_at").single();
    if(error||!data)return NextResponse.json({error:"创建报价失败"},{status:500});
    return NextResponse.json(data);
  }catch(e){
    const msg=e instanceof Error?e.message:"报价失败";
    const status=msg==="TOOL_PRICING_NOT_FOUND"?404:400;
    return NextResponse.json({error:msg},{status});
  }
}

export async function GET(req:Request){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  const id=new URL(req.url).searchParams.get("id");
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||"")))return NextResponse.json({error:"INVALID_QUOTE_ID"},{status:400});
  if(!id)return NextResponse.json({error:"缺少报价ID"},{status:400});
  const admin=createAdminClient();
  const {data}=await admin.from("tool_payment_quotes")
    .select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,status,expires_at")
    .eq("id",id).eq("user_id",user.id).single();
  if(!data)return NextResponse.json({error:"报价不存在"},{status:404});
  return NextResponse.json(data);
}
