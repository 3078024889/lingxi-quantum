import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole, type ConsoleArtwork } from "@/components/FieldConsole";

export const metadata: Metadata = {
  title: "场域精测｜灵犀场 LINGXIFIELD",
  description: "从生命图谱、关系共振、韧性、财富、今日潮汐等九个真实入口进入你的场域档案。",
  alternates: { canonical: "/field-tests" },
};

const PRODUCTS: Array<{ href: string; artwork?: ConsoleArtwork; image?: string; title: string; en: string; description: string; descriptionEn: string; tags: string[]; badge?: string; actionZh: string; actionEn: string }> = [
  { href: "/life-map", artwork: "field-blueprint", title: "生命图谱", en: "Life Blueprint", description: "让多套确定性结构彼此映照，看见长期模式、现实适应与当前状态。", descriptionEn: "Cross-read deterministic structures to see long-term patterns, adaptation and your current state.", tags: ["交叉映照", "当前频率", "阶段主题"], actionZh: "生成我的生命图谱", actionEn: "Generate my Life Blueprint" },
  { href: "/qian", artwork: "field-oracle", title: "生命灵签", en: "Life Oracle", description: "从一个真实议题进入，让象征坐标帮助你看清当下最值得注意的位置。", descriptionEn: "Begin with a real question and use symbolic coordinates to locate what matters now.", tags: ["直觉选择", "星辉指引", "行动入口"], actionZh: "开启我的生命灵签", actionEn: "Open my Life Oracle" },
  { href: "/mirror", artwork: "field-mirror", title: "量子生命镜像", en: "Quantum Life Mirror", description: "从经验、当下与条件路径三个观察面，重新看见正在经历的事情。", descriptionEn: "Revisit one lived situation through experience, present reality and conditional paths.", tags: ["三重镜像", "模式分析", "成长方向"], actionZh: "生成我的三重生命镜像", actionEn: "Generate my three mirrors" },
  { href: "/relationship", artwork: "field-relationship", title: "关系共振", en: "Relationship Resonance", description: "进入后选择亲密关系、商业合伙或其他重要关系，看见真实互动结构。", descriptionEn: "Choose intimate, business or another important relationship to read its lived interaction structure.", tags: ["亲密关系", "商业合伙", "其他关系"], actionZh: "选择关系并生成共振图谱", actionEn: "Choose a relationship" },
  { href: "/wealth", artwork: "field-wealth", title: "财富创造地图", en: "Wealth Creation Map", description: "识别价值从发现、创造到交换与承接的路径，不做财富预测。", descriptionEn: "Map how value moves from discovery and creation into exchange and capacity, without fortune claims.", tags: ["价值来源", "机会识别", "实践路径"], actionZh: "生成我的财富创造地图", actionEn: "Generate my Wealth Map" },
  { href: "/daily", artwork: "field-tide", title: "今日潮汐", en: "Today's Tide", description: "记录今天的能量、情绪负荷、专注空间与连接容量，形成个人节律。", descriptionEn: "Record energy, emotional load, focus and connection capacity to build a personal rhythm.", tags: ["今日状态", "节律回看", "行动提示"], actionZh: "读取我的今日潮汐", actionEn: "Read my Today's Tide" },
  { href: "/resilience", artwork: "field-resilience", title: "生命韧性指数", en: "Life Resilience Index", description: "把恢复、适应、反弹、坚持与稳定分开看，找到真正可用的支撑。", descriptionEn: "Separate recovery, adaptation, rebound, endurance and stability to locate usable support.", tags: ["压力恢复", "变化适应", "长期坚持"], actionZh: "生成我的生命韧性指数", actionEn: "Generate my Resilience Index" },
  { href: "/romance", artwork: "field-romance", title: "桃花磁场指数", en: "Romance Resonance", description: "观察一段连接开始以前，吸引、靠近、回应、筛选与边界如何流动。", descriptionEn: "See how attraction, approach, response, discernment and boundaries move before connection forms.", tags: ["吸引方式", "边界模式", "现实入口"], actionZh: "连接我的桃花磁场", actionEn: "Connect with my Romance Field" },
  { href: "/archetype", image: "/images/lifemap-types/yongliuzhe.jpg", title: "生命原型", en: "Life Archetype", description: "八项同主体场域证据汇流后生成；数据不足时会明确告诉你还缺什么。", descriptionEn: "Generated only after eight same-subject evidence streams converge; missing sources remain explicit.", tags: ["八流汇聚", "跨域证据", "版本更新"], badge: "汇流生成", actionZh: "查看汇流进度", actionEn: "View convergence" },
];

export default function FieldTestsPage() {
  return <><Nav /><FieldConsole eyebrow="场域精测 · FIELD INSIGHTS" eyebrowEn="FIELD INSIGHTS" title="看见此刻的模式，也看见改变的入口" titleEn="See the pattern. Find the next opening." description="九个主入口都从一个真实问题开始。选择此刻最需要被照见的方向，进入专属输入、结果与报告路径。" descriptionEn="Nine main entrances begin with a real question. Choose what needs attention now, then enter its dedicated intake, result and report path." heroArtwork="field-blueprint" features={[{ zh: "九个真实入口", en: "Nine real entrances", glyph: "09" }, { zh: "结构化计算", en: "Structured calculation", glyph: "◇" }, { zh: "免费结果先可读", en: "Readable free result", glyph: "◌" }, { zh: "报告进入档案", en: "Reports enter archive", glyph: "▣" }]} aside={<><ConsoleStatus glyph="◎" title="从问题进入" titleEn="Begin with the question" tone="cyan"><p><Bi zh="如果你想看长期生命结构，从生命图谱进入；如果问题发生在一段关系里，从关系共振进入；如果只想看今天，从今日潮汐进入。" en="Choose Life Blueprint for long-term structure, Relationship Resonance for a relationship question, or Today's Tide for the present day." /></p></ConsoleStatus><ConsoleStatus glyph="▣" title="真实档案边界" titleEn="Real archive boundary"><p><Bi zh="这里只显示产品能力与入口。报告数量、进度、分数和解锁状态都必须来自你的真实账户记录。" en="This page shows capability and entrances only. Counts, progress, scores and access always come from your account records." /></p><Link href="/account" className="mt-5 inline-flex text-base text-lattice"><Bi zh="查看我的场域 →" en="View My Field →" /></Link></ConsoleStatus></>}>
    <ConsolePanel>
      <p className="text-base font-semibold uppercase tracking-[.12em] text-lattice"><Bi zh="选择入口" en="CHOOSE AN ENTRANCE" /></p>
      <h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="不必一次测完，从现在最真实的问题开始" en="You do not need everything at once. Begin with what is real now." /></h2>
      <p className="mt-4 max-w-4xl text-base leading-8 text-bone-dim"><Bi zh="八个基础产品各自生成独立结果；生命原型不是第九份孤立测评，而是在同一主体的八项证据齐备后汇流形成。关系共振内部保留亲密、商业合伙与其他关系三个选项。" en="Eight base products generate independent results. Life Archetype is not another isolated test; it forms after eight same-subject evidence streams converge. Relationship Resonance retains intimate, business and other relationship modes." /></p>
    </ConsolePanel>
    <ConsoleSectionTitle zh="九个场域入口" en="Nine field entrances" actionHref="/account" actionZh="我的场域" actionEn="My Field" />
    <div className="lx-console-card-grid">{PRODUCTS.map((product) => <ConsoleCard key={product.href} {...product} titleEn={product.en} />)}</div>
  </FieldConsole><Footer /></>;
}
