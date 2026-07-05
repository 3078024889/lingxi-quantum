export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Bi from "@/components/Bi";
import Footer from "@/components/Footer";
import Link from "next/link";
import BreathGuide from "./BreathGuide";
import BreathStructure from "@/components/BreathStructure";
import BreathDiagram from "@/components/diagrams/BreathDiagram";
import PracticeChart from "@/components/PracticeChart";
import CosmicField from "@/components/CosmicField";
import { getAccess, hasUnlock } from "@/lib/access";

export const metadata = { title: "量子呼吸 · 量子暂停 | 灵犀 · Quantum Breath · The Quantum Pause | Lingxi", description: "量子呼吸/量子暂停：连通物质与量子维度的门户，五步引导与四步呼吸节律，回到主权性积分态。The Quantum Pause breathing practice." };

const steps = [
  { step: "第一步", stepEn: "Step 1", title: "宣示目的", titleEn: "Declare your intent", body: "在吸入第一口气息之前，先宣示你的意图。它可以指向自己、也可以指向他人某个需要宽恕或慈悲的情形。这个意图，就是后续整个练习的初始点，让整段呼吸有了方向。", bodyEn: "Before the first breath, declare your intent. It may point toward yourself, or toward another situation that asks for forgiveness or compassion. This intent is the starting point of the whole practice, giving the breath a direction." },
  { step: "第二步", stepEn: "Step 2", title: "呼吸基准（2–4 小节）", titleEn: "Baseline breathing (2–4 cycles)", body: "宣示目的后，先执行 2–4 个小节的纯粹呼吸——不带任何想象、念头或情绪。吸气（鼻）> 暂停 > 呼气（嘴）> 暂停，四步均等。吸气与其后的暂停属于「我是」，呼气与其后的暂停属于「我们是」。这一步只是为了平复内在、集中知觉，把你完全带入当下。", bodyEn: "After declaring intent, take 2–4 cycles of pure breathing — with no imagery, thought, or emotion. Inhale (nose) > pause > exhale (mouth) > pause, the four parts equal. The inhale and its pause belong to 'I Am'; the exhale and its pause to 'We Are'. This step simply settles the inner state, gathers awareness, and brings you fully into the present." },
  { step: "第三步", stepEn: "Step 3", title: "垂直之线 · 我是", titleEn: "The vertical line · I Am", body: "确立基准后开始想象：吸气时，一条垂直的竖线（或圆柱）从地球中心升起，穿过你大脑的松果腺，向上伸向无限。吸气的起点是地球核心，气息一路延伸穿过你、进入头顶之上的无限。到吸气后的暂停，想象「我是」的意识场，正合并进这条垂直圆柱之内。", bodyEn: "With the baseline set, begin to imagine: as you inhale, a vertical line (or column) rises from the center of the Earth, passes through the pineal gland in your brain, and reaches upward into the infinite. The inhale begins at the Earth's core and travels through you into the infinite above your head. At the pause after the inhale, imagine the field of 'I Am' merging into this vertical column." },
  { step: "第四步", stepEn: "Step 4", title: "水平之线 · 我们是", titleEn: "The horizontal line · We Are", body: "呼气时，想象一条水平的线从你的心脏区域升起，穿过双臂向外延伸，环绕住整个地球。到呼气后的暂停，想象「我们是」的场，正合并进这条水平之线。这根「我们是」的横杆，把你连接上地球的全部人类与一切生命。", bodyEn: "As you exhale, imagine a horizontal line rising from your heart area, extending out through both arms to encircle the whole Earth. At the pause after the exhale, imagine the field of 'We Are' merging into this horizontal line. This crossbar of 'We Are' connects you to all humanity and all life on Earth." },
  { step: "第五步", stepEn: "Step 5", title: "心脏美德 · 巩固期", titleEn: "Heart virtues · consolidation", body: "回到常态呼吸 3–5 分钟，这就是巩固期。把全部注意力放在像气泡般浮现到意识表面的事物上——它们的浮现都有其原因。这正是绝佳时机，将心脏六美德（赞赏、感激、慈悲、宽恕、谦逊、勇气、理解）应用于任何浮现的念头或情绪。别忘了，也要把这些美德引导向你自己：自我宽恕、自我慈悲、自我理解、自我赞赏。", bodyEn: "Return to normal breathing for 3–5 minutes — this is the consolidation period. Place all your attention on whatever bubbles up to the surface of awareness; it surfaces for a reason. This is the ideal moment to apply the six heart virtues (appreciation, gratitude, compassion, forgiveness, humility, valor, understanding) to any thought or emotion that arises. And remember to turn these virtues toward yourself too: self-forgiveness, self-compassion, self-understanding, self-appreciation." },
];

export default async function BreathPage() {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, "breath");

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20"><CosmicField className="h-full w-auto" /></div>
          <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80"><Bi zh="修炼技术 · 单次激活 · 永久有效" en="Practice · one activation · yours forever" /></p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="量子暂停" en="The Quantum Pause" /></h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim"><Bi zh="量子暂停是回到主权性积分态的主要工具。呼吸始终伴随着你在这个世界的体验，从最初到最终。它是便携式的，每个人都拥有它，正是它将你锚定进了当下。" en="The Quantum Pause is the main tool for returning to the Sovereign Integral. Breath accompanies your experience in this world from first to last. It is portable, everyone has it, and it is what anchors you into the present." /></p>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸，是门户" en="The breath is the gateway" /></h2>
            <div className="mt-10 space-y-8 text-base leading-9 text-bone-dim">
              <p><Bi zh="每个人都拥有一套通用的支持系统，那就是呼吸。正是呼吸，把我们连接回那个起源点——纯粹的存在状态，也就是「主权性积分态」。无论身处何时何地，人都能经由呼吸，连接回这个起始点。" en="Everyone has one universal support system: the breath. It is the breath that connects us back to the point of origin — the pure state of being, the Sovereign Integral. Wherever and whenever we are, we can return to this starting point through the breath." /></p>
              <p><Bi zh={<>但这并非自主神经主导的常态呼吸，而是一种特定的呼吸模式——<span className="text-bone">量子暂停</span>。它是连通物质维度与量子维度的门户。那个无限而永恒的你，正是经由这个门户，持续地显现进物质世界里。</>} en={<>But this is not the ordinary breathing run by the autonomic nervous system; it is a specific pattern — the <span className="text-bone">Quantum Pause</span>. It is the gateway between the material and quantum dimensions. The infinite, eternal you continually manifests into the material world through this gateway.</>} /></p>
              <p><Bi zh="当你把注意力聚焦于气息——它的声音、质感，它在肺里的感觉、流经全身的方式——你就被校准回了起源点。所以，量子暂停不是某种姿势或冥想，它是一种揭示主权性积分态的行为练习。醒来时、入睡前、站着、坐着都可以，没有必需的姿势。" en="When you focus attention on the breath — its sound, its texture, how it feels in the lungs, how it flows through the body — you are recalibrated to the point of origin. So the Quantum Pause is not a posture or a meditation; it is a behavioral practice that reveals the Sovereign Integral. On waking, before sleep, standing or sitting — no particular posture is required." /></p>
            </div>
          </div>
        </section>

        {unlocked ? (
          <>
            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="能量路径 · 完整练习图" en="Energy path · complete practice chart" /></h2>
                <p className="mt-4 text-base leading-9 text-bone-dim"><Bi zh="这是一张完整的量子暂停练习挂图，包含能量路径、五步流程与四步呼吸节律。建议保存到手机，随时对照练习。" en="This is a complete Quantum Pause practice chart — the energy path, the five-step flow, and the four-part breath rhythm. Save it to your phone and refer to it anytime you practice." /></p>
                <div className="mt-10">
                  <PracticeChart src="/images/practice/quantum-pause-chart.jpg" alt="量子暂停 · 完整练习图（中枢太阳轴—松果腺—胸腺—心脏—太阳神经丛—行星轴—地球）" />
                </div>
                <figure className="mt-16">
                  <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-void"><BreathDiagram className="w-full" /></div>
                  <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">能量路径示意：吸气时垂直之线从地心升起穿过松果腺伸向无限（∞）；呼气时水平之线从心脏（双臂展开的高度）向外环绕地球。</figcaption>
                </figure>
                <figure className="mt-16">
                  <div className="rounded-sm border border-white/10 bg-void p-4"><BreathStructure className="w-full" /></div>
                  <figcaption className="mt-3 text-center text-sm text-bone-dim/70">结构框架：吸气「我是」→ 暂停（主权体）→ 呼气「我们是」→ 暂停（积分态）</figcaption>
                </figure>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="一个小节，四个均等的部分" en="One cycle, four equal parts" /></h2>
                <div className="mt-8 space-y-6 text-base leading-9 text-bone-dim">
                  <p><Bi zh="单看一次呼吸，量子暂停把它分成四个均等的部分：吸气（鼻）→ 暂停 → 呼气（嘴）→ 暂停。这个四步过程称为一个「小节」。关键不是时长越长越好，而是四步尽量均等、保持连贯流畅。以「数 4」为例；若你采用「数 3」，把同样的均等原则应用到每一步即可。" en="Looking at a single breath, the Quantum Pause divides it into four equal parts: inhale (nose) → pause → exhale (mouth) → pause. This four-part process is called one cycle. What matters is not that longer is better, but that the four parts stay as equal, coherent, and smooth as possible. Take a count of four as an example; if you use a count of three, simply apply the same equal principle to each part." /></p>
                  <p><Bi zh="建议以 3 到 4 个呼吸周期为一组，然后回到常态呼吸——这段常态呼吸期称为「巩固期」。一次典型的大循环，是若干个呼吸周期紧接一个巩固期，整个过程重复数次。在巩固期里，把心脏六美德应用于浮现的任何念头与情绪。" en="Group 3 to 4 breath cycles together, then return to normal breathing — this normal-breathing stretch is called the consolidation period. A typical grand cycle is several breath cycles followed by one consolidation period, with the whole thing repeated several times. During consolidation, apply the six heart virtues to any thought or emotion that surfaces." /></p>
                </div>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="五步引导" en="The five-step guide" /></h2>
                <div className="mt-12 space-y-12">
                  {steps.map((s) => (
                    <div key={s.step} className="border-l border-lattice/30 pl-6">
                      <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh={s.step} en={s.stepEn} /></p>
                      <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh={s.title} en={s.titleEn} /></h3>
                      <p className="mt-3 text-base leading-9 text-bone-dim"><Bi zh={s.body} en={s.bodyEn} /></p>
                    </div>
                  ))}
                </div>
                <div className="mt-16 rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="温柔的提醒" en="A gentle reminder" /></p>
                  <p className="mt-4 text-base leading-9 text-bone-dim"><Bi zh="别去判定呼吸做得越长越好，两者没有关联。如果呼气后的暂停带来一丝惊慌，就把计数从「数 4」减到「数 3」。练习 2–3 周后，你可以把它浓缩为 30 秒、10 秒乃至 3 秒，在打电话、开会、驾车时随时唤起这种体验。" en="Do not judge that longer breaths are better — the two are unrelated. If the pause after the exhale brings a flicker of panic, reduce the count from four to three. After 2–3 weeks of practice, you can condense it to 30 seconds, 10 seconds, even 3 seconds — calling up the experience anytime, on a phone call, in a meeting, while driving." /></p>
                </div>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-10 text-center font-display text-3xl font-light text-bone"><Bi zh="交互式呼吸引导" en="Interactive breath guide" /></h2>
                <div className="rounded-sm border border-white/10 bg-void-deep px-6 py-16"><BreathGuide /></div>
              </div>
            </section>
          </>
        ) : (
          <section className="border-t border-white/5 px-6 py-24">
            <div className="mx-auto max-w-2xl rounded-sm border border-lattice/20 bg-lattice/5 p-10 text-center">
              <p className="font-display text-2xl text-bone"><Bi zh="激活「量子呼吸」以激活完整练习" en="Activate Quantum Breath to unlock the full practice" /></p>
              <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim"><Bi zh="完整的能量路径图、结构框架、五步引导与交互式呼吸引导器，属于「量子呼吸」修炼技术。一次激活，永久有效；或开启「四项合集」，一并拥有全部四项技术。" en="The complete energy-path chart, the structural framework, the five-step guide, and the interactive breath guide belong to the Quantum Breath practice. One activation, yours forever — or open the Four-in-One Set to hold all four practices." /></p>
              <Link href="/membership" className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">{user ? <Bi zh="前往激活" en="Go to activate" /> : <Bi zh="登录并激活" en="Sign in & activate" />}</Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
