import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";

function money(n:number){return Number(Math.max(0,n).toFixed(2));}

export async function POST(req:Request){
  try{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"请先登录"},{status:401});

    const body=await req.json();
    const parentQuoteId=String(body.parentQuoteId||"");
    const requiredQuantity=Number(body.requiredQuantity);
    if(!parentQuoteId||!Number.isFinite(requiredQuantity)||requiredQuantity<=0){
      return NextResponse.json({error:"参数无效"},{status:400});
    }

    const admin=createAdminClient();
    const {data:parent}=await admin.from("tool_payment_quotes")
      .select("id,user_id,tool_id,billing_type,unit_name,quantity,status")
      .eq("id",parentQuoteId).eq("user_id",user.id).single();

    if(!parent)return NextResponse.json({error:"原报价不存在"},{status:404});
    if(parent.status!=="paid")return NextResponse.json({error:"原报价尚未支付"},{status:409});
    if(parent.tool_id!=="video-dubbing")return NextResponse.json({error:"当前仅视频翻译支持自动补差价"},{status:400});

    const {data:grant}=await admin.from("tool_export_grants")
      .select("quantity").eq("quote_id",parentQuoteId).eq("user_id",user.id).single();
    if(!grant)return NextResponse.json({error:"原付费额度不存在"},{status:409});

    const paidQuantity=Number(grant.quantity||0);
    if(requiredQuantity<=paidQuantity){
      return NextResponse.json({alreadyEnough:true,paidQuantity,requiredQuantity});
    }

    const extra=requiredQuantity-paidQuantity;
    const {data:pricing}=await admin.from("tool_pricing").select("*")
      .eq("tool_id",parent.tool_id).eq("enabled",true).single();
    if(!pricing)return NextResponse.json({error:"工具价格未配置"},{status:404});

    // 补差价只收新增单位，不重复收基础价。
    let amountRmb=money(extra*Number(pricing.unit_price_rmb||0));
    if(amountRmb<=0)amountRmb=0.01;
    const amountUsd=money(amountRmb*0.15);

    const {data:q,error}=await admin.from("tool_payment_quotes").insert({
      user_id:user.id,
      tool_id:parent.tool_id,
      billing_type:parent.billing_type,
      quantity:extra,
      unit_name:parent.unit_name,
      amount_rmb:amountRmb,
      amount_usd:amountUsd,
      metadata:{kind:"topup",parentQuoteId,paidQuantity,requiredQuantity},
      parent_quote_id:parentQuoteId,
      topup_target_quantity:requiredQuantity,
      status:"quoted"
    }).select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,expires_at,parent_quote_id,topup_target_quantity").single();

    if(error||!q)return NextResponse.json({error:"创建补差价报价失败"},{status:500});
    return NextResponse.json(q);
  }catch(e){
    console.error("[tool topup quote]",e);
    return NextResponse.json({error:"补差价报价失败"},{status:500});
  }
}
