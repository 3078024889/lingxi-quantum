import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOpenMarketplace from "@/components/SasiOpenMarketplace";

export const metadata:Metadata={
 title:"SASI 软件市场｜MT5 EA、成品软件与源码授权｜灵犀场 LINGXIFIELD",
 description:"灵犀场 SASI 软件市场提供经过审核的 MT5 EA、交易指标、自动化程序、桌面软件和源码授权。支持开发者入驻、CNY 与 USD 标价、私有文件存储、付款核验、订单授权与安全下载。",
 keywords:["SASI 软件市场","MT5 EA","MT5 自动交易","交易指标","软件源码授权","自动化软件","数字软件交付","灵犀场"],
 alternates:{canonical:"/sasi"}
};
export default function Page(){return <><Nav/><SasiOpenMarketplace/><Footer/></>;}
