import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateToolQuote } from "@/lib/tools/pricing-server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { toolRuntimeStateLive } from "@/lib/tools/service-readiness";
import { isPublicPaidToolId } from "@/lib/tools/paid-catalog";
import {foodRequestIpHash} from '@/lib/tools/food/request-identity';
import {
  amountForCurrency,
  parseCurrency,
  recommendedCurrency,
  type PaymentCurrency,
} from "@/lib/payments/currency-book";

export const runtime = "nodejs";

function currencyFromMetadata(metadata: unknown): PaymentCurrency | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return parseCurrency((metadata as Record<string, unknown>).pricing_currency);
}

function publicQuote(
  data: {
    id: string;
    tool_id: string;
    billing_type: string;
    quantity: number;
    unit_name: string;
    amount_rmb: number;
    amount_usd: number;
    expires_at: string;
    status?: string;
    metadata?: unknown;
    currency?: string | null;
  },
  currency: PaymentCurrency
) {
  return {
    id: data.id,
    tool_id: data.tool_id,
    billing_type: data.billing_type,
    quantity: data.quantity,
    unit_name: data.unit_name,
    amount_rmb: data.amount_rmb,
    amount_usd: data.amount_usd,
    expires_at: data.expires_at,
    status: data.status,
    currency,
    ...(data.metadata&&typeof data.metadata==='object'?{metadata:{draftId:(data.metadata as Record<string,unknown>).draftId}}:{}),
    ...(data.tool_id==='food-calorie'&&data.metadata&&typeof data.metadata==='object'?{metadata:{foodRequestId:(data.metadata as Record<string,unknown>).foodRequestId}}:{}),
    ...amountForCurrency({
      currency,
      amountRmb: Number(data.amount_rmb),
      amountUsd: Number(data.amount_usd),
    }),
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOriginMutation(req)) {
      return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > 64 * 1024) {
      return NextResponse.json({ error: "QUOTE_REQUEST_TOO_LARGE" }, { status: 413 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const body = await req.json();
    const toolId = String(body.toolId || "").trim();
    if (toolId === "sasi-video-generate") return NextResponse.json({ error: "VIDEO_BYOK_REQUIRED", destination: "/sasi/drama" }, { status: 410 });
    if (!isPublicPaidToolId(toolId)) {
      return NextResponse.json({ error: "TOOL_NOT_AVAILABLE" }, { status: 404 });
    }
    const runtimeState = await toolRuntimeStateLive(toolId);
    if (!runtimeState.ready) {
      return NextResponse.json(
        { error: "TOOL_SERVICE_UNAVAILABLE", toolId, reason: runtimeState.reason },
        { status: 503 }
      );
    }

    const quantity = Number(body.quantity);
    const userMetadata =
      body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? (body.metadata as Record<string, unknown>)
        : {};

    if (JSON.stringify(userMetadata).length > 16 * 1024) {
      return NextResponse.json({ error: "QUOTE_METADATA_TOO_LARGE" }, { status: 413 });
    }

    // Region only recommends. A valid user choice always wins.
    const currency = parseCurrency(body.currency) || recommendedCurrency(req);
    const metadata = { ...userMetadata, pricing_currency: currency };

    const q = await calculateToolQuote(toolId, quantity);
    const admin = createAdminClient();
    if(toolId==='food-calorie'){
      const requestId=String(userMetadata.foodRequestId||'');
      if(!/^[0-9a-f-]{36}$/i.test(requestId))return NextResponse.json({error:'FOOD_ANALYSIS_REQUIRED'},{status:400});
      const {data:food,error:foodError}=await admin.from('food_analysis_requests_v19').select('account_id,ip_hash,quantity,mode,expires_at,consumed_at').eq('id',requestId).maybeSingle();
      if(foodError||!food||(food.account_id?food.account_id!==user.id:food.ip_hash!==foodRequestIpHash(req)))return NextResponse.json({error:'FOOD_ANALYSIS_REQUIRED'},{status:403});
      if(food.consumed_at||Date.parse(food.expires_at)<=Date.now()||quantity!==food.quantity)return NextResponse.json({error:'FOOD_ANALYSIS_EXPIRED'},{status:409});
      if(!food.account_id){const claimed=await admin.from('food_analysis_requests_v19').update({account_id:user.id}).eq('id',requestId).is('account_id',null).select('id').maybeSingle();if(claimed.error||!claimed.data)return NextResponse.json({error:'FOOD_ANALYSIS_REQUIRED'},{status:409});}
      Object.assign(metadata,{foodRequestId:requestId,draftId:requestId,mode:food.mode});
      q.unitName=food.mode==='custom'?'food':'image';
      if(q.amountRmb!==2*quantity||q.amountUsd!==2*quantity)return NextResponse.json({error:'PRICE_NOT_AVAILABLE'},{status:503});
      const {data:existing,error:existingError}=await admin.from('tool_payment_quotes').select('*').eq('tool_id',toolId).eq('user_id',user.id).contains('metadata',{foodRequestId:requestId}).in('status',['quoted','ordered','paid']).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(existingError)return NextResponse.json({error:'QUOTE_CREATE_FAILED'},{status:503});
      if(existing){
        if(existing.status==='quoted'&&(existing.currency!==currency||Date.parse(existing.expires_at)<=Date.now())){
          const retired=await admin.from('tool_payment_quotes').update({status:'canceled'}).eq('id',existing.id).eq('status','quoted').select('id').maybeSingle();
          if(retired.error||!retired.data)return NextResponse.json({error:'PAYMENT_ALREADY_STARTED'},{status:409});
        }else return NextResponse.json(publicQuote(existing,parseCurrency(existing.currency)||currency));
      }
    }

    const limited = await admin.rpc("rate_limit_check", {
      p_key: `tool-quote:${user.id}`,
      p_limit: 120,
      p_window_seconds: 3600,
    });
    if (limited.error) {
      return NextResponse.json({ error: "QUOTE_RATE_GUARD_UNAVAILABLE" }, { status: 503 });
    }
    if (limited.data !== true) {
      return NextResponse.json({ error: "QUOTE_RATE_LIMITED" }, { status: 429 });
    }

    const abuse = await enforceAbuseGuard(req, {
      scope: "tool-quote",
      userId: user.id,
      accountLimit: 120,
      ipLimit: 300,
    });
    if (!abuse.ok) return NextResponse.json({ error: abuse.error }, { status: abuse.status });

    const { data, error } = await admin.from("tool_payment_quotes").insert({
      user_id: user.id,
      tool_id: q.toolId,
      billing_type: q.billingType,
      quantity: q.quantity,
      unit_name: q.unitName,
      amount_rmb: q.amountRmb,
      amount_usd: q.amountUsd,
      metadata,
      currency,
      status: "quoted",
    }).select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,metadata,currency,expires_at,status").single();

    if (error || !data) {
      return NextResponse.json({ error: "创建报价失败" }, { status: 500 });
    }

    return NextResponse.json(publicQuote(data, currency));
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "TOOL_PRICING_NOT_FOUND") {
      return NextResponse.json({ error: "TOOL_PRICING_NOT_FOUND" }, { status: 404 });
    }
    console.error("[tool quote] create failed", code || "unknown");
    return NextResponse.json({ error: "QUOTE_CREATE_FAILED" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ""))) {
    return NextResponse.json({ error: "INVALID_QUOTE_ID" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("tool_payment_quotes")
    .select("id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,metadata,currency,status,expires_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) return NextResponse.json({ error: "报价不存在" }, { status: 404 });

  const currency =
    parseCurrency(data.currency) ||
    currencyFromMetadata(data.metadata) ||
    recommendedCurrency(req);

  return NextResponse.json(publicQuote(data, currency));
}
