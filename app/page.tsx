import type { Metadata } from "next";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜AI短剧制作、视频生成、AI编程、网站构建部署与意识显化",
  description:
    "灵犀场 LINGXIFIELD 是集 AI 创作与意识显化于一体的智能数字空间，支持 AI短剧制作、剧本智能解析、故事板与身份板生成、AI配音与长视频生成、AI编程、网站与应用构建部署，以及意识显化与场域精测。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "灵犀场 SASI｜AI短剧制作、视频生成与AI编程",
    description: "从一个想法到网站、应用、短剧与视频，并连接意识显化与场域精测。",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀场 SASI｜AI创作与构建工作台",
    description: "AI短剧、视频生成、AI编程、网站构建部署与意识显化。",
  },
};

export default async function Home() {
  const user = isSupabasePublicConfigured() ? await getServerUser(createClient()) : null;
  return <SasiWorkspace accountEmail={user?.email ?? null} />;
}
