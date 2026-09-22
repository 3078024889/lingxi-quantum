import { createAdminClient } from "@/lib/supabase/admin"
import { getProduct } from "@/lib/plans"

type FulfillmentResult = { ok:boolean; alreadyPaid?:boolean; error?:string }

export async function fulfillPaidOrder(orderId:string):Promise<FulfillmentResult>{
  const admin=createAdminClient()
  const lookup=await admin.from("orders").select("product_id").eq("id",orderId).single()
  if(lookup.error||!lookup.data){
    console.error("[fulfillPaidOrder] order lookup failed",{orderId,error:lookup.error})
    return {ok:false,error:"订单不存在。"}
  }

  const productId=String(lookup.data.product_id||"")
  if(productId.startsWith("toolquote:")){
    const rpc=await admin.rpc("fulfill_tool_order",{p_order_id:orderId})
    if(rpc.error){
      console.error("[fulfillPaidOrder] tool fulfillment failed",{orderId,code:rpc.error.code,message:rpc.error.message})
      return {ok:false,error:"工具导出权限开通暂未完成，请稍后重试。"}
    }
    const result=rpc.data as FulfillmentResult|null
    return result?.ok?result:{ok:false,error:result?.error??"工具导出权限开通暂未完成。"}
  }

  const product=getProduct(productId)
  if(!product){
    console.error("[fulfillPaidOrder] unknown product",{orderId,productId})
    return {ok:false,error:"订单产品配置无效。"}
  }

  if(product.group==="production"&&product.sasiAmountFen){
    const rpcResult=await admin.rpc("credit_sasi_topup",{p_order_id:orderId})
    if(rpcResult.error){
      console.error("[fulfillPaidOrder] SASI top-up failed",{orderId,code:rpcResult.error.code,message:rpcResult.error.message})
      return {ok:false,error:"制作账户入账暂未完成，请稍后重试。"}
    }
    const result=rpcResult.data as FulfillmentResult|null
    return result?.ok?result:{ok:false,error:result?.error??"制作账户入账暂未完成，请稍后重试。"}
  }

  const rpcResult=await admin.rpc("fulfill_paid_order",{p_order_id:orderId,p_days:product.days==null?365:product.days})
  if(rpcResult.error){
    console.error("[fulfillPaidOrder] transactional fulfillment failed",{orderId,code:rpcResult.error.code,message:rpcResult.error.message})
    return {ok:false,error:"权益开通暂未完成，请稍后重试。"}
  }
  const result=rpcResult.data as FulfillmentResult|null
  if(!result||!result.ok){
    console.error("[fulfillPaidOrder] RPC rejected fulfillment",{orderId,result})
    return {ok:false,error:result&&result.error?result.error:"权益开通暂未完成，请稍后重试。"}
  }
  return result
}
