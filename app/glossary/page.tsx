import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "术语表 · 灵犀核心词汇",
  description:
    "灵犀术语表：场域、共振、临在、校准、相干、忆起、主权、完整等核心概念的清晰定义，是理解显化、解梦与修炼的底层语言。Glossary of Lingxi's core terms.",
  alternates: { canonical: "/glossary" },
};

const terms: { zh: string; en: string; def: string }[] = [
  { zh: "场域", en: "The Field", def: "意识与环境之间，持续互相回应的那片背景——它不是固定的容器，而是随你的注意力与状态,不断成形的活动关系。" },
  { zh: "共振", en: "Resonance", def: "两种状态、两个频率之间的相认，不是被制造出来的，是被遇见的。你认出的，往往是自己此刻的频率。" },
  { zh: "临在", en: "Presence", def: "把全部注意力，安放在此刻正在发生的事情上，不急着评判，也不急着离开。" },
  { zh: "校准", en: "Attunement", def: "一次又一次，把偏离的状态，轻轻带回你选定的方向——不是一次性的动作，是持续的、温和的调整。" },
  { zh: "相干", en: "Coherence", def: "念头、感受与行动，朝着同一个方向流动的状态。相干不是强迫一致，是三者不再互相拉扯。" },
  { zh: "忆起", en: "Remembering", def: "认出一件其实早已知道、只是暂时被遮蔽的事，而不是学习一件全新的事。" },
  { zh: "主权", en: "Sovereignty", def: "为自己的情绪、念头与选择，负起第一责任——不是凌驾于他人之上，而是不再把自己的状态，交给外界随意摆布。" },
  { zh: "完整", en: "Wholeness", def: "把平日分散在不同角色、不同情绪里的自己，重新看作同一条线上的点，而不是几个互相矛盾的人格。" },
  { zh: "归零", en: "Reset", def: "把积压、散乱的状态，重新带回一种温暖、清晰、有秩序的基准——不是清空情绪，是让情绪重新变得可以被看清。" },
  { zh: "意识显化", en: "Manifestation", def: "让意图、注意力与实际行动，三者对齐的过程——把心里认定的样子，一点一点活成眼前的现实。" },
  { zh: "灵犀", en: "Lingxi", def: "这个场域的名字，取自「心有灵犀」——不需要言语，就能彼此感应的那种默契。" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "灵犀术语表",
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
            灵犀场域里反复出现的核心概念。这些词条是理解显化、解梦与修炼的底层语言。
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
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber">主权与完整导览</Link>
            {" · "}
            <Link href="/learn" className="text-lattice hover:text-amber">探索中心</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
