import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiPricingCurrencyClient from "@/components/SasiPricingCurrencyClient";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"SASI 余额｜灵犀场",
 description:"充值 SASI 余额，用于灵犀场提供的计算、合成与其他明确收费能力。人民币与美元独立保存。",
 alternates:{canonical:"/sasi/pricing"},
};

export default function Page(){
 return <><Nav/><SasiPricingCurrencyClient/><Footer/></>;
}
