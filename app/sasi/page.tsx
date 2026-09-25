import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiCommandCenter from "@/components/SasiCommandCenter";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"灵犀场 SASI｜AI创作、短剧、资料智能体与科研",
  description:"SASI 是灵犀场的 AI 创作入口：AI短剧、资料智能体、科研与模型连接，从一个任务直接进入可执行工作流。",
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
    <Footer/>
  </>;
}
