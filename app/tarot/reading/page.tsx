import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TarotReadingFlow from "./TarotReadingFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "灵犀量子生命镜像 · 三重镜像深度解读 | Lingxi Quantum Life Mirror Three-Mirror Reading | Lingxi",
  description: "专属于你的三张牌——潜意识镜像、当下共振、未来展开，由你的真实命盘数据确定，不是随机抽取。Your own three cards — determined by your real chart data, not a random draw.",
  alternates: { canonical: "/tarot/reading" },
};

export default function TarotReadingPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <TarotReadingFlow />
      </main>
      <Footer />
    </>
  );
}
