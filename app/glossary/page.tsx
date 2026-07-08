import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";

export const metadata = {
  title: "术语表 · 灵犀核心词汇",
  description:
    "灵犀术语表：场域、共振、临在、校准、相干、忆起、主权、完整等核心概念的清晰定义，是理解显化、解梦与修炼的底层语言。Glossary of Lingxi's core terms.",
  alternates: { canonical: "/glossary" },
};

type Term = { zh: string; en: string; def: string; defEn?: string };

const terms: Term[] = [
  { zh: "场域", en: "The Field", def: "意识与环境之间，持续互相回应的那片背景——它不是固定的容器，而是随你的注意力与状态,不断成形的活动关系。" },
  { zh: "共振", en: "Resonance", def: "两种状态、两个频率之间的相认，不是被制造出来的，是被遇见的。你认出的，往往是自己此刻的频率。" },
  { zh: "临在", en: "Presence", def: "把全部注意力，安放在此刻正在发生的事情上，不急着评判，也不急着离开。" },
  { zh: "校准", en: "Attunement", def: "一次又一次，把偏离的状态，轻轻带回你选定的方向——不是一次性的动作，是持续的、温和的调整。" },
  { zh: "相干", en: "Coherence", def: "念头、感受与行动，朝着同一个方向流动的状态。相干不是强迫一致，是三者不再互相拉扯。" },
  { zh: "忆起", en: "Remembering", def: "认出一件其实早已知道、只是暂时被遮蔽的事，而不是学习一件全新的事。" },
  { zh: "主权", en: "Sovereignty", def: "为自己的情绪、念头与选择，负起第一责任——不是凌驾于他人之上，而是不再把自己的状态，交给外界随意摆布。" },
  { zh: "完整", en: "Wholeness", def: "把平日分散在不同角色、不同情绪里的自己，重新看作同一条线上的点，而不是几个互相矛盾的人格。" },
  { zh: "归零", en: "Reset", def: "把积压、散乱的状态，重新带回一种温暖、清晰、有秩序的基准——不是清空情绪，是让情绪重新变得可以被看清。" },
  { zh: "意识显化", en: "Manifestation", def: "让意图、注意力与实际行动，三者对齐的过程——把心里认定的样子，一点一点活成眼前的现实。" },
  { zh: "灵犀", en: "Lingxi", def: "这个场域的名字，取自「心有灵犀」——不需要言语，就能彼此感应的那种默契。" },
  {
    zh: "六道之门",
    en: "The Six Gates",
    def: "灵犀场域里的六道入口，分别对应生命的六个面向：出身·源、关系·络、金钱·流、健康·息、心灵·忆、命运·锚。每一道门，都是回到对齐与忆起的一条路径，而不是六件互相独立的事。",
    defEn: "The six entrances within the Lingxi field, each corresponding to a facet of life: Origin, Relationship, Wealth, Health, Spirit, and Destiny. Each gate is a path back to alignment and remembering — not six separate matters.",
  },
  {
    zh: "赞赏",
    en: "Appreciation",
    def: "心脏美德之一。在精微层面，赞赏聚焦于一种知觉：第一源头以意识场的方式，包围并统合着我们所有的同伴存在。既然我们是统合的，我们便在更深的层面运作为一种集体意识，共享着一个丰富、有活力、却也神秘而无法被完全确定的共同目的。这样的知觉，会把焦点从个人生命的琐碎细节，迁移到我们身为一个物种的目的视野上。\n\n在更实际的层面，赞赏体现在细小的感激姿态里，支持着关系的缔结与忠诚。而更深层的赞赏，则会给相对表层的表达赋予真诚——因为那份表达，生自灵魂的频率，而非自我（ego）或心智的动机。",
    defEn: "One of the six heart virtues. At the subtle level, appreciation is focused on a particular perception: that the First Source, as a field of consciousness, surrounds and unifies all our fellow beings. Because we are unified, we operate, at a deeper level, as a collective consciousness sharing one common purpose — rich, vital, yet also mysterious and never fully definable. This perception shifts our focus away from the small details of an individual life, toward the larger view of our purpose as a species.\n\nAt the more practical level, appreciation shows up in small gestures of gratitude that sustain the forming and loyalty of relationships. A deeper appreciation lends sincerity to those more surface-level expressions, because they arise from the frequency of the soul rather than from the motives of ego or mind.",
  },
  {
    zh: "慈悲",
    en: "Compassion",
    def: "心脏美德之一。众多导师已将慈悲雄辩地定义为：对他人苦难的深深觉知，结合上想要解除这份苦难的渴望。在新智能正降入地球的背景下，慈悲更是一种积极正向的渴望——渴望协助他人去校准正在显现于三维世界的这股新智能场，也协助他人觉察到：自身校准的渴望与能力，早已被社会适应所扭曲，未必能准确反映他们真正的智能、灵性倾向或目的。\n\n因为体认到，即使只在一世生命里，我们也是彼此命运的一部分，慈悲便自然扩展到我们的同伴存在与行星本身。行星与个人共同起舞于第一源头的扬升之流中，行进在更新与重生的合作进程里。当地球在转化它所累积的稠密时，我们每个人也将被邀请去转化自己的稠密——否则，就会更深地陷入自己的恐惧与情绪动荡里。",
    defEn: "One of the six heart virtues. Many teachers have eloquently defined compassion as a deep awareness of another's suffering combined with the desire to relieve it. Against the backdrop of new intelligence descending onto the earth, compassion also becomes a positively-oriented desire — a desire to help others align with the new intelligence field now emerging into the third-dimensional world, and to help them notice that their own capacity and desire to align have already been distorted by social conditioning, and no longer accurately reflect their true intelligence, spiritual leaning, or purpose.\n\nRecognizing that, even within a single lifetime, we are bound up in one another's destinies, compassion naturally extends outward to our fellow beings and to the planet itself. Planet and person dance together in the ascending stream of the First Source, moving through a shared process of renewal and rebirth. As the earth transforms the density it has accumulated, each of us is likewise invited to transform our own density — or else sink deeper into our own fear and emotional turbulence.",
  },
  {
    zh: "宽恕",
    en: "Forgiveness",
    def: "心脏美德之一。宽恕运作于这样一个前提：我们每个人，都已基于自身生命经历的处境、以及爱之频率浸满人类仪器的程度，尽了自己最大的努力。当一个人的运作出自「心脏美德」及其原生频率的丰富质地时，宽恕便成为一种自然而然的接受状态。\n\n当感知到不公进入我们的体验——不论轻重，也不论我们自认是肇始者还是承受方——我们最初或许会反应以受害者或恼怒的尖锐情绪，但这种情绪混乱能被迅速安顿下来，方式是：用理解与慈悲，去替代受害者或恼怒的感觉。\n\n宽恕，事实上正是理解与慈悲向外的表达。它不携带沉重的二元情绪（比如好与坏），因而不会引发批判的现身。它是一种中立的表达，不带其他的设计或目的，唯一的目的，就是松开你所踩住的「时间的离合器」——那如同能量层面的流沙，将你陷在基于时间的情绪状态里。",
    defEn: "One of the six heart virtues. Forgiveness operates from the premise that each of us has already done our best, given the circumstances of our life experience and the degree to which the frequency of love has saturated our human instrument. When a person operates from the heart virtues and the rich quality of their native frequency, forgiveness becomes a natural state of acceptance.\n\nWhen a sense of injustice enters our experience — however large or small, and regardless of whether we see ourselves as the one who caused it or the one who bore it — our first reaction may be a sharp emotion of victimhood or anger. But this emotional turbulence can be settled quickly, by replacing the feeling of victimhood or anger with understanding and compassion.\n\nForgiveness is, in fact, the outward expression of understanding and compassion. It carries none of the heavy dualistic emotions (such as good and bad), and so it does not summon judgment. It is a neutral expression with no other design or purpose than this: to release the clutch you've been pressing down on time itself — a kind of energetic quicksand that, at the energy level, mires you in a time-bound emotional state.",
  },
  {
    zh: "谦逊",
    en: "Humility",
    def: "心脏美德之一。灵魂对爱的表达，是它化身进入时空世界最重要的目的——它把这精微而壮丽的爱之频率，无条件、无动机地循流给身体和心智。不出意料，它发现心脏，比心智，是更为乐意的合作者。谦逊，就是体认到：心脏、心智、灵魂三者，都互混于更高智能或规划力量的恩典之中；它们的存在性，全都由这份无条件之爱的连接所支持着。\n\n我们这个行星的宗教、心理学与哲学资料，把大量的关注都给了心智——「人如其所思」。在更微观的层面，许多人相信，所想的会引发情感，情感转而制造出振动频率，振动频率则吸引来生命体验。按这个逻辑，将美好事物吸引进生命的方式，就是去正确地想，以免吸引来困难。\n\n然而，谦逊懂得：代表着你——你最完整身份——的那个存在，并非由一连串心智反应所构成。相反，它是化身为人类形态的爱之临在，这份爱表达在心脏的种种美德里、沉思心智的纯净智能中，也表达在心脏、心智、灵魂的共同创造之中。谦逊，就是这种爱之频率的表达，它知晓自己的源头，是早已实存于更高维度的一种事物——在那个维度，爱不是多愁善感、不是情感重负，而是一种解放的力量：在这力量中，万物为一，万物平等，万物神圣，万物不朽。",
    defEn: "One of the six heart virtues. The soul's expression of love is the most important purpose of its incarnation into the world of time and space — it channels this subtle, magnificent frequency of love into body and mind, unconditionally and without motive. Unsurprisingly, it finds the heart a far more willing collaborator than the mind. Humility is the recognition that heart, mind, and soul are all interwoven within the grace of a higher intelligence or governing power; their very existence is sustained by this connection of unconditional love.\n\nOur planet's religious, psychological, and philosophical traditions have given enormous attention to the mind — 'as a man thinketh.' At the more granular level, many believe that what we think gives rise to what we feel, which in turn produces our vibrational frequency, which then attracts our life experience. By this logic, the way to draw good things into our lives is simply to think correctly, so as not to attract evil or difficulty.\n\nHumility, however, understands that the being who represents you — your most complete identity — is not constructed from a chain of mental reactions. Rather, this being is the presence of love incarnate in human form, a love that expresses itself through the virtues of the heart, through the pure intelligence of the contemplative mind, and through the joint creative work of heart, mind, and soul together. Humility is the expression of this frequency of love; it knows its own source to be something that already exists in a higher dimension — one where love is not sentimentality or emotional burden, but a liberating force in which all things are one, all things are equal, all things are sacred, all things are eternal.",
  },
  {
    zh: "理解",
    en: "Understanding",
    def: "心脏美德之一。形式世界与非形式世界一样，都是由较稠密的表面结构之下的能量结构所构成的——复合宇宙里的每一件事物，都是能量，都拥有一段无限长的、以能量为基础的生命期，能够转变、改变或转换成其他的存在状态。人类的能量结构，常被描述为脉轮系统或电磁体，但它远不止这些组件——它是一种光的形态，而光的形态，正是神圣之爱的编织物。\n\n在能量层面，核心结构的「骨架」由爱构成，这份爱之频率是我们不朽意识（灵魂）的主要成分。所有较低的稠密性，都只是这道光的影子，运作在时空之间，为核心的爱之频率覆上一层稠密护套。时空世界改变或稀释了我们对这一核心能量连接的感知——尽管正是它，构成了所有的生命。这不仅减弱了我们与自身神圣性的连接感，也减弱了我们与源头、与全体生命间的连接。\n\n身为人类的悖论在于：我们最内在的结构是神圣之爱，最外层的结构，则只是最内在结构用来体验世界的工具；然而我们逐渐被这层外在载具夹带到了这样的地步——认同载具，胜过认同乘坐者，也就是我们真正的自性。我们所有人，都感觉到了与真正自性的这种分离，以及对物质身体与心智（人类仪器）的过度认同，只是程度不同。\n\n理解这个美德，正是心脏智能的这样一个面向：它体认到，与爱之频率的这种分离，是展开于行星上的更大蓝图里，必须存在的一个设计性组件——并非人类跌落出了恩典之外，而是我们单纯接受了一幅占据优势地位的实相画面，而这份优势并非偶然，是更大设计的一部分。有一句话可以粗略翻译为：「时间的优雅就在于，它解开了那彻底隔离掉爱的空间结构。」这里的「空间结构」，指的正是人类仪器；只有时间，能打破僵化的栅栏与隐匿的包膜——正是这些，阻碍或削弱了爱之频率将它的智慧，施加进个体的行为之中。既然时间是重要的变量，每个人走在各自的体认之路上，也就只是时间早晚的问题——正是时间的差异，将我们暂时分离于彼此。",
    defEn: "One of the six heart virtues. The world of form, like the world of formlessness, is built from energetic structures beneath its denser surface structures — everything in the composite universe is energy, possessing an infinitely long, energy-based lifespan, capable of transforming or converting into other states of being. The human energy structure is often described as a chakra system or an electromagnetic body, but it is far more than these components — it is a form of light, and a form of light is the weaving of divine love.\n\nAt the energy level, the 'skeleton' of the core structure is made of love — this frequency of love is the primary constituent of our immortal consciousness, or soul. All lower densities are merely shadows of this light, operating within time and space, laying a dense sheath over the core frequency of love. The world of time and space alters or dilutes our sense of connection to this core energy structure — even though it is precisely what constitutes all life. This weakens not only our felt connection to our own divinity, but also our connection to the Source and to all life.\n\nThe paradox of being human is this: our innermost structure is divine love, while our outermost structure is merely the vehicle the innermost structure uses to experience the world — and yet we have gradually been so swept up by this outer vehicle that we identify with the vehicle more than with the rider, our true self. All of us feel this separation from our true self, and this over-identification with our physical body and mind (the human instrument) — only in differing degrees.\n\nUnderstanding, as a virtue, is that facet of heart intelligence which recognizes that this separation from the frequency of love is a necessary, designed component of a larger blueprint unfolding across the planet — it is not that humanity has fallen from grace, but that we have simply accepted a prevailing picture of reality, one whose prevalence is no accident but part of a larger design. There is a saying that translates roughly as: 'the grace of time lies in its unraveling of the spatial structure that so thoroughly isolates love.' Here, 'spatial structure' refers to the human instrument; only time can break down the rigid fences and hidden membranes that block or weaken the frequency of love from impressing its wisdom onto individual behavior. Since time is the crucial variable, each person walking their own path of realization is simply a matter of timing — and it is this difference in timing that, for now, keeps us separated from one another.",
  },
  {
    zh: "勇气",
    en: "Courage",
    def: "心脏美德之一。尽管勇气常被用于战争或战场的语境，但作为爱的一个元素，它指的是对控制或强权说出真相的行为，尤其是在不公正发生之时。在当今的社会秩序下，人们惯常对世界的不公正假装不知——一味专注于自我世界，是侵蚀勇气表达的关键威胁，而对后果的担心，则是另一重威胁。\n\n勇气是爱的一个面向：在面对以社会秩序标准而言的不公正时，它会保卫你所爱、所临在的一切。如果你不去保卫自己的各种美德——或者那些弱小得无力保卫自身美德的人们——你就已经远离了美德本身，也已经丧失了成为形式世界共同创造力量的机会。\n\n这并不意味着你必须成为某类社会事务的积极分子或倡导者，它单纯要求你，保护自己、也保护他人远离不公正——孩子尤其需要这种保护。「心脏美德」很少是单独运作的，它们更常以合奏的形式出现，共同编织出适用于特定情境的影响力与效力。",
    defEn: "One of the six heart virtues. Though courage is often invoked in the context of war or battle, as an element of love it refers to the act of speaking truth to control or power, especially when injustice is occurring. Under today's social order, the customary habit is to feign ignorance of the world's injustices — an excessive focus on one's own private world is a key threat eroding the expression of courage, and fear of consequences is another.\n\nCourage is a facet of love: in the face of injustice as measured by the standards of the social order, it defends the presence of what you love. If you fail to defend your own virtues — or defend those too weak to defend their own — you have already drifted away from virtue itself, and have forfeited the chance to become a co-creative force within the world of form.\n\nThis does not necessarily mean becoming an activist or advocate for a category of social causes. It simply asks that you protect yourself, and others, from injustice — children especially need this protection. The heart virtues are rarely applied in isolation; more often they appear as an ensemble, weaving together the influence and effectiveness suited to a given situation.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "灵犀术语表",
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: `${t.zh} / ${t.en}`,
    description: t.def,
  })),
};

export default function GlossaryPage() {
  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-amber/80">术语表 · Glossary</p>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">核心词汇</h1>
          <p className="mt-6 text-lg leading-9 text-bone-dim">
            灵犀场域里反复出现的核心概念。这些词条是理解显化、解梦与修炼的底层语言。
          </p>

          <dl className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {terms.map((t) => (
              <div key={t.en} className="py-6">
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-2xl font-light text-bone">{t.zh}</span>
                  <span className="font-display text-sm uppercase tracking-widest2 text-lattice/70">{t.en}</span>
                </dt>
                <dd className="mt-3 space-y-4 leading-8 text-bone-dim">
                  {t.defEn
                    ? t.def.split("\n\n").map((para, i) => (
                        <p key={i}>
                          <Bi zh={para} en={t.defEn!.split("\n\n")[i] ?? t.defEn!} />
                        </p>
                      ))
                    : <p>{t.def}</p>}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm text-bone-dim/70">
            延伸：
            <Link href="/learn/wingmakers" className="text-lattice hover:text-amber">主权与完整导览</Link>
            {" · "}
            <Link href="/learn" className="text-lattice hover:text-amber">探索中心</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

