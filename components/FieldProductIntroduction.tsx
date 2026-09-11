import Bi from "@/components/Bi";
import { getFieldInsight } from "@/components/FieldInsightsSection";

type Props = {
  href: "/life-map" | "/relationship" | "/resilience" | "/romance" | "/wealth" | "/daily" | "/mirror" | "/qian" | "/archetype";
  compact?: boolean;
  targetId?: string;
};

export default function FieldProductIntroduction({ href, compact = false, targetId = "field-assessment" }: Props) {
  const item = getFieldInsight(href);
  if (!item) return null;

  if (compact) return <section className="lx-glass p-5"><h3 className="font-display text-xl text-lattice"><Bi zh={item.leadZh} en={item.leadEn} /></h3><p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh={item.bodyZh[0]} en={item.bodyEn[0]} /></p><details className="mt-3"><summary className="cursor-pointer text-sm text-lattice"><Bi zh="如何理解这份生命图谱" en="Understanding your Life Blueprint" /></summary>{item.bodyZh.slice(1).map((zh, i) => <p key={i} className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh={zh} en={item.bodyEn[i+1]} /></p>)}{item.closingZh && <p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh={item.closingZh} en={item.closingEn || ""} /></p>}</details><a className="mt-4 inline-block text-sm text-lattice" href={`#${targetId}`}><Bi zh={item.ctaZh} en={item.ctaEn} /> ↓</a></section>;

  return (
    <section className="relative mx-auto mb-10 max-w-4xl overflow-hidden px-5 pt-16 sm:px-6 md:pt-20">
      <div className="lx-glass relative overflow-hidden border border-white/10 p-6 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lattice/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[.34em] text-bone-mute">FIELD {item.no}</p>
          <div className="mt-6 flex items-start gap-4">
            <span className="text-3xl" aria-hidden>{item.glyph}</span>
            <div>
              <h1 className="font-display text-3xl font-light text-bone sm:text-4xl">
                <Bi zh={item.zh} en={item.en} />
              </h1>
              <p className="mt-2 font-display text-base leading-7 text-lattice sm:text-lg">
                <Bi zh={item.leadZh} en={item.leadEn} />
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-[15px] leading-8 text-bone-dim sm:text-[17px] sm:leading-9">
            {item.bodyZh.map((zh, index) => (
              <p key={index}><Bi zh={zh} en={item.bodyEn[index]} /></p>
            ))}
          </div>

          <a
            href="#field-assessment"
            className="mt-8 inline-flex items-center gap-3 border border-lattice/45 bg-lattice/5 px-6 py-3 font-display text-sm tracking-wider text-lattice transition hover:bg-lattice hover:text-void-deep"
          >
            <span aria-hidden>✨</span>
            <Bi zh={item.ctaZh} en={item.ctaEn} />
            <span aria-hidden>↓</span>
          </a>

          {item.closingZh && (
            <p className="mt-7 border-t border-white/10 pt-6 text-sm italic leading-7 text-bone-soft">
              <Bi zh={item.closingZh} en={item.closingEn || ""} />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
