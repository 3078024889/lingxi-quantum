import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";

// Seller workspace uses live seller-scoped data; do not serve a stale ISR/static HTML snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata:Metadata={
 title:"卖家工作台｜SASI 智能软件市场｜灵犀场",
 description:"管理卖家入驻、软件商品发布、私密文件上传、安全审核、销售结算与自动交付。",
 robots:{index:false,follow:true},
 alternates:{canonical:"/sasi/seller"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace view="seller"/><Footer compact/></>}
