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

export const metadata = { title: "量子息法 | 灵犀 · Quantum Breath Method | Lingxi", description: "量子息法：一套四步均分的呼吸节律，配合五步引导，把散乱的注意力，重新带回当下。The Quantum Breath Method — a paced breathing practice." };

const steps = [
  { step: "第一步", stepEn: "Step 1", title: "设定意图", titleEn: "Set an intention", body: "在第一次吸气之前，先在心里说清楚：这次练习是为了自己，还是为了某个需要多一份理解的人或事。这个意图不必复杂，它只是给接下来的呼吸，定一个方向。", bodyEn: "Before the first breath, name it clearly in your mind: is this practice for yourself, or for someone or something that could use a little more understanding? The intention need not be elaborate — it simply gives the breath that follows a direction." },
  { step: "第二步", stepEn: "Step 2", title: "基准节律（2–4 组）", titleEn: "Baseline rhythm (2–4 rounds)", body: "定好意图后，先做 2–4 组不带任何画面或情绪的纯粹呼吸：吸气（鼻）→ 停顿 → 呼气（嘴）→ 停顿，四段时长尽量均等。这一步只是为了让身体先安静下来，把注意力，收回到此刻。", bodyEn: "With the intention set, take 2–4 rounds of plain breathing, with no imagery or emotion attached: inhale (nose) → pause → exhale (mouth) → pause, each part as equal in length as you can manage. This step alone settles the body and draws attention back into the present." },
  { step: "第三步", stepEn: "Step 3", title: "吸气 · 一条上扬的线", titleEn: "Inhale · a rising thread", body: "基准稳定后，开始加入一点想象：吸气时，感觉有一条线从脚底缓缓上扬，穿过身体，一路延伸向头顶之上，仿佛在把你，往高处轻轻托起。到吸气后的停顿，就让这份上扬的感觉，安静地停留一瞬。", bodyEn: "Once the baseline feels steady, add a touch of imagery: as you inhale, sense a thread rising slowly from the soles of your feet, moving up through the body and out beyond the crown of the head, as if gently lifting you higher. At the pause after the inhale, let that rising sensation simply rest a moment." },
  { step: "第四步", stepEn: "Step 4", title: "呼气 · 向外的圈", titleEn: "Exhale · an outward ring", body: "呼气时，想象从胸口向外，缓缓展开一圈柔和的光，越过双肩，越过房间，向外铺展开去。到呼气后的停顿，让这圈向外铺展的光，安静地停留一瞬——它把你此刻的状态，轻轻分享给了周围的世界。", bodyEn: "As you exhale, imagine a soft ring of light unfurling outward from the chest, past the shoulders, past the room, spreading further out. At the pause after the exhale, let that outward ring rest a moment — quietly sharing this moment's state with the world around you." },
  { step: "第五步", stepEn: "Step 5", title: "静置 · 巩固期", titleEn: "Settle · the consolidation period", body: "回到自然呼吸 3–5 分钟，这是巩固期。把注意力，交给任何自己浮现到意识表面的念头或感受，不必追问它们从哪里来。这也是最适合安静地感激些什么、原谅些什么的时刻——包括，对自己。", bodyEn: "Return to natural breathing for 3–5 minutes — this is the consolidation period. Give your attention to whatever thought or feeling surfaces on its own, without chasing where it came from. This is also the best moment to quietly feel gratitude for something, or forgive something — including yourself." },
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
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="量子息法" en="The Quantum Breath Method" /></h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim"><Bi zh="量子息法是回到当下最简单也最可靠的工具。呼吸从你出生的第一刻起就没有停过，也是少数几件，意志能够直接接管的身体活动之一。它不需要任何器材，随时可以开始。" en="The Quantum Breath Method is the simplest, most reliable tool for returning to the present. Breath has never once stopped since your first moment of life, and it is one of the few bodily rhythms your will can directly reach into. It needs no equipment, and can begin anytime." /></p>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸，是一道随身的门" en="The breath is a door you always carry" /></h2>
            <div className="mt-10 space-y-8 text-base leading-9 text-bone-dim">
              <p><Bi zh="每个人都拥有同一套支持系统：呼吸。它从不需要被学习，只需要被留意。当注意力被拉得四分五裂时，回到一次完整的呼吸，往往是最快能把人带回此刻的办法。" en="Everyone carries the same support system: breath. It never needs to be learned, only noticed. When attention is pulled in a dozen directions, returning to one complete breath is often the fastest way back to the present." /></p>
              <p><Bi zh={<>但这并非自主神经主导的日常呼吸，而是一种刻意放慢、四段均分的呼吸模式——<span className="text-bone">量子息法</span>。它的作用不是控制身体，而是给纷乱的念头，一个可以落脚的节奏。</>} en={<>But this is not the ordinary breathing run automatically by the nervous system — it is a deliberately slowed, four-part rhythm: the <span className="text-bone">Quantum Breath Method</span>. Its purpose is not to control the body, but to give scattered thought a rhythm to land on.</>} /></p>
              <p><Bi zh="把注意力放在呼吸本身——它的声音、它的质感、它流经身体的方式——你就已经在练习了。这不是某种姿势或仪式，站着、坐着、醒来时、入睡前都可以，没有必须遵守的姿势。" en="Simply placing attention on the breath itself — its sound, its texture, the way it moves through the body — is already the practice. It requires no particular posture or ritual; standing, sitting, waking, or drifting toward sleep all work equally well." /></p>
            </div>
          </div>
        </section>

        {unlocked ? (
          <>
            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="节律路径 · 完整练习图" en="Rhythm path · complete practice chart" /></h2>
                <p className="mt-4 text-base leading-9 text-bone-dim"><Bi zh="这是一张完整的量子息法练习挂图，包含节律路径、五步流程与四段呼吸结构。建议保存到手机，随时对照练习。" en="This is a complete Quantum Breath Method practice chart — the rhythm path, the five-step flow, and the four-part breath structure. Save it to your phone and refer to it anytime you practice." /></p>
                <div className="mt-10">
                  <PracticeChart src="/images/practice/quantum-pause-chart.jpg" alt="量子息法 · 完整练习图（吸气上扬—呼气展开—巩固静置）" />
                </div>
                <figure className="mt-16">
                  <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-void"><BreathDiagram className="w-full" /></div>
                  <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">节律路径示意：吸气时一条线从脚底缓缓上扬；呼气时一圈光从胸口向外展开。</figcaption>
                </figure>
                <figure className="mt-16">
                  <div className="rounded-sm border border-white/10 bg-void p-4"><BreathStructure className="w-full" /></div>
                  <figcaption className="mt-3 text-center text-sm text-bone-dim/70">结构框架：吸气（上扬）→ 停顿 → 呼气（展开）→ 停顿</figcaption>
                </figure>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="一组呼吸，四段均等" en="One round, four equal parts" /></h2>
                <div className="mt-8 space-y-6 text-base leading-9 text-bone-dim">
                  <p><Bi zh="单看一次呼吸，量子息法把它分成四段均等的部分：吸气（鼻）→ 停顿 → 呼气（嘴）→ 停顿。关键不是时长越长越好，而是四段尽量均等、连贯流畅。以「数 4」为例；若你更习惯「数 3」，把同样的均等原则应用到每一段即可。" en="Looking at a single breath, the method divides it into four equal parts: inhale (nose) → pause → exhale (mouth) → pause. What matters is not that longer is better, but that the four parts stay as even and smooth as possible. Take a count of four as an example; if a count of three suits you better, simply apply the same principle of equal parts." /></p>
                  <p><Bi zh="建议以 3 到 4 组呼吸为一轮，然后回到自然呼吸——这段自然呼吸期就是「巩固期」。一次完整的练习，是若干轮呼吸接一段巩固期，整个过程可以重复几次。" en="Group 3 to 4 rounds of breath together, then return to natural breathing — this stretch of natural breathing is the consolidation period. One complete practice is several rounds followed by one consolidation period, repeated a few times." /></p>
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
                  <p className="mt-4 text-base leading-9 text-bone-dim"><Bi zh="呼吸做得越长不代表效果越好，两者没有关联。如果呼气后的停顿让你感到一丝紧张，就把计数从「数 4」减到「数 3」。练习 2–3 周后，你可以把它浓缩为 30 秒、10 秒乃至 3 秒，在通话、开会、驾车时随时唤起。" en="Longer breaths are not necessarily better breaths — the two are unrelated. If the pause after the exhale brings a flicker of tension, reduce the count from four to three. After 2–3 weeks of practice, you can condense it to 30 seconds, 10 seconds, even 3 seconds, calling it up anytime — on a call, in a meeting, while driving." /></p>
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
              <p className="font-display text-2xl text-bone"><Bi zh="激活「量子息法」以解锁完整练习" en="Activate the Quantum Breath Method to unlock the full practice" /></p>
              <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim"><Bi zh="完整的节律路径图、结构框架、五步引导与交互式呼吸引导器，属于「量子息法」修炼技术。一次激活，永久有效；或开启「四项合集」，一并拥有全部四项技术。" en="The complete rhythm-path chart, structural framework, five-step guide, and interactive breath guide belong to the Quantum Breath Method. One activation, yours forever — or open the Four-in-One Set to hold all four practices." /></p>
              <Link href="/membership" className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">{user ? <Bi zh="前往激活" en="Go to activate" /> : <Bi zh="登录并激活" en="Sign in & activate" />}</Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
