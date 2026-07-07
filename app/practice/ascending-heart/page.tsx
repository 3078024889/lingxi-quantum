export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateDestiny from "@/components/gates/GateDestiny";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "升维心经 · 修炼技术 | 灵犀 · The Ascending Heart Sutra | Lingxi", description: "升维心经：一套没有终点的对齐练习，让心与念头之间的关系，一点一点变得更精细。The Ascending Heart Sutra practice." };

export default async function AscendingHeartPage() {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, "ascending-heart");

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40">
            <GateDestiny className="h-[420px] w-[420px]" />
          </div>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="修炼技术" en="Practice" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="升维心经" en="The Ascending Heart Sutra" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="四项修炼技术里难度最高的一项——它不像其他三项，有明确的「练成」标志，它练的只是让心与念头之间，那份能否始终对齐的关系，持续变得更精细。" en="The most demanding of the four practices — unlike the other three, it has no clear marker of being mastered. It trains only the relationship between heart and thought: whether the alignment holds, and how much more finely it can be tuned." />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为何没有终点" en="Why there is no endpoint" /></h2>
              <p className="mt-6">
                <Bi zh="其他三项修炼练的都是某种具体能力——呼吸的节律、情绪的清空、判断的直觉，这些都有练成的那一刻。升维心经练的，从不是某种能力，而是心与念头之间，能否始终对齐：今天的念头，是否配得上此刻心的清明；此刻的行为，是否对得起刚才那份真实的感受。" en="The other three practices each train a specific capability — breath's rhythm, emotion's clearing, judgment's intuition — each with a moment of being mastered. The Ascending Heart Sutra trains no capability at all. It trains whether heart and thought stay aligned: whether today's thought is worthy of this moment's clarity, whether this moment's action honors the feeling just felt." />
              </p>
              <p className="mt-4">
                <Bi zh="这份关系永远可以更精细一层，因为对齐从不是一次做到就能永久存入的存款，是每一刻都要重新校准的动态平衡。呼吸与想象的配合，是维系这份对齐最直接的工具。" en="That relationship can always be refined one degree further, because alignment was never a deposit banked once and kept forever — it's a dynamic balance recalibrated every moment. The pairing of breath and imagination is the most direct tool for sustaining this alignment." />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="升维心经" productNameEn="The Ascending Heart Sutra">
              <div className="mb-12">
                <PracticeChart src="/images/practice/ascending-heart-chart.jpg" alt="升维心经 · 完整练习图（定位胸口—吸气汇聚—呼气舒展—对齐放大，含五步流程）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="定位 · 胸口与喉咙之间" en="Locate · between chest and throat" /></h3>
                  <p className="mt-3">
                    <Bi zh="把注意力放到胸口与喉咙之间的区域。闭眼，让呼吸自然，感觉这片区域的临在——这里，是心与念头交汇的地方。" en="Bring attention to the region between the chest and the throat. Close your eyes, let the breath be natural, and feel the presence of this region — where heart and thought meet." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="吸气 · 向内汇聚" en="Inhale · gather inward" /></h3>
                  <p className="mt-3">
                    <Bi zh="吸气时，想象四周的清明，缓缓向这片区域汇聚，像溪流汇入一处安静的潭。在这里，它带着你此刻独有的、专属的印记，安静地停留。" en="As you inhale, imagine clarity gathering inward, drawing toward this region, like streams flowing into a quiet pool. Here it settles quietly, carrying the mark unique to you, in this moment." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="呼气 · 向外舒展" en="Exhale · extend outward" /></h3>
                  <p className="mt-3">
                    <Bi zh="呼气时，让这份汇聚起来的清明，向外缓缓舒展——先抵达你此刻的言行，再抵达与你相关的每一个人。" en="As you exhale, let this gathered clarity slowly extend outward — first reaching your own words and actions, then reaching everyone connected to you." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="对齐 · 不用力的校准" en="Align · calibration without force" /></h3>
                  <p className="mt-3">
                    <Bi zh="让念头与感受，尽量流向同一个方向。当两者对齐，这份练习会自然放大——不是靠用力，是靠对齐本身。保持连贯，让清明自己站出来。" en="Let thought and feeling flow, as much as possible, in the same direction. When the two align, the practice amplifies on its own — not through effort, but through alignment itself. Stay coherent, and let clarity step forward by itself." />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi zh="让每一次呼吸都经过这片区域。把吸气—汇聚、呼气—舒展，当作一个连续的循环，与呼吸自然合拍。日久天长，这份对齐会越来越不需要刻意提醒。" en="Let every breath pass through this region. Take inhale-gather and exhale-extend as one continuous cycle, naturally in step with the breath. Over time, this alignment needs less and less deliberate reminding." />
                  </p>
                </div>
              </div>
            </PracticeGate>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
