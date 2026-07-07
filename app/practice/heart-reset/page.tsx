export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateHealth from "@/components/gates/GateHealth";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "归零心诀 · 修炼技术 | 灵犀 · Heart Reset | Lingxi", description: "归零心诀：把心带回温暖、清晰、有序的自然状态，一套定期清空情绪淤积的呼吸练习。The Heart Reset practice." };

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
            <Bi zh="归零心诀" en="Heart Reset" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="回到心的中央，让胸口这片区域重新活跃起来。这是一段把温暖唤回、把积压情绪清空的练习。心是情绪的处理中枢，也需要定期归零。" en="Return to the center of the chest, and let this region come alive again. This is a practice for calling warmth back and clearing accumulated emotional weight. The heart is an emotional processing center, and it too needs periodic resetting." />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为何要归零" en="Why reset at all" /></h2>
              <p className="mt-6">
                <Bi zh="心脏本身的节律，会随情绪剧烈起伏——积压的愤怒或委屈，会让这份节律变得散乱、失序，而散乱的节律，又会不断把杂乱的信号，回传给大脑，让人越想越乱。归零心诀，就是把心带回它本来的样子：温暖、清晰、有序，重新成为一处，能让人看清自己的地方。" en="The heart's own rhythm shifts dramatically with emotion — accumulated anger or grievance leaves that rhythm erratic and disordered, and that disorder feeds a stream of scrambled signals back to the brain, spiraling thought further into confusion. The Heart Reset brings the heart back to its natural state — warm, clear, and orderly — so it can again be a place where a person sees themself clearly." />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="归零心诀" productNameEn="Heart Reset">
              <div className="mb-12">
                <PracticeChart src="/images/practice/heart-reset-chart.jpg" alt="归零心诀 · 完整练习图（闭眼—感受胸口—唤起温暖—让念头浮现—睁眼带着这份平静看世界）" />
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
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="感受胸口这片区域" en="Notice the chest" /></h3>
                  <p className="mt-3">
                    <Bi zh="吸气时，把注意力带到胸口正中央，感受这片区域正在变得活跃。你可能会感到一阵暖意。若想这么做，可以把手轻轻放在胸口上。" en="As you inhale, bring attention to the center of the chest, and notice this area coming alive. You may feel a warmth here. If it helps, rest a hand gently on your chest." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="唤起一份具体的暖意" en="Summon a specific warmth" /></h3>
                  <p className="mt-3">
                    <Bi zh="想一个让你由衷感到温暖的画面——也许是某次被认真对待的时刻，也许是某个让你安心的人。让这份真实的感受，在胸口停留，哪怕只有片刻。重点不在画面多精细，而在感受是否真实。" en="Recall a moment that genuinely warms you — perhaps a time you felt truly cared for, perhaps someone whose presence puts you at ease. Let that real feeling rest in the chest, even for just a moment. What matters is not how vivid the image is, but whether the feeling itself is genuine." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="让念头安静地浮现" en="Let thought surface quietly" /></h3>
                  <p className="mt-3">
                    <Bi zh="保持这份暖意的同时，留意有没有什么念头或情绪，跟着浮现出来。不需要推开它们，也不必深究，只是看着它们，像看云一样，来了，也会走。" en="While holding this warmth, notice whether any thought or feeling rises alongside it. There's no need to push it away or dig into it — simply watch it, the way you'd watch clouds: it arrives, and it passes." />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi zh="不必追求强度，只需真实。每天几分钟，让心重新回到温暖、清晰的状态。归零清空的不是某个外在结果，而是你与自己情绪之间，那份卡住的关系。" en="Do not chase intensity — only authenticity. A few minutes a day, let the heart return to a warm, clear state. What gets reset is not some outer result, but the stuck relationship between you and your own emotion." />
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
