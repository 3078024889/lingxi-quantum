import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";
export const metadata:Metadata={
 title:"SASI 智能软件｜原创软件 · 开发者发布｜灵犀场",
 description:"SASI 智能软件支持开发者发布 MT5 EA、交易指标、自动化程序和原创成品软件。安全审核后展示，完成付款验证后自动交付。",
 alternates:{canonical:"/sasi"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>}
