export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateHealth from "@/components/gates/GateHealth";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "心的重置 · 修炼技术 | 灵犀 · Heart Reset | Lingxi", description: "心的重置：把心带回温暖、清洁、聚合一致的自然状态，重新成为你与更高智能之间的门户。The Heart Reset practice." };

export default async function HeartResetPage() {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, "heart-reset");

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40">
            <GateHealth className="h-[420px] w-[420px]" />
          </div>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="修炼技术" en="Practice" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="心的重置" en="Heart Reset" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="回到心的中央，让那环抱着心的空间重新活跃起来。这是一段把温暖唤回、把清洁性的能量重新点亮的练习。心为门户，万法唯心。" en="Return to the center of the heart and let the space around it come alive again. This is a practice for calling warmth back and re-lighting cleansing energy. The heart is the gateway; all ways are of the heart." />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为何重置" en="Why reset" /></h2>
              <p className="mt-6">
                <Bi zh="在与日常世界的反复互动中，人很容易滑入非聚合一致、无节律、纠结难分的状态。心的重置，是把心带回它的自然状态——温暖、清洁、聚合一致，让它重新成为你与更高智能之间的门户。" en="Through repeated interaction with the everyday world, it is easy to slip into a state that is incoherent, arrhythmic, and tangled. The Heart Reset brings the heart back to its natural state — warm, clean, and coherent — so it can once again be the gateway between you and higher intelligence." />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="心的重置" productNameEn="Heart Reset">
              <div className="mb-12">
                <PracticeChart src="/images/practice/heart-reset-chart.jpg" alt="心的重置 · 完整练习图（六步流程：闭眼—活跃心的空间—温暖绿光—上升入头—睁眼以心观看—世界反映慈悲）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="闭眼 · 回到呼吸" en="Close your eyes · return to the breath" /></h3>
                  <p className="mt-3">
                    <Bi zh="闭上眼睛，把注意力集中到呼吸上。不必刻意，只是温柔地觉察气息的进与出，让自己慢慢沉静下来。" en="Close your eyes and bring attention to the breath. No forcing — simply notice, gently, the breath coming in and going out, and let yourself grow still." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="唤醒心的空间" en="Awaken the heart\u0027s space" /></h3>
                  <p className="mt-3">
                    <Bi zh="吸气时，想象那个环抱着心的空间正在变得活跃。你可能会在这个区域感到一阵温暖。若被如此引领，可以把手轻轻放在心上。" en="As you inhale, imagine the space embracing the heart coming alive. You may feel a warmth in this area. If you feel led to, rest a hand gently on your heart." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="温暖 · 清洁的能量" en="Warmth · cleansing energy" /></h3>
                  <p className="mt-3">
                    <Bi zh="无论你被如何引领，都把这温暖感觉成一种具有清洁性的能量。如果可以，保持住这种感觉，哪怕只有片刻。" en="However you feel led, sense this warmth as a cleansing energy. If you can, hold this feeling — even for just a moment." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="生机的绿光" en="Vivid green light" /></h3>
                  <p className="mt-3">
                    <Bi zh="如果你能做到，给这种温暖赋予一种生机勃勃的绿色——你在深深的原始森林中看到的那种绿。让这绿色的、有生命力的光，充满整个心的空间。" en="If you can, give this warmth a vivid, living green — the green you see deep in an old-growth forest. Let this green, life-filled light fill the entire space of the heart." />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi zh="不必追求强度，只需真实。每天几分钟，让心重新回到温暖与清洁的状态。重置的不是某个外在结果，而是你与心之间的连接。" en="Do not chase intensity — only authenticity. A few minutes a day, let the heart return to a warm and clean state. What is reset is not some outer result, but the connection between you and your heart." />
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
