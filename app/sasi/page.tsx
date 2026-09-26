import type {Metadata} from "next";
import {redirect} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiCommandCenter from "@/components/SasiCommandCenter";
import SasiAutonomyEntrances from "@/components/SasiAutonomyEntrances";
import SasiNativeCreatePanel from "@/components/SasiNativeCreatePanel";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"灵犀场 SASI｜创作、短剧、资料智能体与科研",
  description:"从一个问题、想法、故事或资料开始，让 SASI 理解目标、组织步骤并完成创作与处理。",
  alternates:{canonical:"/sasi"},
};

export default function SasiPage({searchParams}:{searchParams?:{view?:string}}){
  const view=typeof searchParams?.view==="string"?searchParams.view:"";
  if(view==="billing")redirect("/sasi/pricing");
  if(view==="drama"||view==="director")redirect("/sasi/drama");
  if(view==="connections")redirect("/sasi/connections");
  if(view==="account")redirect("/account");
  return <>
    <Nav/>
    <SasiCommandCenter/>
    <SasiNativeCreatePanel/>
    <SasiAutonomyEntrances/>
    <Footer/>
  </>;
}
