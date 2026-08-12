import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "主权与完整：灵犀场修炼体系的思路",
  description:
    "灵犀场的四项修炼技术，围绕两个朴素的概念展开：主权——为自己的状态负责；完整——把碎片化的自我，重新接回同一条线上。An introduction to the thinking behind Lingxi's practices.",
  alternates: { canonical: "/learn/inner-sovereignty" },
};

const faq = [
  {
    q: "「主权」在灵犀场的语境里，具体指什么？",
    a: "主权，指的是你为自己的情绪、念头与选择，负起第一责任——不是谁都得听你的，而是你不再把自己的状态，交给外界随意摆布。这是一种向内的立场，不是向外的支配。",
  },
  {
    q: "「完整」又是什么意思？",
    a: "完整，指的是把平时分散在各个角色、各种情绪里的自己，重新看作同一个人。工作里的你、家里的你、深夜emo的你，其实都是同一条线上的点——修炼练的，就是让这条线，重新被看见。",
  },
  {
    q: "为什么灵犀场反复强调呼吸和心？",
    a: "因为呼吸和心跳，是少数几件从出生起就没停过、又能被意志直接触及的身体活动。它们不是终点，只是最容易上手的两个入口，用来练习「回到此刻」这件事。",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "主权与完整：灵犀场修炼体系的思路",
  inLanguage: "zh-CN",
  about: "Personal sovereignty and wholeness",
  publisher: { "@type": "Organization", name: "灵犀场 LingxiField" },
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
          <div className="bg-reading-glass px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">思路 · The Thinking</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
            <Bi zh="主权与完整：灵犀场修炼体系的思路" en="Sovereignty & Wholeness: The Thinking Behind Lingxi's Practices" />
          </h1>

          <div className="mt-8 rounded-sm border border-lattice/20 bg-lattice/5 p-6">
            <p className="text-lg leading-9 text-bone">
              <Bi
                zh="主权与完整，在灵犀场里不是两个励志口号，是同一件事的两面。主权，说的是你的意识是独一无二的——它有自己的经验轨迹，无法被归类、被复制、被谁替你定义。完整，说的是这个独一无二的你，同时连接着一切；你不是从整体里切出来的碎片，你是整体在这个位置上的一次完整表达。四项修炼技术之所以存在，是因为这件事知道没用，得练。"
                en="Sovereignty and wholeness are not two slogans here; they are two faces of one thing. Sovereignty says your consciousness is singular — it carries its own trajectory of experience, and cannot be categorized, duplicated, or defined for you by anyone. Wholeness says that this singular you is simultaneously connected to everything: you are not a fragment cut out of the whole, you are the whole expressing itself completely at this position. The four practices exist because knowing this changes nothing. It has to be trained."
              />
            </p>
          </div>

          <div className="mt-10 space-y-6 text-lg leading-9 text-bone-dim">
            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="为什么这两个词必须一起出现" en="Why these two words must arrive together" /></h2>
            <p>
              <Bi
                zh="只讲主权，会滑向孤立——「我谁也不需要，我自己就够了」。那不是主权，那是把连接切断之后剩下的硬壳。只讲完整，会滑向消融——「我们都是一体的，个体不重要」。那也不是完整，那是把自己交出去之后剩下的顺从。两个词必须一起出现，因为真正的位置在它们之间：完全是自己，同时完全连着。分离与互联，是所有二元性的根，其余的对立都是从这一对长出来的。"
                en="Sovereignty alone slides toward isolation — I need no one, I am enough by myself. That isn't sovereignty; that is the shell left after connection has been cut. Wholeness alone slides toward dissolution — we are all one, the individual doesn't matter. That isn't wholeness either; that is the compliance left after you've handed yourself away. The two words must arrive together, because the real position is between them: entirely yourself, and entirely connected. Separation and interconnection are the root duality; every other opposition grows out of that pair."
              />
            </p>
            <p>
              <Bi
                zh="这也解释了一件常被误会的事：分离不是错误，是人类的默认镜头。生存本身就要求分离——分清哪里是我、哪里不是我，否则活不下来。所以没有人需要为自己活在分离里感到羞愧。要做的不是消灭分离，是不再只有它一个镜头。四项技术练的正是这件事：让另一个镜头能被调用。"
                en="This also clears up a common misreading: separation is not an error. It is the human default lens. Survival itself demands it — knowing where I end and where I don't, or you don't last long. So no one needs to feel ashamed of living inside separation. The work isn't to abolish it; it's to stop having only one lens available. That is precisely what the four practices train: making the other lens callable."
              />
            </p>

            <h2 className="font-display text-2xl font-light text-bone"><Bi zh="为什么从呼吸和心开始" en="Why start with breath and heart" /></h2>
            <p>
              <Bi
                zh="因为心不只是泵血的肌肉。在这个体系里，能量性的心是物质心脏的源头性模板——物质心脏分送氧气，能量心分送直觉性智能给心智。情感的速度比思想更快，最深远的体验编织在心的结构里，而不是思想的结构里。而呼吸，是唯一一件从出生到最后一刻都没停过、又能被意志直接触及的事——它随身携带，不需要场地、器材或相信任何东西。这就是为什么四项技术全部从这两处入手：一个是最诚实的通道，一个是随时可用的开关。"
                en="Because the heart is not merely a muscle that pumps blood. In this system the energetic heart is the source template of the physical one: the physical heart distributes oxygen, the energetic heart distributes intuitive intelligence to the mind. Emotion moves faster than thought, and the deepest experiences are woven into the structure of the heart rather than the structure of thinking. Breath, meanwhile, is the one thing that has never stopped from birth to the final moment and that your will can reach directly — portable, requiring no place, no equipment, and no belief in anything. That is why all four practices begin at these two points: one is the most honest channel, the other the switch always within reach."
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
            <p className="font-display text-xl text-bone"><Bi zh="开始你的修炼" en="Begin your practice" /></p>
            <p className="mt-3 leading-8 text-bone-dim"><Bi zh="量子息法、归零心诀、直觉丹道、上升心经——从一项练习开始，回到完整的自己。" en="The Quantum Breath Method, Heart Reset, the Intuitive Way, the Ascending Heart Sutra — begin with one practice." /></p>
            <Link href="/practice" className="mt-6 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">
              <Bi zh="进入修炼技术" en="Open the practices" />
            </Link>
          </div>

          <p className="bg-void-deep mt-10 rounded-sm px-6 py-4 text-sm text-bone-dim">
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
