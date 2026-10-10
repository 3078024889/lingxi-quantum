import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";


import { safeEqualHex } from "@/lib/mini/crypto";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
import { reconcileVirtualRefund, type MiniRefundNotice } from "@/lib/mini/virtual-refund";

export const runtime = "nodejs";
export const maxDuration = 60;

type GoodsInfo = {
  ProductId?: string;
  ActualPrice?: number;
  Quantity?: number;
  Attach?: string;
};
type DeliverPayload = MiniRefundNotice & {
  Event?: string;
  OpenId?: string;
  openid?: string;
  OutTradeNo?: string;
  GoodsInfo?: GoodsInfo;
  WeChatPayInfo?: { TransactionId?: string; MchOrderNo?: string };
  MiniGame?: { Payload?: string };
  Env?: number;
};

function success() {
  return NextResponse.json({ ErrCode: 0, ErrMsg: "success" });
}
function failure(message: string, status = 500) {
  return NextResponse.json({ ErrCode: 99999, ErrMsg: message }, { status });
}

function verifiedByWechat(req: Request): boolean {
  const url = new URL(req.url);
  const signature = url.searchParams.get("signature") ?? "";
  const timestamp = url.searchParams.get("timestamp") ?? "";
  const nonce = url.searchParams.get("nonce") ?? "";
  const token = process.env.WECHAT_MINI_MESSAGE_TOKEN ?? "";
  if (!signature || !timestamp || !nonce || !token) return false;
  if (!/^\d{10}$/.test(timestamp) || nonce.length > 256 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 600) return false;
  const expected = createHash("sha1").update([token, timestamp, nonce].sort().join("")).digest("hex");
  return safeEqualHex(signature, expected);
}

function normalizePayload(raw: DeliverPayload): DeliverPayload {
  if (!raw.MiniGame?.Payload) return raw;
  try {
    return { ...raw, ...(JSON.parse(raw.MiniGame.Payload) as DeliverPayload) };
  } catch {
    return raw;
  }
}

export async function GET(req: Request) {
  if (!verifiedByWechat(req)) return new NextResponse("invalid signature", { status: 401 });
  return new NextResponse(new URL(req.url).searchParams.get("echostr") ?? "success");
}

export async function POST(req: Request) {
  // 第一版只允许微信消息推送的明文 JSON + URL token 签名模式。
  // 若后台选择“安全模式”，需先增加 AES 消息解密，不能在未验签时临时放行。
  if (!verifiedByWechat(req)) return failure("invalid signature", 401);
  if (Number(req.headers.get("content-length")) > 65536) return failure("payload too large", 413);
  try {
    const payload = normalizePayload((await req.json()) as DeliverPayload);
    const event = payload.Event ?? "unknown";
    const outTradeNo = payload.OutTradeNo ?? payload.MchOrderId ?? null;
    const transactionId = payload.WxRefundId ?? payload.MchRefundId ?? payload.WeChatPayInfo?.TransactionId ?? null;
    const admin = createAdminClient();

    if (event === "xpay_refund_notify") {
      if (!outTradeNo || !transactionId) return failure("missing refund fields", 400);
      const saved = await admin.from("wechat_mini_payment_events").upsert(
        { event_type: event, out_trade_no: outTradeNo, transaction_id: transactionId, payload, handled: false },
        { onConflict: "event_type,out_trade_no,transaction_id", ignoreDuplicates: true }
      );
      if (saved.error) return failure("event persistence failed");
      if (payload.RetCode !== 0) {
        const failed = await admin.from("wechat_mini_payment_events").update({ handled: true })
          .eq("event_type", event).eq("out_trade_no", outTradeNo).eq("transaction_id", transactionId);
        return failed.error ? failure("event persistence failed") : success();
      }
      const result = await reconcileVirtualRefund(payload);
      const handled = await admin.from("wechat_mini_payment_events").update({ order_id: result.orderId, handled: true })
        .eq("event_type", event).eq("out_trade_no", outTradeNo).eq("transaction_id", transactionId);
      if (handled.error) return failure("event persistence failed");
      return success();
    }
    if (event !== "xpay_goods_deliver_notify") {
      const saved = await admin.from("wechat_mini_payment_events").upsert(
        { event_type: event, out_trade_no: outTradeNo, transaction_id: transactionId, payload, handled: false },
        { onConflict: "event_type,out_trade_no,transaction_id", ignoreDuplicates: true }
      );
      if (saved.error) return failure("event persistence failed");
      return success();
    }
    if (!outTradeNo || !payload.GoodsInfo?.ProductId) {
      return failure("missing payment fields", 400);
    }

    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, product_id, amount_rmb, provider, status")
      .eq("provider", "wechat_mini_virtual")
      .eq("provider_payment_id", outTradeNo)
      .maybeSingle();
    if (!order) return failure("order not found", 404);

    if (order.product_id.startsWith("toolquote:") || order.product_id.startsWith("sasi-balance-")) {
      const result = await reconcileVirtualToolOrder(order.id);
      if (!result.paid) return failure("payment not verified", 422);
      const saved = await admin.from("wechat_mini_payment_events").upsert({
        event_type: event, out_trade_no: outTradeNo, order_id: order.id,
        transaction_id: transactionId ?? outTradeNo, payload, handled: true,
      }, { onConflict: "event_type,out_trade_no,transaction_id" });
      if (saved.error) return failure("event persistence failed");
      return success();
    }

    return failure("retired product requires manual review", 410);
  } catch (error) {
    console.error("[mini virtual pay] notify failed", error instanceof Error ? error.message : "unknown");
    return failure("internal error");
  }
}
