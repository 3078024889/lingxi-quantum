import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RelationshipFlow from "./RelationshipFlow";

export const metadata = {
  title: "关系共振图谱 | 灵犀 · Relationship Resonance Map | Lingxi",
  description: "输入两个人的出生信息，看两份生命向量放在一起，哪里共鸣、哪里互补、哪里容易摩擦——适用于亲密关系、合伙、任何两人关系。",
  alternates: { canonical: "/relationship" },
};

export default function RelationshipPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <RelationshipFlow />
      </main>
      <Footer />
    </>
  );
}
