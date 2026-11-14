import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiMarketplaceProductDetail from "@/components/SasiMarketplaceProductDetail";

export const metadata={
 title:"SASI 软件商品详情｜版本、授权与安全交付｜灵犀场",
 description:"查看 SASI 软件商品的功能说明、适用环境、CNY 与 USD 价格、源码授权范围、支付核验及订单安全交付信息。"
};
export default function Page(){return <><Nav/><SasiMarketplaceProductDetail/><Footer/></>}
