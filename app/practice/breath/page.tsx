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

export const metadata = { title: "量子息法 | 灵犀 · Quantum Breath Method | Lingxi", description: "量子息法：意识本源整合进程的主要工具，标准五步法与简明四步法，将你带回起源点——纯粹的存在状态。The Quantum Breath Method — the primary tool of the primordial-consciousness integration process." };

const standardSteps = [
  { step: "第一步", stepEn: "Step 1", title: "宣示目的", titleEn: "Declare Your Intention", body: "在开始之前，宣示你的意图。当一个人实施量子息法时，一般存在2种状态：我做这个是为了人类全体；我做这个是为了人类的特定子集（我自己、朋友、家庭）。第一种状态是显而易见的，但第二种则有着相当程度的变化性——举例而言，应用量子息法可能是为了直系亲属或你自身的某个需要宽恕或慈悲的情形。无论目的为何，在吸入第一口气息之前宣示它。这就是后续整个活动的初始点。", bodyEn: "Before you begin, declare your intention. When a person practices the Quantum Breath Method, there are generally two states: I do this for all of humanity; or I do this for a specific subset of humanity (myself, friends, family). The first state is straightforward, but the second carries considerable variation — for instance, the method might be applied for an immediate family member, or for some situation within yourself that needs forgiveness or compassion. Whatever the purpose, declare it before the first breath is drawn. This is the starting point for everything that follows." },
  { step: "第二步", stepEn: "Step 2", title: "呼吸基准（2–4小节）", titleEn: "Baseline Breath (2–4 Cycles)", body: "单看一次呼吸，量子息法将其分为4个均等的部分：吸气（鼻）> 暂停 > 呼气（嘴）> 暂停。这个4部过程称为一个小节。每个小节被分为2个片段：吸气 > 暂停片段 → 这就是「我是」；呼气 > 暂停片段 → 这就是「我们是」。在宣示了自己的目的后，紧接着执行2–4个小节的呼吸，不带有可视化想象、思想或感觉/情感。这一步单纯是为了平复内在状态，集中知觉，将你完全地带入当下。", bodyEn: "Looking at a single breath, the Quantum Breath Method divides it into 4 equal parts: inhale (nose) > pause > exhale (mouth) > pause. This 4-part process is called one cycle. Each cycle is divided into 2 segments: the inhale-and-pause segment — this is \"I Am\"; the exhale-and-pause segment — this is \"We Are.\" After declaring your intention, perform 2–4 cycles of this breath, without any visualization, thought, or feeling/emotion. This step exists solely to settle your inner state, gather perception, and bring you fully into the present." },
  { step: "第三步", stepEn: "Step 3", title: "概念性专注（3–5小节）", titleEn: "Conceptual Focus (3–5 Cycles)", body: "在确立起自己的基准之后，开始想象。吸气片段：一条垂直的竖线或圆柱，延伸出地球的中心，穿过你大脑的松果腺，向上伸向无限。吸气的起点就是地球的核心，在吸入的过程中，这条垂直线延伸穿过你，进入头顶上方的无限。吸气后的暂停：去想象「我是」意识的场正在结合或合并进垂直的圆柱内。呼气片段：一条水平的杠或线，源起于你的心脏区域，穿过你双臂的三角肌向外延伸，去环绕住地球。呼气后的暂停：想象「我们是」的场合并进这个水平的杠内。这根「我们是」的具象的杠就将你连接上了地球的全部人类和生命。关键：并非高分辨率的可视化（如色彩和精细细节）。这是一种概念性专注，完全不要去评判自己的表现，或你能为每个片段灌输多少细节。你是在将注意力引导向高度抽象的概念，这就足够了。「我是」和「我们是」的概念，会支持你去服务于真相/真理。仅仅是概念化专注本身，就足够松开骗局全息图编程的镣铐。", bodyEn: "Once your baseline is established, begin to imagine. Inhale segment: a vertical line or cylinder extends from the center of the earth, passes through the pineal gland of your brain, and reaches upward toward infinity. The starting point of the inhale is the earth's core; as you draw the breath in, this vertical line extends through you into the infinity above your head. Pause after the inhale: imagine the field of \"I Am\" consciousness combining, or merging, into this vertical cylinder. Exhale segment: a horizontal bar or line, originating at your heart region, extends outward through the deltoids of both arms, encircling the earth. Pause after the exhale: imagine the field of \"We Are\" merging into this horizontal bar. This embodied bar of \"We Are\" connects you to all humanity and all life on earth. Key point: this is not high-resolution visualization (with color and fine detail). This is a conceptual focus — do not judge your own performance, or how much detail you're able to infuse into each segment. You are simply directing attention toward a highly abstract concept, and that is enough. The concepts of \"I Am\" and \"We Are\" support you in serving truth. Conceptual focus alone is enough to loosen the shackles of the deception hologram's programming." },
  { step: "第四步", stepEn: "Step 4", title: "心脏美德的身体透镜（3–5小节）", titleEn: "The Body Lens of Heart Virtues (3–5 Cycles)", body: "在每个小节的吸气片段，引入一个或多个心脏美德。吸气时：想象某个美德（如宽恕）作为一个透镜，形成于你整个身体周围。你透过这个包围你的透镜，看穿进你的整个存在性——你被浸透在宽恕里。暂停时：单纯地容许这种宽恕去强化并环绕住你，就像一种透明的能量场。过渡到呼气片段：释放出这个心脏美德。这种释放关联于你所宣示的目的——要么指向整个人类，要么指向某个子集（可以是你、家庭成员、工作同事、朋友、邻居、宠物、动物、植物等）。重要：在这个整合进程中，也将心脏美德引导向你自己。你需要自我宽恕、自我慈悲、自我理解和自我赞赏。有时候，最好的做法是在一天结束时这么做，在日间则聚焦在他人和全人类身上。这是个人化的过程，由你自己决定什么服务于你。", bodyEn: "In the inhale segment of each cycle, introduce one or more heart virtues. On the inhale: imagine a virtue (such as forgiveness) forming as a lens all around your entire body. Through this lens surrounding you, you see straight through your whole existence — you are steeped in forgiveness. On the pause: simply allow this forgiveness to intensify and encircle you, like a transparent field of energy. Transitioning into the exhale: release this heart virtue. This release is tied to the intention you declared — directed either at all of humanity, or at a specific subset (yourself, family members, colleagues, friends, neighbors, pets, animals, plants, and so on). Important: within this integration process, also direct the heart virtue toward yourself. You need self-forgiveness, self-compassion, self-understanding, and self-appreciation. Sometimes the best approach is to do this for yourself at day's end, focusing on others and all of humanity during the day. This is a personal process — you decide what serves you." },
  { step: "第五步", stepEn: "Step 5", title: "完成", titleEn: "Completion", body: "当你感觉到自己完成了时：1. 将赞赏/感激发送给创造者，它就存在于第三步想象的概念框架的「无限」中。2. 拾起这整次活动，想象它被压缩成豌豆或小石子大小。3. 将其慎重地放置进你的松果腺里，去被吸收和传播。4. 通过睁开眼睛，消解掉整次活动，并宣告「它完成了」。5. 不持有任何成见或结果偏好。当走出这次活动时，你是中立的。", bodyEn: "When you feel you have finished: 1. Send appreciation and gratitude to the Creator, present within the “infinity” of the conceptual framework you imagined in Step 3. 2. Gather up this entire activity, and imagine it compressed down to the size of a pea or a small pebble. 3. Deliberately place it into your pineal gland, to be absorbed and disseminated. 4. Dissolve the entire activity by opening your eyes, and declare, \"It is finished.\" 5. Hold no preconceptions or preference for outcome. As you step out of this activity, be neutral." },
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
          <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80"><Bi zh="修炼技术 · 单次激活 · 永久有效" en="Practice · one activation · yours forever" /></p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="量子息法" en="The Quantum Breath Method" /></h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim"><Bi zh="量子息法是意识本源整合进程的主要工具。呼吸的美妙就在于，它始终伴随着你在这个世界的体验，从最初的到最终的。它是便携式的，每个人都拥有它，正是它将你锚定进了当下。" en="The Quantum Breath Method is the primary tool of the primordial-consciousness integration process. The beauty of the breath is that it accompanies your experience in this world from the very first to the very last. It is portable — everyone already has it — and it is what anchors you into the present moment." /></p>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
            <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸与本源意识" en="Breath and primordial consciousness" /></h2>
            <div className="mt-10 space-y-8 text-base leading-9 text-bone-dim">
              <p><Bi zh="有一个为每个人准备的通用支持系统，那就是呼吸。正是呼吸将我们连接到了起源点：意识的本源状态，即纯粹的存在状态。呼吸是一种途径，无论在什么时空，人类仪器都经由它连接回这个起始点。呼吸是门户，连通了物质维度与量子/交互维度诸领域。" en="There is a universal support system prepared for everyone: the breath. It is breath that connects us back to the point of origin — the primordial state of consciousness, the state of pure being. Breath is the pathway through which the human instrument, in any time and space, connects back to this starting point. Breath is the doorway that links the material dimension to the realms of the quantum/interactive dimensions." /></p>
              <p><Bi zh="量子息法不同于自主神经系统主导的常态呼吸，它是一种特定的呼吸模式。" en="The Quantum Breath Method differs from the ordinary breathing governed by the autonomic nervous system — it is a specific breathing pattern." /></p>
              <p><Bi zh="量子息法的目的不是离开身体、拥有「灵性」体验、或变出任何「正面」体验。它不是为了给心智创造出体验，或提供关于另一个世界的视象。量子息法是一种行为锻炼，目的是揭示出意识的本源整合状态。如果你看见、感知、感觉到任何无关乎你宣示目的的事物，都温柔但坚定地移去它。" en="The purpose of the Quantum Breath Method is not to leave the body, to have a “spiritual” experience, or to conjure any “positive” experience. It is not meant to create an experience for the mind, or to offer a vision of another world. The Quantum Breath Method is a behavioral exercise, whose purpose is to reveal the primordial, integrated state of consciousness. If you see, sense, or feel anything unrelated to the intention you declared, gently but firmly set it aside." /></p>
              <p><Bi zh="不同于冥想，量子息法无关于特定的姿势。可以醒来后或入睡前躺着练习，可以站着或坐下。不存在必需的姿势。量子息法不是为人类仪器所准备的冥想。" en="Unlike meditation, the Quantum Breath Method is not tied to any particular posture. It can be practiced lying down upon waking or before sleep, standing, or sitting. There is no required posture. The Quantum Breath Method is not a meditation prepared for the human instrument." /></p>
            </div>
          </div>
        </section>

        {unlocked ? (
          <>
            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="节律路径 · 完整练习图" en="Rhythm path · complete practice chart" /></h2>
                <p className="mt-4 text-base leading-9 text-bone-dim"><Bi zh="这是一张完整的量子息法练习挂图，包含节律路径、五步流程与四段呼吸结构。建议保存到手机，随时对照练习。" en="This is a complete Quantum Breath Method practice chart — the rhythm path, the five-step flow, and the four-part breath structure. Save it to your phone and refer to it anytime you practice." /></p>
                <div className="mt-10">
                  <PracticeChart src="/images/practice/quantum-pause-chart.jpg" alt="量子息法 · 完整练习图（吸气接引—呼气绽出—载波调频—节律合一，含标准五步法与简明四步法）" />
                </div>
                <figure className="mt-16">
                  <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-void"><BreathDiagram className="w-full" /></div>
                  <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">节律路径示意：吸气时垂直轴延伸自地球核心，穿过松果腺，向上伸向无限；呼气时水平轴从心脏区域向外延展，环绕地球。</figcaption>
                </figure>
                <figure className="mt-16">
                  <div className="rounded-sm border border-white/10 bg-void p-4"><BreathStructure className="w-full" /></div>
                  <figcaption className="mt-3 text-center text-sm text-bone-dim/70">结构框架：吸气（鼻，「我是」）→ 暂停 → 呼气（嘴，「我们是」）→ 暂停</figcaption>
                </figure>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="标准五步法" en="The standard five-step method" /></h2>
                <div className="mt-12 space-y-12">
                  {standardSteps.map((s) => (
                    <div key={s.step} className="border-l border-lattice/30 pl-6">
                      <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh={s.step} en={s.stepEn} /></p>
                      <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh={s.title} en={s.titleEn} /></h3>
                      <p className="mt-3 text-base leading-9 text-bone-dim"><Bi zh={s.body} en={s.bodyEn} /></p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="简明四步法（呼吸计数版）" en="The concise four-step method (breath-counting version)" /></h2>
                <div className="mt-8 space-y-6 text-base leading-9 text-bone-dim">
                  <p><Bi zh="这是量子息法的另一种表述方式，以计数法来计时。呼吸模式是一个由4步构成的简单过程：1. 吸气（鼻）：以计数法计时，最短从1数到3，最大数到6（取决于肺活量、姿势、及不受打扰的程度）。2. 暂停（屏息）：保持住气息，以相等的计数时长。3. 呼气（嘴）：将气吐出，依然是同样的计数时长。4. 暂停（屏息）：再次保持停顿，以同样的计数时长。关键：4步过程中各步时长保持均等。完全精确地监测均等性并不必要，重要的是在保持呼吸连贯流畅性的前提下，大致地监测每步的时长。" en="This is an alternate expression of the Quantum Breath Method, timed by counting. The breath pattern is a simple 4-step process: 1. Inhale (nose): timed by count, from as short as 1 to 3, up to as long as 6 (depending on lung capacity, posture, and how undisturbed you are). 2. Pause (hold breath): hold the breath for an equal count. 3. Exhale (mouth): release the breath, again for the same count. 4. Pause (hold breath): hold once more, for the same count. Key point: the duration of each of the 4 steps should stay equal. Perfectly precise monitoring of equality isn't necessary — what matters is roughly tracking each step's duration while keeping the breath coherent and flowing." /></p>
                  <p><Bi zh="建议以3到4个呼吸周期为一组，然后回到常态呼吸。这种「常态」呼吸期被称为巩固期。在量子息法的整个过程中，保持眼睛闭合，后背笔直地坐在舒适的地方，双脚着地。进入巩固期后，将焦点和全部注意力放置于气泡般浮现到意识表面的事物上，明白它们的浮现都有其原因。这正是绝佳的时期，可以将心脏6美德（赞赏、感激、慈悲、宽恕、谦逊、理解）应用于显露出来的任何念头或情绪上。巩固期通常持续约3到5分钟，但未规定时间限制。运用直觉来引导这个时段。" en="It is recommended to group 3 to 4 breath cycles together, then return to normal breathing. This period of “normal” breathing is called the consolidation period. Throughout the Quantum Breath Method, keep the eyes closed, sit with the back straight in a comfortable place, feet on the ground. Once in the consolidation period, place your focus and full attention on whatever surfaces to consciousness like bubbles rising, understanding that their surfacing has its reasons. This is precisely the ideal time to apply the six heart virtues — appreciation, gratitude, compassion, forgiveness, humility, understanding — to any thought or emotion that surfaces. The consolidation period typically lasts about 3 to 5 minutes, though no time limit is prescribed. Use intuition to guide this stretch of time." /></p>
                  <p><Bi zh="完整大循环通常包含4到5个巩固期。大体而言，每次循环回巩固期，念头和情绪都会变得更少。当进入最后一次巩固期，你已经清空了自己的念头和情绪，进入到了量子领域。" en="A complete full cycle typically contains 4 to 5 consolidation periods. Broadly speaking, each time you cycle back to a consolidation period, thoughts and emotions grow fewer. By the time you reach the final consolidation period, you will have emptied yourself of thought and emotion, and entered the quantum realm." /></p>
                </div>
              </div>
            </section>

            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone"><Bi zh="附加建议" en="Additional guidance" /></h2>
                <div className="mt-8 space-y-6 text-base leading-9 text-bone-dim">
                  <p><Bi zh="量子息法浓缩版：当练习量子息法持续了2、3周时间后，思考它如何能被浓缩而应用到实时境遇中。将这5步活动改编成30秒活动，进而10秒活动，最终变成3秒活动。理念是将量子息法的体验（而非呼吸面向）浓缩成更短的时间片段，从而能用在实时经历中——打电话、开会、驾车、和他人交谈时唤起这种体验，又无需五步结构所需要的时间。" en="Condensed version: after 2 or 3 weeks of practicing the Quantum Breath Method, consider how it can be condensed and applied to real-time situations. Adapt the 5-step activity into a 30-second activity, then a 10-second activity, and finally a 3-second activity. The idea is to condense the experience of the Quantum Breath Method (not the breathing aspect itself) into shorter segments of time, so it can be summoned in real-time moments — on a call, in a meeting, driving, talking with someone — without needing the time the five-step structure requires." /></p>
                  <p><Bi zh="呼吸掌控：不要判定每个片段的呼吸部分被实施得越长效果就越好——两者没有关联。进入量子息法过程的后几步时，注意力会很少集中于呼吸上。容许它变得自我引导，这样注意力能移向更为想象及感觉导向的状态。" en="Breath control: do not assume that the longer each breath segment is held, the more effective it is — the two are unrelated. In the later steps of the Quantum Breath Method, attention will rest less and less on the breath itself. Allow it to become self-directed, so attention can shift toward a state more oriented toward imagination and feeling." /></p>
                  <p><Bi zh="关于体验：量子息法的练习会带来新的体验和知觉，但请将这些体验留在身后，继续前行。人类热衷于视觉刺激物，热衷于看到更高维度，仿佛眼见就为实。然而，量子时空里的一切都不符合人类心智系统的规则。量子即起源。它超越物理法则，它的存在先于视觉、听觉、感官数据，先于情感和念头。它实存于这些感知性刺激物之先，在某种程度上又确实隐藏在这些背后。" en="On experience: practicing the Quantum Breath Method will bring new experiences and perceptions — but leave these experiences behind, and keep moving forward. Humans are enamored with visual stimuli, enamored with seeing higher dimensions, as though seeing were believing. Yet everything within quantum time-space does not conform to the rules of the human mind system. The quantum is the origin itself. It transcends physical law; its existence precedes sight, sound, and sensory data, precedes emotion and thought. It exists prior to these perceptual stimuli, while, in a certain sense, remaining hidden behind them." /></p>
                  <p><Bi zh="同步：如果练习量子息法，并开始于整点的开端，你的体验将同步于其他人的，并会扩展能量。重点不在于开始于24小时的具体几点，而是如果可能的话，就开始于整点的开端。" en="Synchronicity: if you practice the Quantum Breath Method and begin right at the top of the hour, your experience will synchronize with others', and the energy will expand. What matters is not which specific hour of the 24 you begin at, but rather, if possible, beginning right at the top of whichever hour it is." /></p>
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
              <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim"><Bi zh="完整的节律路径图、标准五步法、简明四步法、附加建议与交互式呼吸引导器，属于「量子息法」修炼技术。一次激活，永久有效；或开启「四项合集」，一并拥有全部四项技术。" en="The complete rhythm-path chart, standard five-step method, concise four-step method, additional guidance, and interactive breath guide belong to the Quantum Breath Method. One activation, yours forever — or open the Four-in-One Set to hold all four practices." /></p>
              <Link href="/membership" className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber">{user ? <Bi zh="前往激活" en="Go to activate" /> : <Bi zh="登录并激活" en="Sign in & activate" />}</Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
