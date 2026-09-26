import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiAutonomousVideoStudio from "@/components/SasiAutonomousVideoStudio";

export const metadata:Metadata={
  title:"SASI 短剧｜灵犀场",
  description:"写下故事或剧本，让 SASI 整理人物、场景、镜头、字幕和节奏，并生成可以直接预览的视频草片。",
  alternates:{canonical:"/sasi/drama"},
};

export default function SasiDramaPage(){
  return <>
    <Nav/>
    <main className="min-h-screen bg-[var(--lx-bg)]">
      <SasiAutonomousVideoStudio/>
      <section className="mx-auto max-w-5xl px-5 pb-12">
        <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
          <b className="text-[var(--lx-ink)]">从草片继续走向完整短剧</b>
          <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">
            SASI 会继续学习人物一致性、场景延续、镜头语言、节奏和成片质量，让同一份故事逐步进入更完整的导演创作流程。
          </p>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
