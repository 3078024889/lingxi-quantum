import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { capturePaypalOrder, queryPaypalOrder } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { safeLocalReturnPath } from "@/lib/sasi/payment-gate";

export const runtime = "nodejs";
export const maxDuration = 30;

function paymentCenter(baseUrl:string,status:"pending"|"error"){
  return `${baseUrl}/account/orders?payment=${status}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const paypalToken = searchParams.get("token");
  const dest = safeLocalReturnPath(searchParams.get("dest"), "/account");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";

  if (!orderId) return NextResponse.redirect(paymentCenter(baseUrl,"error"));

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();

  if (
    !order ||
    order.provider !== "paypal" ||
    !order.provider_payment_id ||
    paypalToken !== order.provider_payment_id
  ) {
    return NextResponse.redirect(paymentCenter(baseUrl,"error"));
  }

  if (order.status === "paid") return NextResponse.redirect(`${baseUrl}${dest}`);

  try {
    const result = await capturePaypalOrder(
      order.provider_payment_id,
      Number(order.amount_usd),
      order.id
    );

    if (result.status === "ALREADY_CAPTURED") {
      const verified = await queryPaypalOrder(
        order.provider_payment_id,
        Number(order.amount_usd),
        order.id
      );
      if (!["APPROVED", "COMPLETED"].includes(verified.status)) {
        return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
      }
    }

    if (result.status === "COMPLETED" || result.status === "ALREADY_CAPTURED") {
      const fulfillment = await fulfillPaidOrder(orderId);
      if (!fulfillment.ok) return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
      return NextResponse.redirect(`${baseUrl}${dest}`);
    }

    return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
  } catch (e) {
    console.error("[paypal return capture]", e instanceof Error ? e.message : String(e));
    return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
  }
}
