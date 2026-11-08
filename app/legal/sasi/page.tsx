import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiLegalBody from "@/components/SasiLegalBody";
export const metadata:Metadata={
 title:"SASI 软件市场条款与系统声明｜灵犀场 LINGXIFIELD",
 description:"SASI 软件市场的服务范围、数字软件授权、付款交付、数据保护及交易软件风险说明。",
 alternates:{canonical:"/legal/sasi"}
};
export default function Page(){return <><Nav/><SasiLegalBody/><Footer/></>;}
