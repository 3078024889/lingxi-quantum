import type {Metadata} from "next";
import {Suspense} from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiOneSurface from "@/components/SasiOneSurface";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"SASI｜灵犀场",
 description:"短剧、网站、书本、学习和科研，在同一个 SASI 工作台继续完成。",
 alternates:{canonical:"/sasi"},
};

export default function Page(){
 return <><Nav/><Suspense fallback={<main className="lx11-page"/>}><SasiOneSurface/></Suspense><Footer/></>;
}
