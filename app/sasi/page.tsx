import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiCommandCenter from "@/components/SasiCommandCenter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜从一个念头开始创作",
  description: "一个公开创作台。未完成接入的生产能力明确标记待上线，模型与 API 连接按需打开。",
  alternates: { canonical: "/sasi" },
};

export default function SasiPage() {
  return (
    <>
      <Nav />
      <SasiCommandCenter />
      <Footer />
    </>
  );
}
