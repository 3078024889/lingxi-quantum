import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RelationshipFlow from "./RelationshipFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const metadata = {
  title: "关系共振 · 照见两个生命的交汇 | Lingxi Relationship Resonance",
  description: "输入两个人的出生信息，照见两套生命结构如何靠近、映照、互补与共同形成关系——适用于深度关系共振、合伙商业关系与其他重要连接。",
  alternates: { canonical: "/relationship" },
};

export default function RelationshipPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <FieldProductIntroduction href="/relationship" />
        <div id="field-assessment"><RelationshipFlow /></div>
      </main>
      <Footer />
    </>
  );
}
