import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import SasiDramaLaunch from "@/components/SasiDramaLaunch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SASI AI短剧工坊｜灵犀场",
  description:
    "SASI AI短剧制作工作台：剧本、角色、身份板、场景、故事板、精分镜、配音、视频镜头、Timeline、字幕与成片。",
  alternates: { canonical: "/sasi/drama" },
};

export default async function SasiDramaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav />
      <SasiDramaLaunch accountEmail={user?.email ?? null} />
      <Footer />
    </>
  );
}
