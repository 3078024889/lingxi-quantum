import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TarotReadingFlow from "./reading/TarotReadingFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "灵犀量子塔罗 · 与你的生命场建立连接 | Lingxi Quantum Tarot | Lingxi",
  description: "每一个意识，都携带独特的信息频率。当你与灵犀场连接，场域将根据你的命盘数据，展开专属于你的三张生命镜像牌。Every consciousness carries its own frequency. Connect with the field, and it unfolds your own three-card life mirror.",
  alternates: { canonical: "/tarot" },
};

export default function TarotPage() {
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
