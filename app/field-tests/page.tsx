import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FieldInsightsSection from "@/components/FieldInsightsSection";
import Bi from "@/components/Bi";
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole, type ConsoleArtwork } from "@/components/FieldConsole";

export const metadata: Metadata = {
  title: "场域精测｜灵犀场 LINGXIFIELD",
  description: "进入灵犀场的生命图谱、关系共振、生命韧性、财富创造地图等数字报告服务。",
  alternates: { canonical: "/field-tests" },
};

export default function FieldTestsPage() {
  const products: Array<{href:string; artwork:ConsoleArtwork; title:string; en:string; description:string}> = [
    {href:"/resilience",artwork:"field-resilience",title:"生命韧性指数",en:"Life Resilience Index",description:"看见恢复、回稳与重新展开的内在结构。"},
    {href:"/romance",artwork:"field-romance",title:"桃花磁场指数",en:"Romance Resonance",description:"理解吸引、靠近与关系感知的独特纹理。"},
    {href:"/wealth",artwork:"field-wealth",title:"财富创造地图",en:"Wealth Creation Map",description:"照见价值、资源与创造力进入现实的方式。"},
    {href:"/daily",artwork:"field-tide",title:"今日潮汐",en:"Today's Tide",description:"读取当下节律，为今天建立清晰参照。"},
    {href:"/qian",artwork:"field-oracle",title:"生命灵签",en:"Lingxi Life Oracle",description:"从宇宙智慧中获得启示，为此刻的选择提供一份指引。"},
    {href:"/mirror",artwork:"field-mirror",title:"生命镜像",en:"Life Mirror",description:"在三重镜像中，看见此刻真实的自己。"},
    {href:"/relationship",artwork:"field-relationship",title:"关系共振",en:"Relationship Resonance",description:"照见两个独立生命如何相遇、回应与共创。"},
    {href:"/life-map",artwork:"field-blueprint",title:"生命图谱",en:"Life Blueprint",description:"整合多维生命结构，照见更完整的自己。"},
    {href:"/archetype",artwork:"field-blueprint",title:"生命原型",en:"Life Archetype",description:"让多重场域汇成可持续回看的生命原型。"},
  ];
  return <><Nav /><FieldConsole eyebrow="场域精测 · FIELD INSIGHTS" eyebrowEn="FIELD INSIGHTS" title="场域精测，读懂此刻的你" titleEn="Read the field of this moment" description="让多套确定性知识结构彼此映照，把抽象感受转化为可阅读、可回看、可由真实经历验证的生命档案。" descriptionEn="Let deterministic knowledge structures illuminate one another, turning felt experience into a readable life archive you can verify through lived reality." heroArtwork="field-blueprint" features={[{zh:"多维交叉映照",en:"Cross-system reflection",glyph:"◇"},{zh:"确定性生成",en:"Deterministic generation",glyph:"⌘"},{zh:"个人档案",en:"Personal archive",glyph:"▣"},{zh:"网页与 PDF",en:"Web and PDF",glyph:"⇩"}]} aside={<><ConsoleStatus title="场域精测总览" titleEn="Field overview"><p className="mt-3"><Bi zh="当前开放九项独立入口。每项产品都拥有专属输入、计算、报告与交付路径，不用实时模型临时拼接结论。" en="Nine independent entrances are available. Each has its own intake, calculation, report and delivery path rather than improvised live-model conclusions." /></p><Link href="/account" className="mt-4 inline-flex text-xs text-lattice"><Bi zh="查看我的真实档案 →" en="View my real archive →" /></Link></ConsoleStatus><ConsoleStatus glyph="✧" title="阅读原则" titleEn="Reading principle" tone="gold"><p className="mt-3"><Bi zh="报告提供观察坐标，不替你定义人生。重要结论应回到真实经历、关系、选择与感受中，由你亲自确认。" en="Reports provide coordinates for reflection, not a definition of your life. Return important findings to experience, relationship, choice and feeling for your own confirmation." /></p></ConsoleStatus></>}>
    <ConsolePanel><p className="text-xs font-semibold uppercase tracking-[.18em] text-lattice"><Bi zh="生命档案入口" en="LIFE ARCHIVE ENTRANCES" /></p><h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="选择此刻最需要被照见的方向" en="Choose what most needs to be seen now" /></h2><p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh="你不需要一次读完所有报告。先从当下最真实的问题进入，完成后它会留在你的个人场域中。" en="You do not need every report at once. Begin with the question that feels most real now; the completed work remains in your private field." /></p></ConsolePanel>
    <ConsoleSectionTitle zh="精选场域" en="Featured fields" actionHref="/account" actionZh="我的档案" actionEn="My archive" />
    <div className="lx-console-card-grid">{products.map((product)=><ConsoleCard key={product.href} href={product.href} artwork={product.artwork} title={product.title} titleEn={product.en} description={product.description} descriptionEn={product.description} />)}</div>
    <ConsoleSectionTitle zh="完整产品说明" en="Complete product orientation" />
    <FieldInsightsSection />
  </FieldConsole><Footer /></>;
}
