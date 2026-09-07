import { getServerUser, createClient, isSupabasePublicConfigured } from "@/lib/supabase/server";
import SasiWorkspace from "./SasiWorkspace";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "灵犀场 SASI · AI 创作与构建工作台",
  description: "网站编程构建部署与 AI 短剧全流程工作台。",
  alternates: { canonical: "/sasi" },
};

export default async function SasiPage() {
  const user = isSupabasePublicConfigured() ? await getServerUser(createClient()) : null;
  return <SasiWorkspace accountEmail={user?.email ?? null} />;
}
