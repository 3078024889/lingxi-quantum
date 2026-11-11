import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiSoftwareMarket from "@/components/SasiSoftwareMarket";
export const metadata:Metadata={
  title:"SASI 智能软件与卖家服务｜灵犀场 LINGXIFIELD",
  description:"SASI 智能软件品牌。哥白尼 SI 9.5 MT5 自动交易软件、源码授权、模拟账户只读观察及可核验的数字软件交付。",
  alternates:{canonical:"/sasi"}
};
export default function Page(){return <><Nav/><SasiSoftwareMarket/><Footer/></>;}
