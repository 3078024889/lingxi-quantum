import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { ConsoleSectionTitle, ConsoleStatus, FieldConsole } from "@/components/FieldConsole";
import ArchetypeWorkspace from "./ArchetypeWorkspace";

export const metadata: Metadata = {
  title: "生命原型 · 八流归一 | 灵犀场",
  description: "八项同主体场域证据汇流后生成生命原型；免费阅读十二个原型基石，登录查看真实八流进度。",
  alternates: { canonical: "/archetype" },
};

const FOUNDATIONS = [
  ["原型之核", "Archetype Core", "辨认多种情境变化之后，仍然反复居中的内在力量。", "Notice the inner force that stays central even when situations change."],
  ["生命本色", "Life Ground", "暂时放下角色与应答，观察无人催促时自然会守住什么。", "Set roles aside and notice what you naturally preserve without external pressure."],
  ["发端", "First Impulse", "回看一件事尚未成形以前，第一股行动力量从何处开始。", "Look back before an event took form and locate the first impulse toward action."],
  ["所向", "Life Direction", "把长期投入放在一起，辨认它们共同指向的现实方向。", "Place long-term commitments together and find the real direction they share."],
  ["感知之门", "Gate of Perception", "观察环境进入心里时，你最先捕捉的是哪些信息。", "Observe which signals reach your attention first when the world enters awareness."],
  ["判断之机", "Formation of Judgment", "区分感受、证据与结论，看看判断如何逐步形成。", "Separate feeling, evidence and conclusion to see how a judgment takes shape."],
  ["起行之法", "Way of Beginning", "找到意念跨入现实的第一个可执行动作。", "Find the first executable action that lets an intention enter reality."],
  ["成事之器", "Vessel of Completion", "看清什么流程、边界与收尾方式能真正托住所长。", "See which process, boundary and closure can reliably carry your strengths."],
  ["亲疏之度", "Measure of Nearness", "在靠近与退守之间，找到一段关系能够呼吸的距离。", "Find the breathable distance between closeness and withdrawal in a relationship."],
  ["共振之法", "Way of Resonance", "观察表达与倾听是否形成真实往返，而不是单向想象。", "Observe whether expression and listening form a real exchange rather than projection."],
  ["边界之所在", "Seat of Boundary", "说清愿意承担与不能承担，检验边界是否让关系更明。", "Name what you can and cannot carry, then see whether the boundary creates clarity."],
  ["现实之器", "Instrument of Reality", "把一次灵感固定成可重复流程，再用真实结果检验它。", "Turn one insight into a repeatable process and test it against real outcomes."],
] as const;

export default function LifeArchetypePage() {
  return <><Nav /><FieldConsole className="archetype-console" eyebrow="场域精测 · 汇流层" eyebrowEn="FIELD INSIGHTS · CONVERGENCE" title="生命原型，让八条生命支流汇成一张长期地图" titleEn="Life Archetype turns eight evidence streams into one evolving map" description="它不是另一份孤立测评。系统先核对同一主体、时间窗口与底层证据，再生成可追溯、可随新记录更新的原型档案。" descriptionEn="This is not another isolated test. The system verifies subject identity, time window and evidence before creating a traceable archetype archive that can evolve." heroArtwork="field-mirror" features={[{ zh: "同一主体核验", en: "Identity verified", glyph: "◎" }, { zh: "八流证据", en: "Eight evidence streams", glyph: "08" }, { zh: "365 天窗口", en: "365-day window", glyph: "◌" }, { zh: "版本持续更新", en: "Versioned evolution", glyph: "↻" }]} aside={<><ConsoleStatus glyph="◇" title="不是直接测出来" titleEn="Not a standalone test" tone="cyan"><p><Bi zh="生命原型只读取同一主体已经完成的八类场域证据。数据不足、身份不一致或旧记录缺证据时，系统会明确停止生成。" en="Life Archetype reads only eight completed same-subject evidence streams. Missing, mismatched or legacy evidence stops generation explicitly." /></p></ConsoleStatus><ConsoleStatus glyph="▣" title="完整报告交付" titleEn="Complete report delivery"><p><Bi zh="满足真实汇流条件后，账户可进入网页版完整档案。PDF 下载沿用正式报告交付流程，不以页面截图冒充报告。" en="Once real convergence conditions are met, the full web archive becomes available. PDF delivery follows the formal report flow and is never a webpage screenshot." /></p></ConsoleStatus></>}>
    <ArchetypeWorkspace>    <section className="archetype-intro-grid">
      <div className="archetype-portrait" role="img" aria-label="生命原型的多维意识场视觉" />
      <div className="archetype-intro-copy">
        <p className="archetype-kicker"><Bi zh="生命原型如何形成" en="HOW THE ARCHETYPE FORMS" /></p>
        <h2><Bi zh="先有真实记录，再有原型结论" en="Evidence comes before archetype conclusions" /></h2>
        <p><Bi zh="生命图谱、关系共振、生命韧性、桃花磁场、财富创造地图、今日潮汐、生命镜像与生命灵签，各自保留自己的证据。八流齐备后，系统寻找跨场景重复、相互增强、结构冲突与被压住的力量。" en="Life Blueprint, Relationship Resonance, Resilience, Romance, Wealth, Today's Tide, Life Mirror and Life Oracle each retain their own evidence. Once all eight are present, the system looks for repetition, amplification, tension and inhibited capacity." /></p>
        <div className="archetype-process"><span><b>01</b><Bi zh="完成八项同主体记录" en="Complete eight same-subject records" /></span><span><b>02</b><Bi zh="核对时间与证据叶" en="Verify time and evidence leaves" /></span><span><b>03</b><Bi zh="生成并持续更新原型" en="Generate and version the archetype" /></span></div>
        <Link href="#archetype-progress" className="archetype-primary-link"><Bi zh="查看我的真实汇流进度" en="View my real convergence progress" /> →</Link>
      </div>
    </section>

    <ConsoleSectionTitle zh="免费原型基石" en="Open archetype foundations" />
    <section className="archetype-foundation-shell">
      <div className="archetype-foundation-heading"><div><p className="archetype-kicker">12 OPEN KNOWLEDGE NODES</p><h2><Bi zh="先读懂原型会观察什么" en="Understand what an archetype actually observes" /></h2></div><p><Bi zh="以下十二条来自生命原型正式知识结构，是所有人可阅读的观察基石，不是你的个性化结果，也不显示虚构分数。" en="These twelve nodes come from the formal Life Archetype knowledge structure. They are open foundations, not your personal result, and contain no invented scores." /></p></div>
      <div className="archetype-foundation-grid">{FOUNDATIONS.map(([zh, en, bodyZh, bodyEn], index) => <article key={en}><span>{String(index + 1).padStart(2, "0")}</span><h3><Bi zh={zh} en={en} /></h3><small>{en}</small><p><Bi zh={bodyZh} en={bodyEn} /></p></article>)}</div>
    </section>

</ArchetypeWorkspace>
  </FieldConsole><Footer /></>;
}
