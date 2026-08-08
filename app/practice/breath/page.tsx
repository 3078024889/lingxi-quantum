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

export const metadata = {
  title: "量子息法 | 灵犀 · Quantum Breath Method | Lingxi",
  description:
    "量子息法：意识本源整合进程中的核心练习。五秒节律呼吸、标准五步法与完整练习路径图。The Quantum Breath Method — the core practice within the primordial-consciousness integration process.",
};

// ────────────────────────────────────────────────────────────────
// v300：标准五步法全文按小仙女给的新版法典重写。
// 同时删除了「简明四步法（呼吸计数版）」与「附加建议」两节——
// 新版法典里这两节不再存在，留着会与正文的五秒节律相互矛盾
// （旧的四步法写的是「从1数到3、最大数到6」，跟五秒节律对不上，
// 用户照着练会练成两套东西）。
// ────────────────────────────────────────────────────────────────
const standardSteps = [
  {
    step: "第一步", stepEn: "Step 1",
    title: "宣示目的", titleEn: "Declare Your Intention",
    body: "开始之前，首先明确你的意识方向。\n\n当一个人进行量子息法时，通常存在两种服务方向：一种，是为了更广泛的人类整体；另一种，是为了某个具体生命关系，例如自己、家人、朋友，或某个需要理解、宽恕与慈悲的对象。\n\n无论目的是什么，都请在第一口气息之前，将它清晰地放入意识之中。这一刻，就是整个练习的初始点。",
    bodyEn: "Before you begin, clarify the direction of your awareness.\n\nWhen a person practises the Quantum Breath Method, there are generally two directions of service: one is for humanity as a whole; the other is for a particular living relationship — yourself, family, friends, or someone toward whom understanding, forgiveness or compassion is needed.\n\nWhatever the purpose, place it clearly into awareness before the first breath is drawn. That moment is the starting point of the entire practice.",
  },
  {
    step: "第二步", stepEn: "Step 2",
    title: "呼吸基准", titleEn: "The Baseline Breath",
    body: "量子息法中的完整呼吸，由四个阶段组成：\n\n吸气（鼻） → 停留 → 呼气（嘴） → 静置\n\n每一个阶段保持五秒节律。\n吸气与停留，对应：「我是」\n呼气与静置，对应：「我们是」\n\n在确立自己的目的之后，进入基础呼吸。此阶段不进行视觉创造，不追随思想，不制造情绪体验。只是让呼吸稳定，让注意力回归身体，让意识完全进入当下。",
    bodyEn: "A complete breath in the Quantum Breath Method consists of four phases:\n\nInhale (nose) → Pause → Exhale (mouth) → Stillness\n\nEach phase holds a five-second rhythm.\nInhale and pause correspond to: \"I AM\"\nExhale and stillness correspond to: \"WE ARE\"\n\nOnce your purpose is established, enter the baseline breath. In this phase there is no visual creation, no following of thought, no manufacturing of emotional experience. Simply let the breath steady, let attention return to the body, and let awareness enter the present completely.",
  },
  {
    step: "第三步", stepEn: "Step 3",
    title: "概念性专注", titleEn: "Conceptual Focus",
    body: "当呼吸节律建立后，进入概念性专注。\n\n吸气阶段：觉察一条垂直意识轴。它由地球核心升起，穿越身体中心，经由松果腺，向无限延展。吸气，是这条轴线向上的展开。\n\n停留阶段：觉察「我是」。这一意识状态，与垂直轴逐渐融合。\n\n呼气阶段：觉察一条水平意识轴。它由心脏区域展开，经过双臂，向外延伸，并环绕地球。\n\n静置阶段：觉察「我们是」。这一意识状态，与水平连接场融合。\n\n关键：这不是要求创造高清视觉影像。不需要追求颜色、形态或复杂细节。这是一种概念性的专注。你不需要评价自己做得是否完美，你只是将意识温柔地指向这些抽象结构。「我是」与「我们是」的概念，本身就是整合过程。",
    bodyEn: "Once the rhythm of the breath is established, enter conceptual focus.\n\nOn the inhale: become aware of a vertical axis of consciousness. It rises from the core of the earth, passes through the centre of the body and the pineal gland, and extends toward infinity. The inhale is the upward unfolding of this axis.\n\nOn the pause: become aware of \"I AM\". This state of consciousness gradually merges with the vertical axis.\n\nOn the exhale: become aware of a horizontal axis of consciousness. It opens from the heart region, passes through both arms, extends outward, and encircles the earth.\n\nOn the stillness: become aware of \"WE ARE\". This state of consciousness merges with the horizontal field of connection.\n\nKey point: this does not ask you to create high-definition imagery. No colour, form, or intricate detail is required. This is a conceptual focus. You need not judge whether you are doing it perfectly — you are simply pointing awareness, gently, toward these abstract structures. The concepts of \"I AM\" and \"WE ARE\" are themselves the process of integration.",
  },
  {
    step: "第四步", stepEn: "Step 4",
    title: "心脏美德的身体透镜", titleEn: "The Body Lens of Heart Virtues",
    body: "在呼吸过程中，引入一个或多个心脏美德。例如：宽恕。\n\n吸气时：让这一美德成为环绕身体的透明意识透镜。透过它，看见自己的完整存在。\n\n停留时：允许这一品质稳定存在，并扩展于整个身体空间。\n\n呼气时：释放这一美德。释放方向与你最初宣示的目的相连接。可以给予整体生命，也可以给予自己、家人、人类、动物、植物。\n\n六种心脏美德：赞赏 · 慈悲 · 宽恕 · 谦逊 · 理解 · 勇气\n\n同时，也将这些品质给予自己。自我宽恕。自我慈悲。自我理解。自我赞赏。",
    bodyEn: "During the breath, introduce one or more heart virtues — forgiveness, for example.\n\nOn the inhale: let this virtue become a transparent lens of awareness surrounding the body. Through it, see your whole existence.\n\nOn the pause: allow this quality to rest steadily and expand throughout the space of the body.\n\nOn the exhale: release this virtue. The direction of release connects to the purpose you declared at the beginning. It may be given to life as a whole, or to yourself, family, humanity, animals, plants.\n\nThe six heart virtues: Appreciation · Compassion · Forgiveness · Humility · Understanding · Courage\n\nAnd give these qualities to yourself as well. Self-forgiveness. Self-compassion. Self-understanding. Self-appreciation.",
  },
  {
    step: "第五步", stepEn: "Step 5",
    title: "完成", titleEn: "Completion",
    body: "当你感觉练习自然完成时：\n\n第一：将赞赏与感激送向创造源。它存在于第三步所建立的「无限」概念框架之中。\n\n第二：回收整次练习体验。想象它被压缩成为一颗豌豆大小的光点，或一枚微小石子。\n\n第三：将这一光点放置于松果腺区域。让它被吸收，并向整个存在扩散。\n\n第四：睁开双眼。消解整个练习过程。并宣告：「它完成了。」\n\n第五：离开练习时，不携带预设。不追逐结果。不期待某种体验出现。保持中立。以完整、开放的状态回到现实生活。",
    bodyEn: "When you feel the practice has naturally come to completion:\n\nFirst: send appreciation and gratitude toward the Source of creation. It exists within the conceptual framework of \"infinity\" established in Step Three.\n\nSecond: gather up the whole of this practice. Imagine it compressed into a point of light the size of a pea, or a small pebble.\n\nThird: place this point of light in the region of the pineal gland. Let it be absorbed, and let it diffuse throughout your whole being.\n\nFourth: open your eyes. Dissolve the entire practice. And declare: \"It is finished.\"\n\nFifth: leave the practice carrying no assumptions. Chase no result. Expect no particular experience to appear. Remain neutral. Return to ordinary life whole and open.",
  },
];

// 节律路径的意识坐标——图上标注的锚点，法典里逐条列出的那一组
const AXIS_POINTS = [
  { zh: "无限", en: "Infinity" },
  { zh: "松果腺", en: "Pineal" },
  { zh: "心脏", en: "Heart" },
  { zh: "行星轴", en: "Planetary Axis" },
  { zh: "地心", en: "Earth Core" },
];

export default async function BreathPage() {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, "breath");

  return (
    <>
      <Nav />
      <main className="pt-16">
        {/* ── 开篇 ── */}
        <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20">
            <CosmicField className="h-full w-auto" />
          </div>
          <div className="bg-reading-glass mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="修炼技术 · 单次激活 · 永久有效" en="Practice · one activation · yours forever" />
            </p>
            <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
              <Bi zh="量子息法" en="The Quantum Breath Method" />
            </h1>
            <div className="mx-auto mt-8 max-w-2xl space-y-6 text-base leading-9 text-bone-dim">
              <p>
                <Bi
                  zh="量子息法，是意识本源整合进程中的核心练习工具。"
                  en="The Quantum Breath Method is the core practice within the process of integrating primordial consciousness."
                />
              </p>
              <p>
                <Bi
                  zh="呼吸，是生命与意识之间最自然的连接。从生命开始，到生命旅程的每一个阶段，呼吸始终伴随着你的存在。它无需寻找，无需携带，每个人都拥有这一内在门户。"
                  en="Breath is the most natural connection between life and consciousness. From the beginning of life through every stage of the journey, breath accompanies your existence. It need not be sought or carried — everyone already holds this inner gateway."
                />
              </p>
              <p>
                <Bi
                  zh="正是呼吸，将意识锚定于当下，使生命重新回到自身存在的中心。"
                  en="It is breath that anchors consciousness in the present, returning life to the centre of its own being."
                />
              </p>
            </div>
          </div>
        </section>

        {/* ── 呼吸与本源意识 ── */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="bg-reading-glass mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
            <h2 className="font-display text-3xl font-light text-bone">
              <Bi zh="呼吸与本源意识" en="Breath and primordial consciousness" />
            </h2>
            <div className="mt-10 space-y-8 text-base leading-9 text-bone-dim">
              <p>
                <Bi
                  zh="每个人都拥有一个天然存在的支持系统——呼吸。呼吸连接生命最初的节律，也连接意识更深层的存在状态。它是一条回归路径，使意识从外部经验回到内在源点。无论处于何种环境、何种时间与空间，人类都可以通过呼吸重新接触这一基础状态。"
                  en="Everyone possesses a support system that is naturally present: the breath. It connects to the earliest rhythm of life, and to the deeper states of consciousness as well. It is a path of return, bringing awareness from outer experience back to the inner source. In any environment, in any time and space, a human being can touch this foundational state again through breath."
                />
              </p>
              <p>
                <Bi
                  zh="呼吸，是连接物质体验与更广阔意识领域的一道门户。"
                  en="Breath is a gateway connecting material experience with the wider fields of consciousness."
                />
              </p>
              <p>
                <Bi
                  zh="量子息法不同于日常由自主神经系统维持的自然呼吸。它是一种具有明确意识方向与节律结构的呼吸方式。"
                  en="The Quantum Breath Method differs from the everyday breathing maintained by the autonomic nervous system. It is a way of breathing with a clear direction of awareness and a defined rhythmic structure."
                />
              </p>
              <p>
                <Bi
                  zh="量子息法的目的，不是离开身体，不是追求特殊体验，也不是创造某种被定义为积极或美好的感受。它不是为了让心智制造影像，也不是为了寻找另一个世界。"
                  en="Its purpose is not to leave the body, not to pursue extraordinary experience, and not to produce any feeling defined as positive or beautiful. It is not for the mind to manufacture imagery, nor for finding another world."
                />
              </p>
              <p>
                <Bi
                  zh="量子息法是一种意识锻炼。它的方向，是揭示意识本源中的整合状态。如果练习过程中出现任何与你最初宣示目的无关的感知、想法或体验，只需温柔觉察，并坚定地将注意力带回呼吸与当下。"
                  en="The Quantum Breath Method is a training of consciousness. Its direction is to reveal the integrated state within primordial awareness. Should any perception, thought or experience arise that is unrelated to the purpose you declared, simply notice it gently, and firmly bring attention back to the breath and to the present."
                />
              </p>
              <p>
                <Bi
                  zh="量子息法不同于传统冥想。它不依赖固定姿势。可以在清晨醒来后练习，也可以在入睡前进行。可以躺着，可以坐着，也可以站立。不存在唯一正确的身体形式。"
                  en="The Quantum Breath Method differs from traditional meditation. It does not depend on a fixed posture. It may be practised on waking in the morning, or before sleep. Lying down, seated, or standing. There is no single correct form for the body."
                />
              </p>
              <p className="font-display text-lg leading-9 text-lattice">
                <Bi
                  zh="量子息法不是为了进入某种状态，而是帮助意识重新认识自身存在。"
                  en="The Quantum Breath Method is not for entering a state — it helps consciousness recognise its own existence again."
                />
              </p>
            </div>
          </div>
        </section>

        {unlocked ? (
          <>
            {/* ── 节律路径 · 完整练习图 ── */}
            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-reading-glass mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone">
                  <Bi zh="节律路径 · 完整练习图" en="Rhythm path · the complete practice chart" />
                </h2>
                <div className="mt-6 space-y-4 text-base leading-9 text-bone-dim">
                  <p>
                    <Bi
                      zh="这是一张完整的量子息法练习路径图，包含节律路径、五步流程与四段呼吸结构。"
                      en="This is the complete practice chart for the Quantum Breath Method — the rhythm path, the five-step flow, and the four-phase breath structure."
                    />
                  </p>
                  <p className="text-sm text-bone-soft">
                    <Bi
                      zh="建议保存至手机，在练习过程中随时查看。手机端长按保存，电脑端右键保存。"
                      en="Save it to your phone and refer to it while practising. Press and hold on mobile, or right-click on desktop, to save."
                    />
                  </p>
                </div>

                <div className="mt-10">
                  <PracticeChart
                    src="/images/practice/quantum-breath-chart.png"
                    alt="量子息法 · 完整练习图（吸气接引—呼气绽放—载波调频—节律合一，含标准五步法与五秒节律呼吸结构）"
                  />
                </div>
                <p className="mt-5 text-center font-display text-sm tracking-widest2 text-lattice/85">
                  <Bi
                    zh="吸气接引 · 呼气绽放 · 载波调频 · 节律合一"
                    en="Drawing in · Blossoming out · Tuning the carrier · Rhythm made one"
                  />
                </p>

                {/* ── 意识轴线坐标 ── */}
                <div className="mt-16">
                  <h3 className="text-center font-display text-lg font-light text-bone">
                    <Bi zh="节律路径示意" en="The rhythm path" />
                  </h3>
                  <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-2">
                    {AXIS_POINTS.map((p) => (
                      <span key={p.en} className="text-xs tracking-widest2 text-bone-soft">
                        <Bi zh={`${p.zh} · ${p.en}`} en={p.en} />
                      </span>
                    ))}
                  </div>
                  <div className="mx-auto mt-4 flex max-w-md justify-center gap-6">
                    <span className="font-display text-xs tracking-widest2 text-[#7CE0D3]">
                      <Bi zh="我是 · I AM" en="I AM" />
                    </span>
                    <span className="font-display text-xs tracking-widest2 text-[#B9A6D6]">
                      <Bi zh="我们是 · WE ARE" en="WE ARE" />
                    </span>
                  </div>
                  <figure className="mt-8">
                    <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-void">
                      <BreathDiagram className="w-full" />
                    </div>
                    <figcaption className="mt-4 space-y-2 text-center text-sm leading-7 text-bone-soft">
                      <span className="block">
                        <Bi
                          zh="吸气时：意识轴线由地球核心升起，穿越身体中心，经由松果腺，向无限延展。"
                          en="On the inhale: the axis of awareness rises from the earth's core, passes through the centre of the body and the pineal gland, and extends toward infinity."
                        />
                      </span>
                      <span className="block">
                        <Bi
                          zh="呼气时：意识轴线由心脏区域向外展开，通过双臂向外扩散，形成与地球生命的连接。"
                          en="On the exhale: the axis opens outward from the heart region, spreading through both arms, forming a connection with all life on earth."
                        />
                      </span>
                    </figcaption>
                  </figure>
                </div>

                {/* ── 五秒呼吸节律 ── */}
                <div className="mt-16">
                  <h3 className="text-center font-display text-lg font-light text-bone">
                    <Bi zh="五秒呼吸节律" en="The five-second breath rhythm" />
                  </h3>
                  <figure className="mt-6">
                    <div className="rounded-sm border border-white/10 bg-void p-4">
                      <BreathStructure className="w-full" />
                    </div>
                    <figcaption className="mt-4 text-center text-sm leading-7 text-bone-soft">
                      <Bi
                        zh="完整结构：吸气（鼻，「我是」） → 停留 → 呼气（嘴，「我们是」） → 静置"
                        en="Complete structure: inhale (nose, “I AM”) → pause → exhale (mouth, “WE ARE”) → stillness"
                      />
                    </figcaption>
                  </figure>
                </div>
              </div>
            </section>

            {/* ── 标准五步法 ── */}
            <section className="border-t border-white/5 px-6 py-24">
              <div className="bg-reading-glass mx-auto max-w-3xl rounded-sm px-8 py-10 sm:px-12">
                <h2 className="font-display text-3xl font-light text-bone">
                  <Bi zh="标准五步法" en="The standard five-step method" />
                </h2>
                <div className="mt-12 space-y-14">
                  {standardSteps.map((s) => (
                    <div key={s.step} className="border-l border-lattice/30 pl-6">
                      <p className="font-display text-sm uppercase tracking-widest2 text-amber">
                        <Bi zh={s.step} en={s.stepEn} />
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-bone">
                        <Bi zh={s.title} en={s.titleEn} />
                      </h3>
                      <p className="mt-4 whitespace-pre-line text-base leading-9 text-bone-dim">
                        <Bi zh={s.body} en={s.bodyEn} />
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-14 text-center font-display text-lg tracking-widest2 text-lattice">
                  <Bi zh="量子息法完成。" en="The Quantum Breath Method is complete." />
                </p>
              </div>
            </section>

            {/* ── 交互式呼吸引导 ── */}
            <section className="border-t border-white/5 px-6 py-24">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-10 text-center font-display text-3xl font-light text-bone">
                  <Bi zh="交互式呼吸引导" en="Interactive breath guide" />
                </h2>
                <div className="bg-reading-glass px-6 py-16">
                  <BreathGuide />
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="border-t border-white/5 px-6 py-24">
            <div className="mx-auto max-w-2xl rounded-sm border border-lattice/20 bg-lattice/5 p-10 text-center">
              <p className="font-display text-2xl text-bone">
                <Bi zh="激活「量子息法」以解锁完整练习" en="Activate the Quantum Breath Method to unlock the full practice" />
              </p>
              <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
                <Bi
                  zh="完整的节律路径图、标准五步法、五秒呼吸节律结构与交互式呼吸引导器，属于「量子息法」修炼技术。一次激活，永久有效；或开启「四项合集」，一并拥有全部四项技术。"
                  en="The complete rhythm-path chart, the standard five-step method, the five-second breath structure, and the interactive breath guide belong to the Quantum Breath Method. One activation, yours forever — or open the Four-in-One Set to hold all four practices."
                />
              </p>
              <Link
                href="/membership"
                className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
              >
                {user ? <Bi zh="前往激活" en="Go to activate" /> : <Bi zh="登录并激活" en="Sign in & activate" />}
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
