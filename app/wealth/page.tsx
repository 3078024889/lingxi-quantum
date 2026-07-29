import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WealthFlow from "./WealthFlow";

export const metadata = {
  title: "财富创造地图 | 灵犀场 Wealth Creation Map | Lingxi Field",
  description:
    "从真实出生数据算出你的创造类型与五个财富维度分数，即时呈现，无需登录——不是预测发财，是探索你如何创造价值。Your creation type and five wealth dimension scores, shown right away.",
  alternates: { canonical: "/wealth" },
};

export default function WealthPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <WealthFlow />
      </main>
      <Footer />
    </>
  );
}
