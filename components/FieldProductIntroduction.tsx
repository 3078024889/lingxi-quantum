import Bi from "@/components/Bi";
import { getFieldInsight } from "@/components/FieldInsightsSection";

type Props = {
  href: "/life-map" | "/relationship" | "/resilience" | "/romance" | "/wealth" | "/daily" | "/mirror" | "/qian" | "/archetype";
};

export default function FieldProductIntroduction({ href }: Props) {
  const item = getFieldInsight(href);
  if (!item) return null;

  return (
    <section className="relative mx-auto mb-10 max-w-4xl overflow-hidden px-5 sm:px-6">
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

          {item.timeZh && (
            <div className="mt-8 border-l border-lattice/45 bg-lattice/[.035] px-5 py-4 text-sm leading-7 text-bone-soft">
              <p className="font-display text-lattice">
                <Bi zh="出生日期" en="Birth date" />
              </p>
              <p className="mt-1">
                <Bi
                  zh="请选择实际使用的历法：阳历（公历）或农历。两种历法并不相同，通常身份证日期为阳历，知晓是农历的选农历；海外用户一般直接选择阳历。若补充具体出生时刻，图谱可展开更细的时间层次与结构连接。"
                  en="Choose the calendar actually used for this date: Gregorian (solar) or Chinese lunar. They are different calendar systems. Dates on identity documents are usually Gregorian; choose lunar only when you know the recorded date is lunar. Users outside China can generally choose Gregorian. Adding the specific birth time can reveal finer time layers and structural connections."
                />
              </p>
            </div>
          )}

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
