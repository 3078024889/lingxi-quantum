import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";
export const metadata:Metadata={
  title:"SASI 智能软件与卖家服务｜灵犀场 LINGXIFIELD",
  description:"SASI 智能软件支持原创软件发布、源码授权、开发者入驻与安全数字交付；哥白尼 SI9.5 仅提供 ¥6,900 源码授权版。",
  alternates:{canonical:"/sasi"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>;}
