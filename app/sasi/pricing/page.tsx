import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiPricingCurrencyClient from "@/components/SasiPricingCurrencyClient";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"余额｜灵犀场 SASI",description:"一个余额，全部 SASI 共用。",alternates:{canonical:"/sasi/pricing"}};

export default function Page(){return <><Nav/><SasiPricingCurrencyClient/><Footer/></>}
