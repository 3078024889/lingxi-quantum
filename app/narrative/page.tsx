import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { NARRATIVES, NARRATIVE_CATS, coverPlaceholder } from "@/lib/narratives";

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
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-5xl space-y-20">
            {NARRATIVE_CATS.map((cat) => {
              const list = NARRATIVES.filter((n) => n.cat === (cat.id as string));
              return (
                <div key={cat.id}>
                  <div className="border-l-2 border-amber/50 pl-5">
                    <h2 className="font-display text-3xl font-light text-bone">
                      <Bi zh={cat.zh} en={cat.en} />
                    </h2>
                    <p className="mt-2 text-sm text-bone-dim">
                      <Bi zh={cat.descZh} en={cat.descEn} />
                    </p>
                  </div>
                  {cat.soon ? (
                    <p className="mt-8 rounded-sm border border-white/10 bg-void-deep p-8 text-center text-sm text-bone-dim/70">
                      <Bi zh="档案整理中 · 即将开放" en="Archive in preparation · opening soon" />
                    </p>
                  ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      {list.map((n) => (
                        <Link
                          key={n.slug}
                          href={`/narrative/${n.slug}`}
                          className="group flex flex-col justify-between overflow-hidden rounded-sm border border-white/10 bg-void-deep/60 transition hover:border-amber/50"
                        >
                          <div
                            className="aspect-[5/3] w-full overflow-hidden bg-void-deep"
                            dangerouslySetInnerHTML={{ __html: n.cover ?? coverPlaceholder(n.cat) }}
                          />
                          <div className="flex flex-1 flex-col justify-between p-6">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-display text-[10px] uppercase tracking-widest2 text-lattice/70">
                                <Bi zh={cat.zh} en={cat.en} />
                              </span>
                              {n.status === "soon" && (
                                <span className="rounded-sm border border-white/15 px-2 py-0.5 font-display text-[10px] uppercase tracking-widest2 text-bone-dim/60">
                                  <Bi zh="创作中" en="Coming" />
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 font-display text-2xl leading-snug text-bone group-hover:text-amber">
                              <Bi zh={n.title} en={n.titleEn} />
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-bone-dim">
                              <Bi zh={n.teaser} en={n.teaserEn} />
                            </p>
                          </div>
                          <p className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 font-display text-xs uppercase tracking-widest2">
                            <span className={n.status === "soon" ? "text-bone-dim/40" : "text-amber"}>
                              {n.status === "soon" ? (
                                <Bi zh="即将开放" en="Opening soon" />
                              ) : (
                                <>
                                  ${n.price} · <Bi zh="终身可看" en="yours for life" />
                                </>
                              )}
                            </span>
                            <span className="text-lattice/70 transition group-hover:translate-x-1">
                              <Bi zh="进入 →" en="Enter →" />
                            </span>
                          </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
