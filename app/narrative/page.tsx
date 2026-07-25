import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const NARRATIVE_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场的多维叙事是什么？", qEn: "What is Lingxi Field's Dimensional Narrative?",
    aZh: "多维叙事是灵犀场原创的创意叙事内容，包含长篇意识传输、现实重写记录、场域叙事、场域观测日志，持续更新，属于虚构创作类内容，用于阅读体验，不是事实陈述或者预言。",
    aEn: "Dimensional Narrative is Lingxi Field's original creative content — long-form consciousness transmissions, reality-rewrite records, field narratives, and field observation logs, updated continuously. It's fictional creative writing meant for the reading experience, not a factual statement or a prediction.",
  },
  {
    qZh: "多维叙事怎么收费？", qEn: "How is Dimensional Narrative priced?",
    aZh: "单篇作品可以单独购买，一次能量交换后终身可读；也可以选择「多维叙事·年度解锁」，一年内解锁全部篇目，包含期间新增的全部内容。",
    aEn: "Individual pieces can be purchased separately — one energy exchange unlocks a piece for life. Alternatively, the yearly Dimensional Narrative unlock gives access to every piece for a year, including everything added during that period.",
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
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
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

