import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ResilienceFlow from "./ResilienceFlow";

export const metadata = {
  title: "生命韧性指数测试 | 灵犀场 Life Resilience Index | Lingxi Field",
  description:
    "不是问你命硬不硬——从真实出生数据算出五项确定性分数：压力恢复、变化适应、危机反弹、长期坚持、精神稳定，看清你的韧性具体是哪种类型，即时呈现，无需登录。Five deterministic resilience scores computed from your real birth chart, shown right away.",
  alternates: { canonical: "/resilience" },
};

export default function ResiliencePage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <ResilienceFlow />
      </main>
      <Footer />
    </>
  );
}
