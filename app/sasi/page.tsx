import type {Metadata} from "next";
import {pageGeoFact} from "@/lib/seo/site-facts";
import {Suspense} from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOneSurface from "@/components/SasiOneSurface";

export const dynamic="force-dynamic";
const sasiFact=pageGeoFact("sasi","zh");
export const metadata:Metadata={title:sasiFact.title,description:sasiFact.description,alternates:{canonical:"/sasi"}};

export default function Page(){
 return <><Nav/><Suspense fallback={<main className="lx11-page"/>}><SasiOneSurface/></Suspense><Footer/></>;
}
