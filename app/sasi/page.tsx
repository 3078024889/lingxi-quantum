import type { Metadata } from "next";
import SasiWorkspace from "./SasiWorkspace";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI 工作台",
  description: "灵犀场 SASI 工作台：从需求、资料和项目出发，进入 AI 短剧、构建部署、Skills、连接、项目与结算。",
  alternates: { canonical: "/sasi" },
};

export default async function SasiPage() {
  const supabase = isSupabasePublicConfigured() ? createClient() : null;
  const user = supabase ? await getServerUser(supabase) : null;
  return <SasiWorkspace accountEmail={user?.email ?? null} />;
}
