export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateHealth from "@/components/gates/GateHealth";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "归零心诀 · 修炼技术 | 灵犀 · Heart Reset | Lingxi", description: "归零心诀：一套四步呼吸重置练习，让心从信息超载与能量耗散中清空、回归清明与慈悲。The Heart Reset — a four-step breathing practice that clears the heart back to clarity and compassion." };

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
            <Bi
              zh="一套四步重置练习，把心从信息超载和能量耗散所累积的压力中清空，重新收回它的明晰、聚合与慈悲。"
              en="A four-step reset practice that clears the heart of the pressure built up from information overload and energy depletion — reclaiming its clarity, coherence, and compassion."
            />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为何心需要归零" en="Why the heart needs zeroing" /></h2>
              <p className="mt-6">
                <Bi
                  zh="任何复杂的有机体，甚或机器，都需要休息时间。休息是将系统所累积的压力进行清零重置的方式，这些压力源于不断增殖的信息超载和身体能量的流失或熵减。在整个清醒时间里，心都在通过心智和身体这样的感知镜头累积着这些压力。这些压力将稠密性增加于心的区域，那就如同浓雾，能够模糊掉心的理解性视野，进而遮蔽掉它所有品质中最为珍贵的慈悲性表达。"
                  en="Any complex organism — even a machine — needs time to rest. Rest is how a system clears and resets the pressure it has accumulated, pressure born from the ever-multiplying overload of information and from the body's loss or entropic decay of energy. Throughout waking hours, the heart accumulates this pressure through the lenses of mind and body. This pressure thickens the density around the heart's region, like a fog that can blur its faculty of understanding, veiling the most precious of all its qualities: compassionate expression."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="心是心智-身体的一个处理中心。它吸收着人类情感中的压力因素和稠密性。但是随着时间的推移，它需要重置自己。它需要重新收回它的明晰、聚合和慈悲。心不仅存储和积累着能量，也通过一种不受束于线性时空的电磁场传递着它们。"
                  en="The heart is a processing center of the mind-body. It absorbs the pressure factors and density of human emotion. But over time, it needs to reset itself — to reclaim its clarity, coherence, and compassion. The heart doesn't only store and accumulate energy; it also transmits it through an electromagnetic field unbound by linear time and space."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="重置心的最好技术，就是允许中立性流动于你所临在的一切空间里。"
                  en="The best technique for resetting the heart is to allow neutrality to flow through every space you occupy."
                />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="归零心诀" productNameEn="Heart Reset">
              <div className="mb-12">
                <PracticeChart src="/images/practice/heart-reset-chart.jpg" alt="归零心诀 · 完整练习图（闭眼入静—心区激活—绿色灌注—心观世界，含四步重置法）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="闭眼入静" en="Close Your Eyes and Settle" /></h3>
                  <p className="mt-3">
                    <Bi zh="闭上你的眼睛。将注意力集中于呼吸上。" en="Close your eyes. Bring your attention to your breath." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="心区激活" en="Activate the Heart Space" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="当你吸气时，想象那个环抱着心的空间变得活跃起来。你可能会在这个区域感觉到温暖。你可以将手放在你的心上。无论你是被如何引领的，都去将这温暖感觉成一种具有清洁性的能量。如果可以的话，保持住这种感觉，即使只有片刻。"
                      en="As you inhale, imagine the space embracing your heart coming alive. You may feel warmth in this region. You can place your hand on your heart. However you're guided to feel it, let this warmth register as a cleansing energy. If you can, hold this feeling — even for just a moment."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="绿色灌注" en="Infuse with Green" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="如果你能做到的话，给这种温暖赋予一种生机勃勃的绿色——你在深深的原始森林中看到的那种。当你感觉到这种绿色的、温暖的能量时，允许它向上漂移进你的头部。"
                      en="If you're able, give this warmth a vivid green quality — the kind you'd see deep in a primordial forest. As you feel this warm, green energy, allow it to drift upward into your head."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="心观世界" en="See the World Through the Heart" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="睁开你的眼睛，来通过你的心看这个世界。看着它，就如同你是用你的心在看，而不仅仅只是用你的眼-脑系统。这就是重置。"
                      en="Open your eyes and look at the world through your heart. See it as though you are looking with your heart, not merely through your eye-brain system. This is the reset."
                    />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="验证标志" en="Sign of success" /></p>
                  <p className="mt-4">
                    <Bi
                      zh="你明白自己已经做成功的方式，是因为你看向自己的外部世界时，就如同那是一面反映着慈悲的镜子。"
                      en="You'll know you've succeeded when you look out at the world and it feels like a mirror reflecting compassion back to you."
                    />
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
