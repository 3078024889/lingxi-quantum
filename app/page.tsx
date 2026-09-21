import type { Metadata } from "next";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";
import Link from "next/link";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜一键成片，一念即达，一念显化",
  description:
    "灵犀场 SASI 是贯穿理解、策划、制作、审校与交付的智能创作平台，覆盖影像叙事、网站与应用构建，并连接意识显化与场域精测。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "灵犀场 SASI｜一念即达，让想象力成为生产力",
    description: "从一个想法，到一个新的世界。带来剧本、角色与场景，先看方案与预算，再开始创作。",
    url: "/",
    images: [{ url: "/og-sasi-20260920.png", width: 1672, height: 941, alt: "灵犀场 SASI · 一念即达 · 让想象力成为生产力" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀场 SASI｜一键成片，一念即达，一念显化",
    description: "一个想法，在这里变成网站、应用、短剧与视频。",
    images: ["/og-sasi-20260920.png"],
  },
};

export default async function Home() {
  const user = isSupabasePublicConfigured() ? await getServerUser(createClient()) : null;
  return <><SasiWorkspace accountEmail={user?.email ?? null} /><footer className="flex flex-wrap justify-center gap-6 px-6 py-6 text-sm opacity-60 lg:ml-[260px]"><span>灵犀场 SASI</span><Link href="/terms">服务协议</Link><Link href="/privacy">隐私政策</Link><Link href="/refunds">充值与退款</Link></footer></>;
}
