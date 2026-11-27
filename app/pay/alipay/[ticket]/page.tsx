import {notFound} from "next/navigation";
import {headers} from "next/headers";
import {readAlipayHandoff} from "@/lib/alipay-handoff";
import {createAdminClient} from "@/lib/supabase/admin";
import {alipayEnabled,createAlipayPaymentUrl} from "@/lib/alipay";
import AlipayHandoff from "@/components/AlipayHandoff";

export const dynamic="force-dynamic";
export const metadata={title:"支付宝付款｜灵犀场",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function AlipayPayment({params}:{params:Promise<{ticket:string}>}){
 const orderId=readAlipayHandoff((await params).ticket);
 if(!orderId||!alipayEnabled())notFound();
 const {data:order,error}=await createAdminClient().from("orders")
  .select("id,product_id,amount_rmb,currency,status,provider_payment_id")
  .eq("id",orderId).eq("provider","alipay").eq("currency","CNY").maybeSingle();
 if(error||!order)notFound();
 if(order.status!=="pending")return <main style={{padding:32}}>这笔订单已结束，请返回订单记录查看。</main>;
 const amount=Number(order.amount_rmb);
 if(!Number.isFinite(amount)||amount<=0||!/^LX[A-Za-z0-9]{1,62}$/.test(order.provider_payment_id||""))notFound();
 // Provider callbacks use the registered canonical domain, never a supplied Host.
 const base="https://lingxifield.cn";
 const quoteId=/^toolquote:([0-9a-f-]{36})$/i.exec(order.product_id||"")?.[1];
 const destination=quoteId?"/tools/pay?quoteId="+quoteId+"&paid=1":"/account/orders";
 const gatewayUrl=createAlipayPaymentUrl({outTradeNo:order.provider_payment_id,amountRmb:amount,
  subject:"灵犀场订单",notifyUrl:base+"/api/pay/alipay/notify",
  returnUrl:base+"/api/pay/alipay/return?orderId="+order.id+"&dest="+encodeURIComponent(destination),
  mobile:/Android|iPhone|iPad|iPod|Mobile/i.test((await headers()).get("user-agent")||"")});
 return <AlipayHandoff gatewayUrl={gatewayUrl} amount={amount.toFixed(2)}/>;
}
