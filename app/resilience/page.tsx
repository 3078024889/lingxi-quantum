import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ResilienceFlow from "./ResilienceFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const metadata = {
  title: "生命韧性指数 | 灵犀场 Life Resilience Index | Lingxi Field",
  description:
    "沿着你的生命结构展开彼此关联的韧性节点，照见力量如何流动、恢复如何发生，以及生命如何重新接住自己。Explore how strength, recovery, and rebalancing move through your life structure.",
  alternates: { canonical: "/resilience" },
};

export default function ResiliencePage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/resilience" />
        <div id="field-assessment"><ResilienceFlow /></div>
      </main>
      <Footer />
    </>
  );
}
