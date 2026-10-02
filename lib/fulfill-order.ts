import {createAdminClient} from "@/lib/supabase/admin";
import {getProduct} from "@/lib/plans";
import {getUsdBalanceProduct} from "@/lib/usd-products";
type FulfillmentResult={ok:boolean;alreadyPaid?:boolean;error?:string};
export async function fulfillPaidOrder(orderId:string):Promise<FulfillmentResult>{
 const admin=createAdminClient();const lookup=await admin.from("orders").select("product_id,provider").eq("id",orderId).single();
 if(lookup.error||!lookup.data)return{ok:false,error:"订单不存在。"};const productId=String(lookup.data.product_id||"");
 if(productId.startsWith("toolquote:")){const rpc=await admin.rpc("fulfill_tool_order",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"工具权限开通暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"工具权限开通暂未完成。"};}
 const usd=getUsdBalanceProduct(productId);if(usd){const rpc=await admin.rpc("credit_sasi_usd_topup",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"美元余额入账暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"美元余额入账暂未完成。"};}
 const product=getProduct(productId);if(!product||!product.sasiAmountFen)return{ok:false,error:"订单产品配置无效。"};
 const rpc=await admin.rpc("credit_sasi_topup",{p_order_id:orderId});if(rpc.error)return{ok:false,error:"余额入账暂未完成，请稍后重试。"};const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"余额入账暂未完成。"};
}
