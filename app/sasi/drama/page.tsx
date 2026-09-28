import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiByokVideoStudio from "@/components/SasiByokVideoStudio";

export const metadata:Metadata={
  title:"SASI 短剧｜灵犀场",
  description:"描述人物、动作、场景和镜头变化，调整时长与画幅，确认费用后生成视频。",
  alternates:{canonical:"/sasi/drama"},
};

export default function SasiDramaPage(){
  return <>
    <Nav/>
    <main className="min-h-screen bg-[var(--lx-bg)]">
      <SasiByokVideoStudio/>

    </main>
    <Footer/>
  </>;
}
