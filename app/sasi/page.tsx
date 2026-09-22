import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiCommandCenter from "@/components/SasiCommandCenter";
import SasiWorkspace from "./SasiWorkspace";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"灵犀场 SASI｜从一个念头开始创作",
  description:"带来一个想法、附件或任务。SASI 帮你进入短剧、导演、网站应用、研究与更多创作工作流。",
  alternates:{canonical:"/sasi"}
};

const legacyViews=new Set(["director","drama","code","skills","connections","billing","works","account","project"]);

export default async function SasiPage({searchParams}:{searchParams?:{view?:string}}){
  const view=searchParams?.view;
  if(view&&legacyViews.has(view)){
    const supabase=isSupabasePublicConfigured()?createClient():null;
    const user=supabase?await getServerUser(supabase):null;
    return <SasiWorkspace accountEmail={user?.email??null}/>;
  }

  return <>
    <Nav/>
    <SasiCommandCenter/>
    <Footer/>
  </>;
}
