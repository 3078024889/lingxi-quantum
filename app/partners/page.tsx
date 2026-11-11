import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PartnerGrowthPortal from "@/components/partners/PartnerGrowthPortal";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";

export const metadata:Metadata={
 title:"Free Widgets for Websites | LINGXIFIELD Partner Network",
 description:"Embed the verified Global SIAI directory, anonymous free local-tools directory and public QR generator on your website. No signup or API key required.",
 alternates:{canonical:PRIMARY_SITE+"/partners"},
 openGraph:{title:"LINGXIFIELD — SIAI, Free Local Tools & QR Widgets",url:PRIMARY_SITE+"/partners"}
};
export default function PartnersPage(){
 return <><Nav/><PartnerGrowthPortal/><Footer/></>;
}
