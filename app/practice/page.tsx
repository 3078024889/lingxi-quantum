import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateOrigin from "@/components/gates/GateOrigin";
import Bi from "@/components/Bi";

export const metadata = { title: "修炼技术 | 灵犀 · Practices | Lingxi", description: "四项意识修炼技术：量子呼吸/量子暂停、直觉智能、心的重置、上升之心。一次激活，永久有效。Four consciousness practices — Quantum Breath, Intuitive Intelligence, Heart Reset, Ascending Heart.", alternates: { canonical: "/practice" } };

const practices = [
  { href: "/practice/breath", name: "量子呼吸", nameEn: "Quantum Breath", line: "回到当下，回到主权性积分态的门户。", lineEn: "Return to now — the doorway to the Sovereign Integral." },
  { href: "/practice/intuition", name: "直觉智能", nameEn: "Intuitive Intelligence", line: "区分世界的声音与心之深处的耳语。", lineEn: "Tell the world's noise from the whisper deep in the heart." },
  { href: "/practice/heart-reset", name: "心的重置", nameEn: "Heart Reset", line: "把温暖与清洁的能量唤回心的中央。", lineEn: "Call warm, clean energy back to the center of the heart." },
  { href: "/practice/ascending-heart", name: "上升之心", nameEn: "Ascending Heart", line: "意识的核迁回心脏之冠，对齐两条轴。", lineEn: "Move the core of consciousness to the heart's crown, aligning both axes." },
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
