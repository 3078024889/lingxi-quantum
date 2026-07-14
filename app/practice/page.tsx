import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateOrigin from "@/components/gates/GateOrigin";
import Bi from "@/components/Bi";

export const metadata = { title: "修炼技术 | 灵犀 · Practices | Lingxi", description: "四项意识修炼技术：量子息法、直觉丹道、归零心诀、上升心经。一次激活，永久有效。Four consciousness practices — the Quantum Breath Method, the Intuitive Way, Heart Reset, and the Ascending Heart Sutra.", alternates: { canonical: "/practice" } };

const practices = [
  { href: "/practice/breath", name: "量子息法", nameEn: "Quantum Breath Method", line: "回到当下，一道随身携带的门。", lineEn: "Return to now — a doorway you always carry." },
  { href: "/practice/intuition", name: "直觉丹道", nameEn: "The Intuitive Way", line: "区分世界的声音与心之深处的耳语。", lineEn: "Tell the world's noise from the whisper deep in the heart." },
  { href: "/practice/heart-reset", name: "归零心诀", nameEn: "Heart Reset", line: "把温暖与清晰的能量唤回心的中央。", lineEn: "Call warm, clear energy back to the center of the heart." },
  { href: "/practice/ascending-heart", name: "上升心经", nameEn: "Ascending Heart Sutra", line: "没有终点的对齐练习，一点一点更精细。", lineEn: "An alignment practice with no endpoint, refined one degree at a time." },
];

export default function PracticeIndex() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-35">
            <GateOrigin className="h-[440px] w-[440px]" />
          </div>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="修炼技术" en="Practices" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="心为门户，万法唯心" en="The heart is the gateway; all ways are of the heart" />
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-display text-sm italic text-lattice/85 sm:text-base">
            <Bi
              zh="源自远古遥远星系的智慧传承，以古老又切合当下的声音呈现。"
              en="A wisdom lineage from ancient, distant star systems — voiced anew for the present moment."
            />
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="四项修炼技术，一次激活，永久有效。或开启「四项合集」，一并拥有全部，并免费享有日后新增的练习。"
              en="Four practices — activate once, yours forever. Or open the Four-in-One Set to hold them all, and receive any future practices free."
            />
          </p>
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl leading-9 text-lattice sm:text-2xl">
            <Bi zh="越呼吸越清明，唯有心通道打开，万法皆成。" en="The more you breathe, the clearer you become; only when the heart's channel opens do all ways complete." />
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="解锁的其他早已存在的能力，会随之显现——你只是忆起了自己。" en="Other abilities, already within you, appear in turn — you are only remembering yourself." />
          </p>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {practices.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-sm border border-white/10 bg-void-deep p-8 transition hover:border-lattice/40"
              >
                <h2 className="font-display text-2xl text-bone group-hover:text-lattice">
                  <Bi zh={p.name} en={p.nameEn} />
                </h2>
                <p className="mt-3 text-sm leading-7 text-bone-dim"><Bi zh={p.line} en={p.lineEn} /></p>
                <span className="mt-5 inline-block font-display text-xs uppercase tracking-widest2 text-lattice/70">
                  <Bi zh="进入 →" en="Enter →" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
