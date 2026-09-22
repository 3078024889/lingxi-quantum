import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateToolQuote } from "@/lib/tools/pricing-server";

export const runtime="nodejs";

export async function POST(req:Request){
  try{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"请先登录"},{status:401});
    const body=await req.json();
    const toolId=String(body.toolId||"").trim();
    const quantity=Number(body.quantity);
    const metadata=(body.metadata&&typeof body.metadata==="object")?body.metadata:{};
    const q=await calculateToolQuote(toolId,quantity);
    const admin=createAdminClient();
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
  if(!id)return NextResponse.json({error:"缺少报价ID"},{status:400});
  const admin=createAdminClient();
  const {data}=await admin.from("tool_payment_quotes")
    .select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,status,expires_at")
    .eq("id",id).eq("user_id",user.id).single();
  if(!data)return NextResponse.json({error:"报价不存在"},{status:404});
  return NextResponse.json(data);
}
