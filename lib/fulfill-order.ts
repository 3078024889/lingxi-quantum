import {createAdminClient} from "@/lib/supabase/admin";
import {getProduct} from "@/lib/plans";
import {allToolsPassOffer} from "@/lib/tools/commerce/all-tools-pass";
import {softwareOffer} from "@/lib/sasi-software/catalog";
import {isMarketProductId} from "@/lib/sasi-marketplace/fees";
import {getUsdBalanceProduct} from "@/lib/usd-products";
type FulfillmentResult={ok:boolean;alreadyPaid?:boolean;error?:string};
export async function fulfillPaidOrder(orderId:string,verifiedPayment=false):Promise<FulfillmentResult>{
 const admin=createAdminClient();const lookup=await admin.from("orders").select("product_id,provider").eq("id",orderId).single();
 if(lookup.error||!lookup.data)return{ok:false,error:"订单不存在。"};const productId=String(lookup.data.product_id||"");
 if(productId.startsWith("toolquote:")){if(!verifiedPayment)return{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};const rpc=await admin.rpc("fulfill_tool_order",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"工具权限开通暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"工具权限开通暂未完成。"};}
 if(allToolsPassOffer(productId)){
  if(!verifiedPayment)return {ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};
  const rpc=await admin.rpc("lingxi_fulfill_paid_tool_pass",{p_order_id:orderId});
  if(rpc.error)return {ok:false,error:"工具包支付已确认，权益开通等待重试。"};
  const result=rpc.data as FulfillmentResult|null;
  return result?.ok?result:{ok:false,error:result?.error||"工具包开通暂不可用"};
 }
 if(isMarketProductId(productId)){
  if(!verifiedPayment)return {ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};
  const rpc=await admin.rpc("sasi_market_record_verified_sale",{p_order_id:orderId});
  if(rpc.error)return {ok:false,error:"商品交付结算暂未完成，请保留付款记录。"};
  const result=rpc.data as FulfillmentResult|null;
  return result?.ok?result:{ok:false,error:result?.error||"商品交付验证未完成。"};
 }
 if(softwareOffer(productId)){
  if(!verifiedPayment)return {ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};
  const rpc=await admin.rpc("sasi_grant_software_delivery",{p_order_id:orderId});
  if(rpc.error)return {ok:false,error:"软件交付尚未完成，请核查付款与安装包。"};
  const result=rpc.data as FulfillmentResult|null;
  return result?.ok?result:{ok:false,error:result?.error??"软件交付验收未通过。"};
 }
 const usd=getUsdBalanceProduct(productId);if(usd){if(!verifiedPayment)return{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};const rpc=await admin.rpc("credit_sasi_usd_topup",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"美元余额入账暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"美元余额入账暂未完成。"};}
 const product=getProduct(productId);if(!product||!product.sasiAmountFen)return{ok:false,error:"订单产品配置无效。"};
 if(!verifiedPayment)return{ok:false,error:"PROVIDER_PAYMENT_VERIFICATION_REQUIRED"};
 const rpc=await admin.rpc("credit_sasi_topup",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"余额入账暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"余额入账暂未完成。"};
}
