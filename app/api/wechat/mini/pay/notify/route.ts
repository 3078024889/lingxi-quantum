import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { miniSkuForProduct } from "@/lib/mini/catalog";
import { safeEqualHex } from "@/lib/mini/crypto";

export const runtime = "nodejs";
export const maxDuration = 20;

type GoodsInfo = {
  ProductId?: string;
  ActualPrice?: number;
  Quantity?: number;
  Attach?: string;
};
type DeliverPayload = {
  Event?: string;
  OpenId?: string;
  openid?: string;
  OutTradeNo?: string;
  GoodsInfo?: GoodsInfo;
  WeChatPayInfo?: { TransactionId?: string; MchOrderNo?: string };
  MiniGame?: { Payload?: string };
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
  try {
    const payload = normalizePayload((await req.json()) as DeliverPayload);
    const event = payload.Event ?? "unknown";
    const outTradeNo = payload.OutTradeNo ?? null;
    const transactionId = payload.WeChatPayInfo?.TransactionId ?? null;
    const admin = createAdminClient();

    if (event !== "xpay_goods_deliver_notify") {
      await admin.from("wechat_mini_payment_events").upsert(
        { event_type: event, out_trade_no: outTradeNo, transaction_id: transactionId, payload, handled: false },
        { onConflict: "event_type,out_trade_no,transaction_id", ignoreDuplicates: true }
      );
      return success();
    }
    if (!outTradeNo || !payload.GoodsInfo?.ProductId || !transactionId) {
      return failure("missing payment fields", 400);
    }

    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, product_id, amount_rmb, provider, status")
      .eq("provider", "wechat_mini_virtual")
      .eq("provider_payment_id", outTradeNo)
      .maybeSingle();
    if (!order) return failure("order not found", 404);

    const callbackOpenid = payload.OpenId ?? payload.openid;
    const { data: identity } = await admin
      .from("wechat_mini_identities")
      .select("openid")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const expectedSku = miniSkuForProduct(order.product_id);
    const expectedFen = Math.round(Number(order.amount_rmb) * 100);
    const actualFen = Number(payload.GoodsInfo.ActualPrice);
    const attachMatches = !payload.GoodsInfo.Attach || payload.GoodsInfo.Attach === order.id;
    const quantityMatches = Number(payload.GoodsInfo.Quantity ?? 1) === 1;
    if (
      !expectedSku ||
      expectedSku !== payload.GoodsInfo.ProductId ||
      !identity ||
      (callbackOpenid ? identity.openid !== callbackOpenid : false) ||
      actualFen !== expectedFen ||
      !attachMatches ||
      !quantityMatches
    ) {
      console.error("[mini virtual pay] callback mismatch", { orderId: order.id, outTradeNo });
      return failure("order validation failed", 422);
    }

    const fulfillment = await fulfillPaidOrder(order.id);
    if (!fulfillment.ok) return failure("fulfillment failed");
    await admin.from("wechat_mini_payment_events").upsert(
      {
        event_type: event,
        out_trade_no: outTradeNo,
        order_id: order.id,
        transaction_id: transactionId,
        payload,
        handled: true,
      },
      { onConflict: "event_type,out_trade_no,transaction_id" }
    );
    return success();
  } catch (error) {
    console.error("[mini virtual pay] notify failed", error instanceof Error ? error.message : "unknown");
    return failure("internal error");
  }
}
