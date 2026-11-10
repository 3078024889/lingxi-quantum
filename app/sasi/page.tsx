import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";

export const metadata:Metadata={
 title:"SASI 智能软件市场｜MT5 EA、成品软件与源码授权｜灵犀场 LINGXIFIELD",
 description:"灵犀场 SASI 智能软件市场提供经过审核的 MT5 EA、量化交易源码、成品软件、安装教程与源码授权。支持开发者发布、CNY 与 USD 标价、私有文件存储、付款核验、订单授权及安全自动交付。",
 keywords:["SASI 智能软件市场","MT5 EA","MT5 EA源码","量化交易源码","软件安装教程","成品软件","软件源码授权","自动交付","开发者软件发布","灵犀场"],
 alternates:{canonical:"/sasi"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>;}
