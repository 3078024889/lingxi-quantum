import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { getUsdBalanceProduct } from "@/lib/usd-products";

type FulfillmentResult={ok:boolean;alreadyPaid?:boolean;error?:string};

export async function fulfillPaidOrder(orderId:string):Promise<FulfillmentResult>{
 const admin=createAdminClient();
 const lookup=await admin.from("orders").select("product_id,provider").eq("id",orderId).single();
 if(lookup.error||!lookup.data)return{ok:false,error:"订单不存在。"};
 const productId=String(lookup.data.product_id||"");
 if(productId.startsWith("toolquote:")){
  const rpc=await admin.rpc("fulfill_tool_order",{p_order_id:orderId});
  if(rpc.error)return{ok:false,error:"工具权限开通暂未完成，请稍后重试。"};
  const result=rpc.data as FulfillmentResult|null;
  return result?.ok?result:{ok:false,error:result?.error??"工具权限开通暂未完成。"};
 }
 const usd=getUsdBalanceProduct(productId);
 if(usd){
  const rpcName=usd.wallet==="ai"?"credit_ai_usd_topup":"credit_sasi_usd_topup";
  const rpc=await admin.rpc(rpcName,{p_order_id:orderId});
  if(rpc.error)return{ok:false,error:"USD 余额入账暂未完成，请稍后重试。"};
  const result=rpc.data as FulfillmentResult|null;
  return result?.ok?result:{ok:false,error:result?.error??"USD 余额入账暂未完成。"};
 }
 const product=getProduct(productId);
 if(!product)return{ok:false,error:"订单产品配置无效。"};
 if(product.group==="ai"&&product.aiAmountFen){
  const rpc=await admin.rpc("credit_ai_topup",{p_order_id:orderId});
  if(rpc.error)return{ok:false,error:"AI 余额入账暂未完成，请稍后重试。"};
  const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"AI 余额入账暂未完成。"};
 }
 if(product.group==="production"&&product.sasiAmountFen){
  const rpc=await admin.rpc("credit_sasi_topup",{p_order_id:orderId});
  if(rpc.error)return{ok:false,error:"制作账户入账暂未完成，请稍后重试。"};
  const result=rpc.data as FulfillmentResult|null;return result?.ok?result:{ok:false,error:result?.error??"制作账户入账暂未完成。"};
 }
 const rpc=await admin.rpc("fulfill_paid_order",{p_order_id:orderId,p_days:product.days==null?365:product.days});
 if(rpc.error)return{ok:false,error:"权益开通暂未完成，请稍后重试。"};
 const result=rpc.data as FulfillmentResult|null;
 return result?.ok?result:{ok:false,error:result?.error??"权益开通暂未完成。"};
}
