export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateDestiny from "@/components/gates/GateDestiny";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "上升之心 · 修炼技术 | 灵犀 · Ascending Heart | Lingxi", description: "上升之心：把意识的核迁回心脏之冠，对齐行星水平轴与中枢太阳垂直轴的呼吸想象练习。The Ascending Heart practice." };

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
            <Bi zh="上升之心" en="Ascending Heart" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="意识的核正在迁移——从被卷入僵化的心智，迁回胸腺、迁回那被称为「心脏之冠」的上升之心。它同时坐落于两条轴：行星的水平轴，与中枢太阳的垂直轴。" en="The core of consciousness is migrating — out of entanglement with the rigid mind, back to the thymus, to the Ascending Heart known as the 'crown of the heart.' It sits on two axes at once: the planet's horizontal axis and the Central Sun's vertical axis." />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="光体与两条轴" en="The light body and the two axes" /></h2>
              <p className="mt-6">
                <Bi zh="光体是意识的核，生来灿烂、纯粹、智能。它栖息于心脏，最终上移至胸腺——上升之心。垂直轴把你连接回源头（中枢太阳的下降与上升之流），水平轴把你的光体锚定进地球与其上的物质存在。两轴的交汇点，正是个体的活化点。" en="The light body is the core of consciousness — born radiant, pure, intelligent. It dwells in the heart and finally rises to the thymus — the Ascending Heart. The vertical axis connects you back to Source (the descending and ascending streams of the Central Sun); the horizontal axis anchors your light body into the Earth and material existence upon it. Where the two axes meet is the individual's point of activation." />
              </p>
              <p className="mt-4">
                <Bi zh="呼吸与想象的积分整合，是活化并长久维系上升之心的最有效工具。内在的聚合一致越高，光体在形式世界里绽放的光就越亮。" en="The integral union of breath and imagination is the most effective tool for activating and sustaining the Ascending Heart. The greater the inner coherence, the brighter the light body shines in the world of form." />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="上升之心" productNameEn="Ascending Heart">
              <div className="mb-12">
                <PracticeChart src="/images/practice/ascending-heart-chart.jpg" alt="上升之心的呼吸 · 完整练习图（中枢太阳—松果腺—胸腺/上升之心—心脏—太阳神经丛—行星轴，含五步流程）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="定位上升之心" en="Locate the Ascending Heart" /></h3>
                  <p className="mt-3">
                    <Bi zh="把注意力放到心脏与喉咙之间的胸腺区域——这就是上升之心，心脏之冠。闭眼，让呼吸自然，感觉这个区域的临在。" en="Bring attention to the thymus area between the heart and the throat — this is the Ascending Heart, the crown of the heart. Close your eyes, let the breath be natural, and feel the presence of this region." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="吸气 · 金色降入" en="Inhale · golden descent" /></h3>
                  <p className="mt-3">
                    <Bi zh="吸气时，想象能量从上方（中枢太阳）降入，穿流过头顶，停驻进心脏正下方的太阳神经丛。在那里，它闪耀着带有你个人标识基调的金色光芒。" en="As you inhale, imagine energy descending from above (the Central Sun), flowing through the crown of the head and settling into the solar plexus just below the heart. There it shines with a golden light carrying your own signature tone." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="呼气 · 向外绽放" en="Exhale · bloom outward" /></h3>
                  <p className="mt-3">
                    <Bi zh="呼气时，让这金色能量从太阳神经丛向上释放，抵达胸腺、抵达上升之心的高度，然后以至高的影响力，向外绽放到水平轴所在的层面——整个行星。" en="As you exhale, let this golden energy release upward from the solar plexus to the thymus, to the height of the Ascending Heart, then bloom outward with the highest influence to the level of the horizontal axis — the whole planet." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="聚合一致的放大" en="Coherent amplification" /></h3>
                  <p className="mt-3">
                    <Bi zh="让你的思想触角与情感触角，校准并流动于神圣意志之河。当内在聚合一致，上升之心便成为放大器，把光体的光芒绽放到行星层面。这不是用力，而是对齐——保持连贯，让光自然站出来。" en="Let the antennae of your thought and the antennae of your feeling attune and flow in the river of divine will. When the inner state is coherent, the Ascending Heart becomes an amplifier, blooming the light body's radiance to the planetary level. This is not effort but alignment — stay coherent, and let the light step forward on its own." />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi zh="每一次呼吸都冲刷过上升之心。把吸气—降入、呼气—绽放，作为一个连续的循环，与呼吸自然合拍。日久天长，意识的核会稳稳安住于上升之心这条新轴。" en="Let every breath wash through the Ascending Heart. Take inhale-descent and exhale-bloom as one continuous cycle, naturally in step with the breath. Over time, the core of consciousness settles firmly onto this new axis, the Ascending Heart." />
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
