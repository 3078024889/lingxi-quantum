import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "造翼者与主权性积分态体系：入门导览",
  description:
    "造翼者(WingMakers)与主权性积分态(Sovereign Integral)是关于个别化意识、整体导航仪、源头智能与主权性的一套体系。本文为初学者梳理核心概念。An intro to WingMakers & the Sovereign Integral.",
  alternates: { canonical: "/learn/wingmakers" },
};

const faq = [
  {
    q: "造翼者(WingMakers)是什么？",
    a: "造翼者是一套讲述个别化意识如何忆起本源、从「社会人」转变为主权性存在的哲学、艺术与音乐体系。据其自述，它源自一个远离地球的中央种族「造翼者」所留存的信息编码，由译者翻译为地球的音乐、绘画与哲学等语言，并非凡人原创。它强调向内的整体性感知，而非向外的等级与拯救。",
  },
  {
    q: "主权性积分态(Sovereign Integral)是什么意思？",
    a: "主权性积分态是一种意识状态：实存体所有各异的表达与感知被积分整合为一个整体，并与源头智能校准。简单说，就是你回到完整、自主、与万物互联的状态。",
  },
  {
    q: "整体导航仪(Wholeness Navigator)是什么？",
    a: "整体导航仪是嵌入每个人之内的核心智慧，牵引你把碎片化的存在感知为通往整体与联合的通道。它是实存体意识的心脏，常被线性时间与分离文化刮离航道——修炼的目的之一就是回到它。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "造翼者与主权性积分态体系：入门导览",
  inLanguage: "zh-CN",
  about: "WingMakers / Sovereign Integral",
  publisher: { "@type": "Organization", name: "灵犀 Lingxi" },
};
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function WingMakersArticle() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-2xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">体系 · The System</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="造翼者与主权性积分态体系：入门导览" en="WingMakers & the Sovereign Integral: A Beginner's Map" />
          </h1>

          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone">
              <Bi
                zh="造翼者(WingMakers)是一套讲述个别化意识如何忆起本源、从「社会人」转变为主权性存在的哲学、艺术与音乐体系。据这一体系自述，它并非凡人原创，而是源自一个远离地球的中央种族「造翼者」所留存的信息编码；将这些编码符号翻译为地球的音乐、绘画与哲学等语言的人，是译者而非作者。它的核心，是把分离、碎片化的自我，重新接回那条与万物互联的整体之线。"
                en="WingMakers is a body of philosophy, art, and music describing how individualized consciousness remembers its source and shifts from the 'social human' into a sovereign being. According to the tradition's own account, it is not a mortal's invention but originates from information-codes left by a distant Central Race known as the WingMakers; the one who rendered these codes into Earth's music, painting, and philosophy is a translator, not their author. Its heart is reconnecting the separated, fragmented self to the line of wholeness that links all things."
              />
            </p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="几个核心概念" en="A few core concepts" /></h2>
            <p>
              <Bi
                zh="主权性(Sovereignty)：你拥有个别化的灵的力量，为自己的物质、情感与心理面向赋予生命，并与所有生命互联——你独自创造自己的现实，也尊重他人同样的主权。主权性积分态(Sovereign Integral)：实存体所有表达被整合为一个意识整体，并校准于源头智能的状态。"
                en="Sovereignty: you hold the power of the individualized soul to animate your physical, emotional, and mental aspects, interconnected with all life — you create your own reality and honor others' equal sovereignty. Sovereign Integral: the state in which all expressions of the entity integrate into one whole, aligned with Source Intelligence."
              />
            </p>
            <p>
              <Bi
                zh="整体导航仪(Wholeness Navigator)：嵌入你之内的核心智慧，牵引你把碎片感知为通往整体的通道。源头智能(Source Intelligence)：第一源头投入万物的能量性意识，是一座可被调音接入的无限知识与体验图书馆。"
                en="Wholeness Navigator: the core wisdom within you that draws fragmentation toward wholeness. Source Intelligence: the energetic consciousness of the First Source poured into all things — an infinite library of knowledge and experience you can tune into."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="两种存在模式" en="Two modes of being" /></h2>
            <p>
              <Bi
                zh="这套体系区分了「进化／拯救」与「转变／自主」两种存在模式。前者依赖外在的等级与拯救者；后者主张实存体本自具足、与源头智能直接对齐，从而自我发光、自我解放。灵犀所做的，正是支持后一种模式的日常练习。"
                en="The system distinguishes two modes: 'evolution/salvation' and 'transformation/mastership.' The first leans on external hierarchy and saviors; the second holds that the entity is already whole, aligning directly with Source Intelligence to become self-illuminating and self-liberating. Lingxi supports the daily practice of the latter."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="如何开始" en="Where to begin" /></h2>
            <p>
              <Bi
                zh="不必一次理解全部。可以从一个简单的练习开始：每天回到呼吸与心，向内觉察，松开一条「我应该是谁」的旧编程。修炼不是修正问题，而是忆起那个本就完整的自己。"
                en="You don't need to grasp it all at once. Begin with one simple practice: each day return to breath and heart, sense inward, and loosen one old program of 'who I should be.' Practice isn't fixing a problem — it's remembering the self that was always whole."
              />
            </p>
          </div>

          <div className="mt-14">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="常见问题" en="FAQ" /></h2>
            <div className="mt-6 space-y-5">
              {faq.map((f, i) => (
                <div key={i} className="rounded-sm border border-white/10 bg-void-deep/40 p-6">
                  <p className="font-display text-lg text-bone">{f.q}</p>
                  <p className="mt-3 leading-8 text-bone-dim">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-sm border border-lattice/20 bg-lattice/5 p-7 text-center">
            <p className="font-display text-xl text-bone"><Bi zh="开始你的修炼" en="Begin your practice" /></p>
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh="量子呼吸、心的重置、上升之心、直觉智能——从一个练习开始，回到本源的自己。" en="Quantum breathing, heart reset, the heart of ascension, intuitive intelligence — begin with one practice." /></p>
            <Link href="/practice" className="mt-6 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <Bi zh="进入修炼技术" en="Open the practices" />
            </Link>
          </div>

          <p className="mt-10 text-sm text-bone-dim/70">
            <Bi zh="延伸：" en="Related: " />
            <Link href="/glossary" className="text-lattice hover:text-amber"><Bi zh="核心术语表" en="Core glossary" /></Link>
            {" · "}
            <Link href="/learn/manifestation" className="text-lattice hover:text-amber"><Bi zh="什么是显化" en="What manifestation is" /></Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
