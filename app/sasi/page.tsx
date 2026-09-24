import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"灵犀场 SASI｜创作、构建与多模型协作",
  description:"SASI 工作台已开放。连接自己的模型 API，继续推理、编剧、构建与生产；托管能力按实时状态开放。",
  alternates:{canonical:"/sasi"},
};

export default async function SasiPage(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  return <SasiWorkspace accountEmail={user?.email??null}/>;
}
