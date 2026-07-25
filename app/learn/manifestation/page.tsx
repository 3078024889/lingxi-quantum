import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "什么是显化，以及如何真正显化",
  description:
    "显化是指通过调整意识状态与内在频率，让你想要的现实自然对齐并发生。本文用清晰、可落地的方式讲解显化的原理与每日方法。What manifestation really is and how to do it.",
  alternates: { canonical: "/learn/manifestation" },
};

const faq = [
  {
    q: "显化是什么意思？",
    a: "显化是指通过调整你的意识状态、信念与内在频率，让你渴望的现实更容易对齐并发生。它不是凭空许愿，而是先在意识里成为那个版本的自己，使你的行动、选择与机遇自然朝那个方向收敛。",
  },
  {
    q: "显化真的有用吗？",
    a: "显化最可靠的部分，是它改变你的注意力、信念和行为，从而改变你实际做出的选择。把它理解为一种校准内在状态、对齐目标的练习，而非保证特定结果的魔法，才能既有力量又不脱离现实。",
  },
  {
    q: "每天该怎么练习显化？",
    a: "用现在时、肯定句写下你想活成的版本；每天花几分钟进入「已经拥有」的感受；留意并采取那个版本的你会做的微小行动。灵犀场的「显化签到」就是为这套日常设计的。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "什么是显化，以及如何真正显化",
  inLanguage: "zh-CN",
  about: "显化 / Manifestation",
  publisher: { "@type": "Organization", name: "灵犀场 LingxiField" },
};
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ManifestationArticle() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-2xl">
          <div className="bg-reading-glass px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">显化 · Manifestation</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="什么是显化，以及如何真正显化" en="What Manifestation Is, and How to Actually Do It" />
          </h1>

          {/* 定义块（便于被引用） */}
          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone">
              <Bi
                zh="显化，是通过调整你的意识状态、信念与内在频率，让你渴望的现实更容易对齐并发生。它的核心不是向外索求，而是先在意识里成为那个版本的自己——当你的存在状态与目标同频，行动、选择与机遇便自然朝那个方向收敛。"
                en="Manifestation is the practice of shifting your state of consciousness, beliefs, and inner frequency so the reality you long for can align and occur. Its core isn't reaching outward, but becoming that version of yourself in consciousness first — when your state matches your goal, your actions, choices, and opportunities converge toward it."
              />
            </p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="显化的原理" en="How manifestation works" /></h2>
            <p>
              <Bi
                zh="许多人把显化误解为「想要就喊出来」。更准确的理解是：你的现实，很大程度上由你长期持有的信念与注意力塑造。当你反复进入「已经拥有」的状态，你的潜意识会把它当作现状，从而改变你看见的机会、做出的选择，以及你对待自己与世界的方式。"
                en="Many mistake manifestation for shouting wishes. A truer view: your reality is largely shaped by the beliefs and attention you hold over time. When you repeatedly enter the felt state of already having it, your subconscious treats it as the present — which changes the opportunities you notice, the choices you make, and how you treat yourself and the world."
              />
            </p>
            <p>
              <Bi
                zh="这也是为什么「命运由你不由天」并不空泛：你无法控制每一件外在事件，但你能持续校准自己的内在状态，而内在状态正是你与现实之间最稳定的那根线。"
                en="This is why 'you author your own fate' is not empty: you can't control every external event, but you can keep calibrating your inner state — and that state is the most stable line between you and reality."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="每日显化方法（4 步）" en="A daily manifestation method (4 steps)" /></h2>
            <p>
              <Bi
                zh="1) 写下版本：用现在时、肯定句写下你想活成的生活，仿佛它已经属于你。2) 进入状态：闭眼几分钟，去感受身处那个版本时的情绪——平静、丰盛、被支持。3) 采取微行动：今天做一件「那个你」会做的小事。4) 放手对齐：不执着结果，只保持一致性与信任。"
                en="1) Write the version: in present tense, affirm the life you want as if it's already yours. 2) Enter the state: with eyes closed, feel the emotions of being that version — calm, abundant, supported. 3) Take a micro-action: do one small thing that version of you would do today. 4) Release and align: don't grip the outcome; keep coherence and trust."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="常见误区" en="Common pitfalls" /></h2>
            <p>
              <Bi
                zh="把显化当作逃避行动的借口、用力过猛地「监控」结果、或在心里同时持有「我想要」和「我不配」两种信念——都会让对齐变得困难。显化更像园艺：你播种、浇水、保持环境，然后允许它按自己的节奏生长。"
                en="Treating manifestation as an excuse to avoid action, anxiously monitoring outcomes, or holding 'I want it' and 'I'm unworthy' at once — all make alignment hard. Manifestation is more like gardening: you plant, water, tend the conditions, then allow growth at its own pace."
              />
            </p>
          </div>

          {/* FAQ */}
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

          {/* CTA */}
          <div className="mt-14 rounded-sm border border-lattice/20 bg-lattice/5 p-7 text-center">
            <p className="font-display text-xl text-bone"><Bi zh="把显化变成每日练习" en="Make manifestation a daily practice" /></p>
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh="灵犀场的「显化签到」陪你每天进入「已经拥有」的状态，并给你来自场的回响。" en="Lingxi's daily check-in helps you enter the 'already have it' state each day, with a reflection from the field." /></p>
            <Link href="/live-as" className="mt-6 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <Bi zh="进入显化签到" en="Open the check-in" />
            </Link>
          </div>

          <p className="bg-void-deep mt-10 rounded-sm px-6 py-4 text-sm text-bone-dim">
            <Bi zh="延伸：" en="Related: " />
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber"><Bi zh="主权与完整导览" en="Sovereignty & Wholeness" /></Link>
            {" · "}
            <Link href="/learn/dream" className="text-lattice hover:text-amber"><Bi zh="如何解梦" en="How to interpret dreams" /></Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
