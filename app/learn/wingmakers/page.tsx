import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "主权与完整：灵犀修炼体系的思路",
  description:
    "灵犀的四项修炼技术，围绕两个朴素的概念展开：主权——为自己的状态负责；完整——把碎片化的自我，重新接回同一条线上。An introduction to the thinking behind Lingxi's practices.",
  alternates: { canonical: "/learn/wingmakers" },
};

const faq = [
  {
    q: "「主权」在灵犀的语境里，具体指什么？",
    a: "主权，指的是你为自己的情绪、念头与选择，负起第一责任——不是谁都得听你的，而是你不再把自己的状态，交给外界随意摆布。这是一种向内的立场，不是向外的支配。",
  },
  {
    q: "「完整」又是什么意思？",
    a: "完整，指的是把平时分散在各个角色、各种情绪里的自己，重新看作同一个人。工作里的你、家里的你、深夜emo的你，其实都是同一条线上的点——修炼练的，就是让这条线，重新被看见。",
  },
  {
    q: "为什么灵犀反复强调呼吸和心？",
    a: "因为呼吸和心跳，是少数几件从出生起就没停过、又能被意志直接触及的身体活动。它们不是终点，只是最容易上手的两个入口，用来练习「回到此刻」这件事。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "主权与完整：灵犀修炼体系的思路",
  inLanguage: "zh-CN",
  about: "Personal sovereignty and wholeness",
  publisher: { "@type": "Organization", name: "灵犀 Lingxi" },
};
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function SovereigntyWholenessArticle() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-2xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">思路 · The Thinking</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="主权与完整：灵犀修炼体系的思路" en="Sovereignty & Wholeness: The Thinking Behind Lingxi's Practices" />
          </h1>

          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone">
              <Bi
                zh="灵犀的四项修炼技术，说到底围绕两个朴素的概念展开：主权，是为自己的状态负起第一责任；完整，是把平日里分散在各个角色、各种情绪里的自己，重新接回同一条线上。这两件事说起来简单，做起来却需要练习——这正是四项技术存在的原因。"
                en="Lingxi's four practices ultimately revolve around two plain ideas: sovereignty — taking first responsibility for your own state; and wholeness — reconnecting the self scattered across different roles and emotions back onto one line. Simple to say, but they take practice — which is exactly why these four techniques exist."
              />
            </p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="两个概念，不是两套理论" en="Two ideas, not two theories" /></h2>
            <p>
              <Bi
                zh="主权，不是要凌驾于谁之上，而是不再把自己的情绪和判断，交给外界随意摆布——遇到让你不舒服的事，第一反应不是「都是别人的错」，也不是「都是我不好」，而是先问自己：我现在，能为这件事做点什么。"
                en="Sovereignty isn't about ruling over anyone — it's refusing to hand your emotions and judgment over to whatever the world throws at you. When something bothers you, the first move isn't 'it's all their fault' or 'it's all my fault,' but asking yourself: what can I actually do about this, right now."
              />
            </p>
            <p>
              <Bi
                zh="完整，说的是那种「我在不同场合像不同的人」的疲惫感，其实可以被松开——工作里高效冷静的你、深夜里emo脆弱的你、面对家人耐心又易怒的你，从来都不是几个互相矛盾的角色，只是同一个人，在不同光线下的样子。"
                en="Wholeness speaks to that exhausting sense of being 'a different person in every setting.' It can be loosened — the efficient, composed you at work, the vulnerable you at 2am, the patient-yet-irritable you with family were never contradictory roles. They're the same person, seen under different light."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="为什么从呼吸和心开始" en="Why start with breath and heart" /></h2>
            <p>
              <Bi
                zh="呼吸和心跳，是少数几件从你出生那一刻起就没有停过、又能被意志直接触及的身体活动。练习从这里开始，不是因为它们神秘，而是因为它们随身携带、随时可用——不需要任何特殊场地或器材，这也是为什么灵犀的四项技术，都从呼吸或心的感受入手。"
                en="Breath and heartbeat are among the few bodily rhythms that have never once stopped since your birth, and that your will can still directly reach into. Practice begins here not because they're mysterious, but because they're always with you, always available — no special setting or equipment required. That's why all four of Lingxi's techniques begin with the breath or the felt sense of the heart."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="怎么开始" en="Where to begin" /></h2>
            <p>
              <Bi
                zh="不必一次弄懂全部道理。可以从一个简单的练习开始：每天留出几分钟，回到呼吸与心的感受，向内看看，松开一条「我应该是谁」的旧念头。修炼不是修正一个问题，是重新认回那个，本就完整的自己。"
                en="You don't need to grasp every idea at once. Start with one simple practice: a few minutes each day, returning to breath and the felt sense of the heart, looking inward, loosening one old thought about who you're supposed to be. Practice isn't fixing a problem — it's recognizing again the self that was already whole."
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
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh="量子息法、归零心诀、直觉丹道、上升心经——从一项练习开始，回到完整的自己。" en="The Quantum Breath Method, Heart Reset, the Intuitive Way, the Ascending Heart Sutra — begin with one practice." /></p>
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
