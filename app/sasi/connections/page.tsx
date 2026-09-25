import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import {createClient,getServerUser,isSupabasePublicConfigured} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"连接你的 AI 能力｜灵犀场 SASI",
  description:"把你已经在使用的模型服务接入灵犀场，让 SASI 在需要时调用它们完成创作、研究与处理任务。",
  alternates:{canonical:"/sasi/connections"},
};

export default async function Page(){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  return <><Nav/><main className="lx11-page">
    <div className="lx11-wrap py-14">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm text-[var(--lx-faint)]">SASI · 你的 AI 能力</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">把你已经拥有的 AI，接进同一个创作入口。</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">如果你已经在使用其他 AI 服务，可以把它们接入灵犀场。之后做短剧、研究或处理资料时，不必每次重新切换平台。</p>
      </section>
      <SasiConnectionsClient accountEmail={user?.email??null}/>
    </div>
  </main><Footer/></>;
}
