import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SasiWorkspace from "./SasiWorkspace";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"灵犀场 AI 创作",description:"从一个想法进入短剧、网站、应用与多媒体创作。",alternates:{canonical:"/sasi"}};

const items=[
 ["/sasi?view=drama","AI 短剧生成","剧本、角色、场景、分镜、故事板、配音与成片流程。"],
 ["/sasi?view=director","苍玄导演","面向漫剧、短剧、电影、广告、MV 与游戏 CG 的导演工作流。"],
 ["/sasi?view=code","网站与应用","从需求到代码、构建与部署的工程任务。"],
 ["/sasi/chat","灵犀场提问","围绕需求、知识、创意与代码直接开始对话。"],
] as const;

export default async function SasiPage({searchParams}:{searchParams?:{view?:string}}){
 const view=searchParams?.view;
 if(view){
  const supabase=isSupabasePublicConfigured()?createClient():null;
  const user=supabase?await getServerUser(supabase):null;
  return <SasiWorkspace accountEmail={user?.email??null}/>;
 }
 return <><Nav/><main className="lx10-page"><div className="lx10-wrap"><p className="lx10-kicker">AI 创作</p><h1 className="lx10-title">一念即达</h1><p className="lx10-lead">旧版 SASI 首页已退出公共入口。现在只保留任务入口：先选择要完成的结果，再进入对应工作流。</p><div className="lx10-divider"/><section className="lx10-grid">{items.map(([href,title,text])=><Link key={href} href={href} className="lx10-card lg"><h2>{title}</h2><p>{text}</p><div className="meta">开始 →</div></Link>)}</section><div className="lx10-actions"><Link href="/ai-wallet" className="lx10-ghost">AI 余额</Link><Link href="/sasi?view=connections" className="lx10-ghost">连接与 API</Link></div></div></main></>;
}
