import type { Metadata } from "next";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";
import Footer from "@/components/Footer";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜一键成片，一念即达，一念显化",
  description:
    "灵犀场 SASI 是贯穿理解、策划、制作、审校与交付的智能创作平台，覆盖影像叙事、网站与应用构建，并连接意识显化与场域精测。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "灵犀场 SASI｜一键成片，一念即达，一念显化",
    description: "一个想法，在这里变成网站、应用、短剧与视频。一键成片，一念即达，一念显化。",
    url: "/",
    images: [{ url: "/og-sasi-20260908.png", width: 1672, height: 941, alt: "灵犀场 SASI · 一念成片，一念显化" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀场 SASI｜一键成片，一念即达，一念显化",
    description: "一个想法，在这里变成网站、应用、短剧与视频。",
    images: ["/og-sasi-20260908.png"],
  },
};

export default async function Home() {
  const user = isSupabasePublicConfigured() ? await getServerUser(createClient()) : null;
  return <><SasiWorkspace accountEmail={user?.email ?? null} /><div className="lg:ml-[286px]"><Footer /></div></>;
}
