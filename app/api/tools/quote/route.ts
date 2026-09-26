import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateToolQuote } from "@/lib/tools/pricing-server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { toolRuntimeState } from "@/lib/tools/service-readiness";
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
    const runtimeState = toolRuntimeState(toolId);
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
