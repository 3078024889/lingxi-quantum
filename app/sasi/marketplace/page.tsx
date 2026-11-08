import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";
export const metadata:Metadata={
 title:"SASI 智能软件市场｜软件作品 · 开发者发布｜灵犀场",
 description:"开发者可免费申请入驻 SASI 智能软件市场，发布 MT5 EA、交易指标、自动化程序和成品软件。审核后安全交付。具体费用仅在卖家确认协议时披露。",
 alternates:{canonical:"/sasi/marketplace"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>}
