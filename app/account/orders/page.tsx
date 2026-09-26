import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import AccountOrdersHistory, { type AccountOrderViewRow } from "@/components/AccountOrdersHistory";

export const metadata = { title: "订单与使用记录 | 灵犀场 LINGXIFIELD", robots:{index:false,follow:false} };

type OrderRow={
  id:string; product_id:string; amount_rmb:number|null; amount_usd:number|null;
  currency:"CNY"|"USD"|null;
  status:string; provider:string|null; created_at:string; paid_at:string|null;
};

export default async function OrdersPage({searchParams}:{searchParams?:{payment?:string}}){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  let rows:OrderRow[]=[];
  let loadFailed=false;
  const paymentState=searchParams?.payment==="pending"?"pending":searchParams?.payment==="error"?"error":null;

  if(user&&supabase){
    const {data,error}=await supabase.from("orders")
      .select("id,product_id,amount_rmb,amount_usd,currency,status,provider,created_at,paid_at")
      .eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);
    loadFailed=!!error;
    rows=(data as OrderRow[]|null)??[];
  }

  const orders:AccountOrderViewRow[]=rows.map(o=>{
    const product=getProduct(o.product_id);
    return {...o,group:product?.group??null,nameZh:product?.name??null,nameEn:product?.nameEn??null};
  });

  return <><Nav/><main className="lx11-page"><AccountOrdersHistory signedIn={!!user} loadFailed={loadFailed} paymentState={paymentState} orders={orders}/></main><Footer/></>;
}
