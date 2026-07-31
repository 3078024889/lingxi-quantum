import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "如何解梦：读懂潜意识写给你的信",
  description:
    "解梦是把梦中的象征、情绪与情节，翻译成关于你内在状态的洞见。本文给出一套温柔、可落地的解梦方法与常见象征。How to interpret your dreams.",
  alternates: { canonical: "/learn/dream" },
};

const faq = [
  {
    q: "解梦到底是在解什么？",
    a: "解梦不是预测吉凶，而是把梦中的象征、情绪与情节，理解为你潜意识在处理的情感、关系与内在状态。梦像一封来自更深自己的信——重点不是字面情节，而是它唤起的感受与它映照的现实议题。",
  },
  {
    q: "怎样记住并记录梦？",
    a: "醒来先别动、别看手机，让画面停留片刻；然后立刻写下任何碎片：画面、人物、地点、动作，尤其是情绪。不必通顺，关键词即可。坚持记录会显著提升你回忆梦境的能力。",
  },
  {
    q: "梦里的象征有固定含义吗？",
    a: "没有放之四海皆准的字典。同一个象征（如水、坠落、被追）对不同人意味不同。更可靠的方法是问自己：这个画面让我想到什么？它此刻对应我生活中的哪件事或哪种感受？",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "如何解梦：读懂潜意识写给你的信",
  inLanguage: "zh-CN",
  about: "解梦 / Dream interpretation",
  publisher: { "@type": "Organization", name: "灵犀场 LingxiField" },
};
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function DreamArticle() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-2xl">
          <div className="bg-reading-glass px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">解梦 · Dreams</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="如何解梦：读懂潜意识写给你的信" en="How to Interpret Dreams" />
          </h1>

          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone">
              <Bi
                zh="解梦，是把梦中的象征、情绪与情节，翻译成关于你内在状态的洞见。它不是预测吉凶，而是倾听潜意识——梦像一封来自更深自己的信，重点不在字面情节，而在它唤起的感受，以及它正映照你生活中的哪个议题。"
                en="Dream interpretation is translating a dream's symbols, emotions, and events into insight about your inner state. It isn't fortune-telling but listening to the subconscious — a dream is a letter from your deeper self, and what matters is less the literal plot than the feeling it evokes and the life-theme it mirrors."
              />
            </p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="解梦的 4 个步骤" en="A 4-step method" /></h2>
            <p>
              <Bi
                zh="1) 记录：醒来立刻写下画面、人物、地点与情绪，碎片也好。2) 标记情绪：问自己「这个梦让我感觉如何」——情绪往往比情节更接近答案。3) 自由联想：对每个关键象征问「它让我想到什么」，写下第一反应。4) 连回现实：看看这些联想对应你近期生活中的哪件事、哪段关系或哪个决定。"
                en="1) Record: on waking, write down images, people, places, and emotions — fragments are fine. 2) Name the feeling: ask 'how did this dream make me feel' — emotion is often closer to the answer than plot. 3) Free-associate: for each key symbol ask 'what does this remind me of' and note your first response. 4) Link to life: see which recent event, relationship, or decision these associations point to."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="常见象征，怎么读" en="Reading common symbols" /></h2>
            <p>
              <Bi
                zh="水常关联情绪的流动与深度；坠落可能映照失控或放手的需要；被追往往指向你在回避的某件事；房子常代表自我的不同层面。但请记住——这些只是起点，真正的含义来自你自己的联想，而非通用字典。"
                en="Water often relates to the flow and depth of emotion; falling may mirror loss of control or a need to let go; being chased frequently points to something you're avoiding; a house often represents layers of the self. But remember — these are only starting points; the real meaning comes from your own associations, not a universal dictionary."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="把梦带回清醒生活" en="Bringing the dream back" /></h2>
            <p>
              <Bi
                zh="解梦的价值，最终落在一个小小的觉察或行动上：一段需要修复的关系、一个可以放下的执念、一个想要靠近的方向。带着这份觉察过完今天，比记住一百个象征更有意义。"
                en="The value of dream work finally lands in one small awareness or action: a relationship to mend, an attachment to release, a direction to move toward. Living today with that awareness matters more than memorizing a hundred symbols."
              />
            </p>
          </div>

          </div>

          <div className="mt-14">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="常见问题" en="FAQ" /></h2>
            <div className="mt-6 space-y-5">
              {faq.map((f, i) => (
                <div key={i} className="rounded-sm border border-white/10 bg-void-deep p-6">
                  <p className="font-display text-lg text-bone">{f.q}</p>
                  <p className="mt-3 leading-8 text-bone-dim">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-sm border border-lattice/20 bg-lattice/5 p-7 text-center">
            <p className="font-display text-xl text-bone"><Bi zh="让灵犀场陪你解梦" en="Interpret a dream with Lingxi Field" /></p>
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh="写下今晨的梦，发送至场，灵犀场会以象征与心理的视角，温柔地回应你。" en="Write down this morning's dream, send it to the field, and Lingxi Field will respond gently through symbol and psyche." /></p>
            <Link href="/dream" className="mt-6 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <Bi zh="进入梦境解析" en="Open dream interpretation" />
            </Link>
          </div>

          <p className="bg-void-deep mt-10 rounded-sm px-6 py-4 text-sm text-bone-dim">
            <Bi zh="延伸：" en="Related: " />
            <Link href="/learn/manifestation" className="text-lattice hover:text-amber"><Bi zh="什么是显化" en="What manifestation is" /></Link>
            {" · "}
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber"><Bi zh="主权与完整导览" en="Sovereignty & Wholeness" /></Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
