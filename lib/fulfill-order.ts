import { createAdminClient } from "@/lib/supabase/admin"
import { getProduct } from "@/lib/plans"

type FulfillmentResult = {
  ok: boolean
  alreadyPaid?: boolean
  error?: string
}

// The database RPC locks the order and writes entitlement + paid status in one transaction.
export async function fulfillPaidOrder(orderId: string): Promise<FulfillmentResult> {
  const admin = createAdminClient()
  const lookup = await admin.from("orders").select("product_id").eq("id", orderId).single()

  if (lookup.error || !lookup.data) {
    console.error("[fulfillPaidOrder] order lookup failed", { orderId, error: lookup.error })
    return { ok: false, error: "订单不存在。" }
  }

  const product = getProduct(lookup.data.product_id)
  if (!product) {
    console.error("[fulfillPaidOrder] unknown product", { orderId, productId: lookup.data.product_id })
    return { ok: false, error: "订单产品配置无效。" }
  }

  const rpcResult = await admin.rpc("fulfill_paid_order", {
    p_order_id: orderId,
    p_days: product.days == null ? 365 : product.days,
  })

  if (rpcResult.error) {
    console.error("[fulfillPaidOrder] transactional fulfillment failed", {
      orderId,
      code: rpcResult.error.code,
      message: rpcResult.error.message,
    })
    return { ok: false, error: "权益开通暂未完成，请稍后重试。" }
  }

  const result = rpcResult.data as FulfillmentResult | null
  if (!result || !result.ok) {
    console.error("[fulfillPaidOrder] RPC rejected fulfillment", { orderId, result })
    return { ok: false, error: result && result.error ? result.error : "权益开通暂未完成，请稍后重试。" }
  }

  return result
}
