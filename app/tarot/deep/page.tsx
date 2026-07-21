import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TarotDeepFlow from "./TarotDeepFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "灵犀量子塔罗 · 深度探索 $9.9 | Lingxi Quantum Tarot Deep Exploration | Lingxi",
  description: "专属于你的过去/现在/未来三张牌阵——由你的真实命盘数据确定，不是随机抽取。Your own Past/Present/Future spread, determined by your real chart data, not a random draw.",
  alternates: { canonical: "/tarot/deep" },
};

export default function TarotDeepPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <TarotDeepFlow />
      </main>
      <Footer />
    </>
  );
}
