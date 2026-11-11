import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { alipayAppId, alipaySellerId, verifyAlipayNotification } from "@/lib/alipay";

export const runtime = "nodejs";
export const maxDuration = 30;

const text = (body: "success" | "failure", status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(req: Request) {
  try {
    const declared = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(declared) && declared > 64 * 1024) return text("failure", 413);
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    if (!contentType.startsWith("application/x-www-form-urlencoded")) return text("failure", 415);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 64 * 1024) return text("failure", 413);
    const form = new URLSearchParams(raw);
    const params: Record<string, string> = Object.create(null);
    let duplicateKey = false;
    form.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) duplicateKey = true;
      else params[key] = value;
    });
    if (duplicateKey) return text("failure", 400);
    if (!verifyAlipayNotification(params)) {
      console.error("[alipay notify] invalid signature");
      return text("failure", 401);
    }
    if (params.app_id !== alipayAppId()) {
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
      .select("id, amount_rmb, provider")
      .eq("provider_payment_id", params.out_trade_no)
      .single();
    const expectedFen = Math.round(Number(order?.amount_rmb) * 100);
    const receivedFen = Math.round(Number(params.total_amount) * 100);
    if (!order || order.provider !== "alipay" || !Number.isFinite(receivedFen) || receivedFen !== expectedFen) {
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
