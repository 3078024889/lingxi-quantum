import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PartnerGrowthPortal from "@/components/partners/PartnerGrowthPortal";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";

export const metadata:Metadata={
 title:"Free Widgets for Websites | LINGXIFIELD Partner Network",
 description:"Embed free QR tools and a verified Global SIAI directory on your own website. No signup, updated as new approved profiles are published.",
 alternates:{canonical:PRIMARY_SITE+"/partners"},
 openGraph:{title:"LINGXIFIELD — Free SIAI & QR Widgets for Websites",url:PRIMARY_SITE+"/partners"}
};
export default function PartnersPage(){
 return <><Nav/><PartnerGrowthPortal/><Footer/></>;
}
