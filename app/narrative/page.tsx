import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
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
        </section>
      </main>
      <Footer />
    </>
  );
}

