import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SasiSoftwareOrders from "@/components/SasiSoftwareOrders";
export const metadata={title:"SASI 智能软件订单与下载｜灵犀场",robots:{index:false,follow:false}};
export default function Page(){return <><Nav/><main className="lx11-page"><div style={{width:"min(970px,100%)",margin:"20px auto 60px",padding:"0 12px"}}>
<Link href="/sasi" style={{fontSize:13,color:"#2763a0"}}>← SASI 智能软件</Link>
<h1 style={{fontSize:30,fontWeight:750,margin:"20px 0 8px"}}>我的 SASI 软件</h1>
<p style={{fontSize:14,color:"var(--lx-muted)",lineHeight:1.8}}>已核验付款并完成自动交付的订单，可在这里生成限时下载链接。历史充值与退款订单继续保留在 <Link href="/account/orders" style={{textDecoration:"underline"}}>订单与使用记录</Link>。</p>
<SasiSoftwareOrders/></div></main><Footer/></>;}
