import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiConnectionsClient from "@/components/SasiConnectionsClient";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "连接模型与 API｜灵犀场 SASI",
  description: "仅在需要外部模型或服务时打开连接设置。",
  alternates: { canonical: "/sasi/connections" },
};

export default async function Page() {
  const supabase = isSupabasePublicConfigured() ? createClient() : null;
  const user = supabase ? await getServerUser(supabase) : null;

  return (
    <>
      <Nav />
      <SasiConnectionsClient accountEmail={user?.email ?? null} />
      <Footer />
    </>
  );
}
