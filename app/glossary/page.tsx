import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "术语表 · 造翼者 / 主权性积分态核心词汇",
  description:
    "灵犀术语表：人类仪器、实存体、主权性积分态、第一源头、整体导航仪、源头智能、主权性积分态网络(SIN)等造翼者(WingMakers)核心概念的清晰定义。Glossary of WingMakers core terms.",
  alternates: { canonical: "/glossary" },
};

const terms: { zh: string; en: string; def: string }[] = [
  { zh: "人类仪器", en: "Human Instrument", def: "由生物性（身体）、情感性、心理性三组部分构成的载具，是个别化的灵交互于物质维度的工具。" },
  { zh: "实存体", en: "Entity", def: "包纳个别化的灵的意识模式，含第一源头的一个片段，是一种精炼纯粹的能量振动；它将自己投入人类等载具以收集体验、演化转变。" },
  { zh: "残余印记", en: "Residual Imprint", def: "主权性积分态指向人类仪器的能量投射，是人类内在的缪斯与灵感形态，唤醒最高贵的直觉与创造冲动。" },
  { zh: "主权性积分态", en: "Sovereign Integral", def: "实存体所有各异的表达与感知被积分整合为一个意识整体、并校准于源头智能的意识状态。" },
  { zh: "第一源头", en: "First Source", def: "初始根本的源头，联合所有事物的包罗性意识；它将自己作为振动频率编码进所有生命，只能经由核心的平等性振动被联系。" },
  { zh: "遗传心智", en: "Genetic Mind", def: "遍在的宇宙性信念系统，聚合一个行星所有人累积的信念；它既是分离体验的启动力，也是理解源头实相的禁止力。" },
  { zh: "整体导航仪", en: "Wholeness Navigator", def: "嵌入每个人之内的核心智慧，牵引人把碎片化存在感知为通往整体与联合的通道；它是实存体意识的心脏。" },
  { zh: "源头智能", en: "Source Intelligence", def: "第一源头投入万物的能量性意识，是第一源头的『眼与耳』，也是加速意识扩张、援助解放的力量。" },
  { zh: "万物所是", en: "All That Is", def: "源头智能之内『万物所是』的综合与精馏——一座无限的知识与体验图书馆，可经调音与创造性意愿接入。" },
  { zh: "主权性", en: "Sovereignty", def: "一种完整且交互连接的状态：你拥有个别化的灵的力量，独自创造自己的现实，也尊重所有生命同等的主权。" },
  { zh: "主权性积分态网络 (SIN)", en: "Sovereign Integral Network", def: "遍存于复合宇宙各维度的亚原子光编码纤维网络，将每个实存体连接上彼此与第一源头；每个实存体都是其上的一个节点。" },
  { zh: "源头实相", en: "Source Reality", def: "第一源头所栖居的意识维度，永远推动着以意识整体为目标的扩张前缘。" },
  { zh: "存在模式", en: "Modes of Being", def: "两种塑造人类天命的模式：依赖外在等级的『进化／拯救』，与主张本自具足、直接对齐源头的『转变／自主』。" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "灵犀术语表 · 造翼者核心词汇",
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: `${t.zh} / ${t.en}`,
    description: t.def,
  })),
};

export default function GlossaryPage() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber/80">术语表 · Glossary</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">核心词汇</h1>
          <p className="mt-6 text-lg leading-9 text-bone-dim">
            造翼者(WingMakers)与主权性积分态体系的关键概念。这些词条按概念关系组织，是理解显化、解梦与修炼的底层语言。
          </p>

          <dl className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {terms.map((t) => (
              <div key={t.en} className="py-6">
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-2xl font-light text-bone">{t.zh}</span>
                  <span className="font-display text-sm uppercase tracking-widest2 text-lattice/70">{t.en}</span>
                </dt>
                <dd className="mt-3 leading-8 text-bone-dim">{t.def}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm text-bone-dim/70">
            延伸：
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber">造翼者体系导览</Link>
            {" · "}
            <Link href="/learn" className="text-lattice hover:text-amber">探索中心</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
