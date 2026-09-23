import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LxText from "@/components/LxText";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import BookSasiBalanceBar from "@/components/BookSasiBalanceBar";

export const metadata: Metadata = {
  title: "灵犀场书本 SASI｜把书本变成可持续对话的智能体",
  description:
    "上传 PDF、TXT、Markdown 或图片，把书本、论文和私人资料变成可检索、可追溯、按真实 AI 用量结算的私人智能体。",
  alternates: { canonical: "/ai-knowledge" },
};

export default function Page() {
  return (
    <>
      <Nav />
      <main className="lx10-page">
        <div className="lx10-wrap">
          <p className="lx10-kicker">
            <LxText
              zh="书本 SASI · 已上线"
              en="Book SASI · Live"
              ja="Book SASI · 公開中"
              ko="Book SASI · 사용 가능"
              fr="Book SASI · Disponible"
              de="Book SASI · Verfügbar"
              es="Book SASI · Disponible"
              pt="Book SASI · Disponível"
              ar="Book SASI · متاح الآن"
            />
          </p>

          <h1 className="lx10-title">
            <LxText
              zh="把一本书，变成一个可以持续对话的智能体。"
              en="Turn a book into an intelligence you can keep talking with."
              ja="一冊の本を、継続して対話できる知的エージェントへ。"
              ko="한 권의 책을 계속 대화할 수 있는 지능형 에이전트로 바꾸세요."
              fr="Transformez un livre en intelligence avec laquelle vous pouvez continuer à dialoguer."
              de="Verwandeln Sie ein Buch in eine Intelligenz, mit der Sie dauerhaft weiterarbeiten können."
              es="Convierte un libro en una inteligencia con la que puedas seguir conversando."
              pt="Transforme um livro em uma inteligência com a qual você possa continuar conversando."
              ar="حوّل كتابًا إلى وكيل ذكي يمكنك مواصلة الحوار معه."
            />
          </h1>

          <p className="lx10-lead">
            <LxText
              zh="上传 PDF、TXT、Markdown 或书页图片。灵犀场先从原文建立私人资料库，再让 SASI 基于真实出处回答、比较、解释和继续追问。"
              en="Upload PDF, TXT, Markdown or page images. LINGXIFIELD builds a private source library first, then SASI answers, compares and explains from the real text."
              ja="PDF、TXT、Markdown、書籍ページ画像を追加できます。まず原文からプライベート資料庫を作り、SASI が実際の出典に基づいて回答・比較・解説します。"
              ko="PDF, TXT, Markdown 또는 책 페이지 이미지를 올리세요. 먼저 원문으로 개인 자료함을 만들고, SASI가 실제 출처를 바탕으로 답변·비교·설명을 제공합니다."
              fr="Importez des PDF, TXT, Markdown ou des images de pages. LINGXIFIELD crée d’abord une bibliothèque privée, puis SASI répond, compare et explique à partir du texte réel."
              de="Laden Sie PDF, TXT, Markdown oder Buchseitenbilder hoch. LINGXIFIELD erstellt zuerst eine private Quellenbibliothek; SASI antwortet, vergleicht und erklärt anschließend anhand des Originaltexts."
              es="Sube PDF, TXT, Markdown o imágenes de páginas. LINGXIFIELD crea primero una biblioteca privada y SASI responde, compara y explica a partir del texto real."
              pt="Envie PDF, TXT, Markdown ou imagens de páginas. A LINGXIFIELD cria primeiro uma biblioteca privada e o SASI responde, compara e explica com base no texto real."
              ar="ارفع ملفات PDF أو TXT أو Markdown أو صور صفحات الكتب. ينشئ LINGXIFIELD أولًا مكتبة مصادر خاصة، ثم يجيب SASI ويقارن ويشرح اعتمادًا على النص الحقيقي."
            />
          </p>

          <BookSasiBalanceBar />

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/ai-learning" className="rounded-full border border-slate-200 px-4 py-2">
              <LxText
                zh="学习 SASI"
                en="Learning SASI"
                ja="学習 SASI"
                ko="학습 SASI"
                fr="SASI Études"
                de="Lern-SASI"
                es="SASI Aprendizaje"
                pt="SASI Aprendizagem"
                ar="SASI للتعلّم"
              />
            </Link>
            <Link href="/ai-research" className="rounded-full border border-slate-200 px-4 py-2">
              <LxText
                zh="科研 SASI"
                en="Research SASI"
                ja="研究 SASI"
                ko="연구 SASI"
                fr="SASI Recherche"
                de="Forschungs-SASI"
                es="SASI Investigación"
                pt="SASI Pesquisa"
                ar="SASI للبحث"
              />
            </Link>
          </div>

          <KnowledgeWorkspace mode="book" />
        </div>
      </main>
      <Footer />
    </>
  );
}
