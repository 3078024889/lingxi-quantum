import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";
export const metadata:Metadata={
 title:"SASI 智能软件开放市场｜免费入驻 · 成交佣金15%｜灵犀场",
 description:"开发者可免费申请入驻 SASI 智能软件市场，发布 MT5 EA、交易指标、自动化程序和成品软件。成交后收取15%平台服务费，审核后安全自动交付。",
 alternates:{canonical:"/sasi/marketplace"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>}
