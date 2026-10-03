import type {Metadata} from "next";
import {pageGeoFact} from "@/lib/seo/site-facts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiPricingCurrencyClient from "@/components/SasiPricingCurrencyClient";

export const dynamic="force-dynamic";
const pricingFact=pageGeoFact("sasi-pricing","zh");
export const metadata:Metadata={title:pricingFact.title,description:pricingFact.description,alternates:{canonical:"/sasi/pricing"}};

export default function Page(){return <><Nav/><SasiPricingCurrencyClient/><Footer/></>}
