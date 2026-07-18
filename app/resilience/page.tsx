import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ResilienceFlow from "./ResilienceFlow";

export const metadata = {
  title: "生命韧性指数测试 · 免费 | 灵犀 Life Resilience Index — Free Test | Lingxi",
  description:
    "不是问你命硬不硬——从真实出生数据算出五项确定性分数：压力恢复、变化适应、危机反弹、长期坚持、精神稳定，看清你的韧性具体是哪种类型。免费、即时、无需登录。Free instant test: five deterministic resilience scores computed from your real birth chart.",
  alternates: { canonical: "/resilience" },
};

export default function ResiliencePage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <ResilienceFlow />
      </main>
      <Footer />
    </>
  );
}
