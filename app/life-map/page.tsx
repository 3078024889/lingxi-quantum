import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LifeMapFlow from "./LifeMapFlow";
import FieldProductIntroduction from "@/components/FieldProductIntroduction";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "生命图谱 · 照见你的生命结构 | 灵犀场 Life Blueprint",
  description:
    "西方占星、中式八字、紫微斗数、玛雅圣历与吠陀占星交叉映照，温柔且如实地照见你携带而来的生命结构。A multidimensional Life Blueprint reflected through five symbolic systems.",
  alternates: { canonical: "/life-map" },
};

export default function LifeMapPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16">
        <FieldProductIntroduction href="/life-map" />
        <div id="field-assessment"><LifeMapFlow /></div>
      </main>
      <Footer />
    </>
  );
}
