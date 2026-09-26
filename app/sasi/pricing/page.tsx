import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiPricingCurrencyClient from "@/components/SasiPricingCurrencyClient";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"SASI 创作余额｜灵犀场",
 description:"选择人民币或美元支付币种。不同币种采用独立定价，不按实时汇率换算。",
 alternates:{canonical:"/sasi/pricing"},
};

export default function Page(){
 return <><Nav/><SasiPricingCurrencyClient/><Footer/></>;
}
