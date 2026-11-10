import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { alipayAppId, alipaySellerId, parseCnyMinorUnits, verifyAlipayNotification } from "@/lib/alipay";

export const runtime = "nodejs";
export const maxDuration = 30;

const text = (body: "success" | "failure", status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(contentType)) return text("failure", 415);
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > 64 * 1024) return text("failure", 413);
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 64 * 1024) return text("failure", 413);
    const form = new URLSearchParams(rawBody);
    const params: Record<string, string> = Object.create(null);
    for (const [key, value] of form.entries()) {
      if (Object.prototype.hasOwnProperty.call(params, key)) return text("failure", 400);
      params[key] = value;
    }
    if (!verifyAlipayNotification(params)) {
      console.error("[alipay notify] invalid signature");
      return text("failure", 401);
    }
    const expectedAppId = alipayAppId();
    if (!expectedAppId || params.app_id !== expectedAppId) {
      console.error("[alipay notify] app_id mismatch");
      return text("failure", 422);
    }
    const expectedSeller = alipaySellerId();
    if (!expectedSeller || params.seller_id !== expectedSeller) {
      console.error("[alipay notify] seller_id mismatch");
      return text("failure", 422);
    }
    if (!new Set(["TRADE_SUCCESS", "TRADE_FINISHED"]).has(params.trade_status)) return text("success");
    if (!params.out_trade_no || !params.total_amount) return text("failure", 400);

    const admin = createAdminClient();
    const { data: order } = await admin.from("orders")
      .select("id, amount_rmb, currency, provider")
      .eq("provider_payment_id", params.out_trade_no)
      .single();
    const expectedFen = parseCnyMinorUnits(order?.amount_rmb);
    const receivedFen = parseCnyMinorUnits(params.total_amount);
    if (!order || order.provider !== "alipay" || order.currency !== "CNY" || expectedFen === null || receivedFen === null || receivedFen !== expectedFen) {
      console.error("[alipay notify] payment did not match local order", { outTradeNo: params.out_trade_no });
      return text("failure", 422);
    }

    const fulfillment = await fulfillPaidOrder(order.id,true);
    if (!fulfillment.ok) {
      console.error("[alipay notify] fulfillment failed", { orderId: order.id, error: fulfillment.error });
      return text("failure", 500);
    }
    return text("success");
  } catch (error) {
    console.error("[alipay notify] unexpected failure", error);
    return text("failure", 500);
  }
}
