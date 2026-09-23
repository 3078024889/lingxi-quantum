import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import SasiCommandCenter from "@/components/SasiCommandCenter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "灵犀场 SASI｜书本智能体已上线，创作生产能力持续接入",
  description:
    "书本 SASI 已可真实使用；AI 短剧、苍玄导演、网站与应用构建、AI 视频等创作生产能力明确标记待上线。",
  alternates: { canonical: "/sasi" },
};

export default function SasiPage() {
  return (
    <>
      <Nav />
      <div className="lx11-page lx11-sasi-page">
        <div className="lx11-sasi-wrap">
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700">
                  <LxText
                    zh="真实可用"
                    en="Available now"
                    ja="利用可能"
                    ko="현재 사용 가능"
                    fr="Disponible"
                    de="Jetzt verfügbar"
                    es="Disponible ahora"
                    pt="Disponível agora"
                    ar="متاح الآن"
                  />
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  <LxText
                    zh="书本 SASI：把书本和资料变成活的智能体"
                    en="Book SASI: turn books and sources into a living knowledge agent"
                    ja="Book SASI：本や資料を対話できる知識エージェントへ"
                    ko="Book SASI: 책과 자료를 대화형 지식 에이전트로"
                    fr="Book SASI : transformez livres et sources en agent de connaissance vivant"
                    de="Book SASI: Bücher und Quellen werden zu einem dialogfähigen Wissensagenten"
                    es="Book SASI: convierte libros y fuentes en un agente de conocimiento activo"
                    pt="Book SASI: transforme livros e fontes em um agente de conhecimento ativo"
                    ar="Book SASI: حوّل الكتب والمصادر إلى وكيل معرفة تفاعلي"
                  />
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  <LxText
                    zh="支持上传 PDF、TXT、Markdown 与图片；基于原文回答，并使用真实 AI 余额按实际模型用量结算。"
                    en="Upload PDF, TXT, Markdown and images; answers stay grounded in the source text and are billed from your real AI balance by actual model usage."
                    ja="PDF、TXT、Markdown、画像に対応。原文に基づいて回答し、実際のモデル使用量に応じて AI 残高から精算します。"
                    ko="PDF, TXT, Markdown, 이미지를 지원합니다. 원문에 근거해 답변하며 실제 모델 사용량만큼 AI 잔액에서 결제됩니다."
                    fr="PDF, TXT, Markdown et images sont pris en charge. Les réponses s’appuient sur les sources et sont facturées selon l’usage réel du modèle."
                    de="PDF, TXT, Markdown und Bilder werden unterstützt. Antworten basieren auf den Quellen und werden nach tatsächlicher Modellnutzung abgerechnet."
                    es="Admite PDF, TXT, Markdown e imágenes. Las respuestas se basan en las fuentes y se cobran según el uso real del modelo."
                    pt="Compatível com PDF, TXT, Markdown e imagens. As respostas usam as fontes e são cobradas pelo uso real do modelo."
                    ar="يدعم PDF وTXT وMarkdown والصور. تعتمد الإجابات على النص الأصلي وتُحاسب حسب الاستخدام الفعلي للنموذج."
                  />
                </p>
              </div>
              <Link
                href="/ai-knowledge"
                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <LxText
                  zh="打开书本 SASI →"
                  en="Open Book SASI →"
                  ja="Book SASI を開く →"
                  ko="Book SASI 열기 →"
                  fr="Ouvrir Book SASI →"
                  de="Book SASI öffnen →"
                  es="Abrir Book SASI →"
                  pt="Abrir Book SASI →"
                  ar="فتح Book SASI ←"
                />
              </Link>
            </div>
          </section>
        </div>
      </div>
      <SasiCommandCenter />
      <Footer />
    </>
  );
}
