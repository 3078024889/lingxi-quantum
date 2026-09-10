import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LifeMapFlow from "./LifeMapFlow";
import Bi from "@/components/Bi";

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
      <main className="lm-workbench-page min-h-screen">
        <header className="lm-workbench-hero">
          <div>
            <p><Bi zh="灵犀场 · LIFE BLUEPRINT" en="LINGXI FIELD · LIFE BLUEPRINT" /></p>
            <h1><Bi zh="生命图谱" en="Life Blueprint" /></h1>
            <span><Bi zh="填写信息 → 免费预览 → 解锁完整 PDF　｜　看见生命的结构，找到你的人生方向" en="Enter your details → Free preview → Unlock the complete PDF | See your life structure and find your direction" /></span>
          </div>
          <blockquote>
            <strong><Bi zh="每一个灵魂，都有一幅独一无二的生命图谱" en="Every soul carries a one-of-a-kind life blueprint" /></strong>
            <small>A HIGHER YOU&nbsp;&nbsp; A BRIGHTER WORLD</small>
          </blockquote>
        </header>
        <div id="field-assessment"><LifeMapFlow /></div>
      </main>
      <Footer />
    </>
  );
}
