import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiByokVideoStudio from "@/components/SasiByokVideoStudio";

export const metadata:Metadata={
  title:"SASI 短剧｜灵犀场",
  description:"连接自己的视频 API，确认预算后生成视频，费用由供应商直接结算。",
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
