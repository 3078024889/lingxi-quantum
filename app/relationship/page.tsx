import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RelationshipFlow from "./RelationshipFlow";

export const metadata = {
  title: "关系共振图谱 | 灵犀 · Relationship Resonance Map | Lingxi",
  description: "输入两个人的出生信息，照见两套生命结构如何靠近、映照、互补与共同形成关系——适用于深度关系共振、合伙商业关系与其他重要连接。",
  alternates: { canonical: "/relationship" },
};

export default function RelationshipPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <RelationshipFlow />
      </main>
      <Footer />
    </>
  );
}
