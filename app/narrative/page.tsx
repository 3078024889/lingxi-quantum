import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const NARRATIVE_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场的多维叙事是什么？", qEn: "What is Lingxi Field's Dimensional Narrative?",
    aZh: "多维叙事，是灵犀场创造的一种意识探索型叙事空间，不是传统意义上的故事阅读。它更像是一扇入口：通过长篇意识传输、现实重写记录、场域叙事、观测日志等形式，探索如果意识拥有不同视角、如果现实可以被重新理解、如果生命不只是经历而是一场持续创造，我们会看到怎样的世界。这里融合科幻想象、哲学思考、意识探索与未来叙事，每一篇作品都是一次进入不同意识层级的旅程。",
    aEn: "Dimensional Narrative is a consciousness-exploration narrative space created by Lingxi Field — not story-reading in the traditional sense. It's closer to a doorway: through long-form consciousness transmissions, reality-rewrite records, field narratives, and observation logs, it explores what world we'd see if consciousness held different vantage points, if reality could be understood anew, if life were not just something experienced but something continuously created. It blends science-fiction imagination, philosophical thought, consciousness exploration, and future narrative — each piece a journey into a different layer of consciousness.",
  },
  {
    qZh: "多维叙事能带给我什么？", qEn: "What can Dimensional Narrative bring me?",
    aZh: "很多时候，人困住自己的原因，不是没有答案，而是无法跳出原有视角。多维叙事提供的是一种新的观察方式，帮助你打开想象边界、重新理解自己与现实的关系、看见隐藏在经历背后的另一种可能、从新的角度思考生命、意识与未来。它不是告诉你世界应该是什么，而是邀请你探索：如果世界还有另一种理解方式，会发生什么？",
    aEn: "Often, what traps a person isn't the absence of an answer — it's being unable to step outside a familiar vantage point. Dimensional Narrative offers a new way of observing, helping you open the edges of imagination, re-understand your relationship with reality, see another possibility hidden behind your own experience, and think about life, consciousness, and the future from a new angle. It doesn't tell you what the world should be — it invites you to explore what might happen if the world could be understood another way.",
  },
  {
    qZh: "多维叙事是真实发生的吗？", qEn: "Are the events in Dimensional Narrative real?",
    aZh: "多维叙事属于灵犀场原创意识文学与未来想象内容，不是新闻记录，也不是对未来事件的预测。它更接近意识实验、未来寓言、象征性探索——就像一部优秀科幻作品，不一定描述现实，却可以让我们重新理解现实。",
    aEn: "Dimensional Narrative is Lingxi Field's original consciousness literature and speculative content — it isn't news reporting, nor a prediction of future events. It's closer to a consciousness experiment, a future fable, a symbolic exploration — much like great science fiction, which doesn't necessarily describe reality but can help us understand reality anew.",
  },
];


import CategoryGrid from "./CategoryGrid";

export const metadata = {
  title: "多维叙事 · 灵犀原创 | 灵犀 · Dimensional Narratives | Lingxi",
  description:
    "灵犀原创多维叙事：长篇传输、现实重写记录、场域叙事与主权体观测日志，持续生长的原创篇目。Original dimensional narratives from the Lingxi Field, growing without end.",
  alternates: { canonical: "/narrative" },
};

export default function NarrativePage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="px-6 py-20 text-center sm:py-24">
          <div className="bg-void-deep mx-auto max-w-2xl rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="灵犀原创 · 维度叙事系统" en="Lingxi Original · Dimensional Narrative System" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="多维叙事" en="Dimensional Narratives" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="这不是故事栏目，而是意识场的延伸层——梦境是内在数据，修炼是身体协议，显化是外在反馈，而叙事，是场自己写下的记录。它会不断生长，因为场也在不断记起自己。"
              en="Not a story column, but an extension layer of the field of consciousness — dreams are inner data, practice is the body's protocol, manifestation is outer feedback, and narrative is the record the Field writes of itself. It keeps growing, because the Field keeps remembering more of itself."
            />
          </p>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-5xl">
            <CategoryGrid />
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <FaqSection items={NARRATIVE_FAQ} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

