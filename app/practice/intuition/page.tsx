export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateMind from "@/components/gates/GateMind";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import IntuitionDiagram from "@/components/diagrams/IntuitionDiagram";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "直觉智能 · 修炼技术 | 灵犀 · Intuitive Intelligence | Lingxi", description: "直觉智能：区分世界的声音与心之深处的耳语，把情感历史重铸进慈悲频率的一套意识技术。Intuitive Intelligence practice." };

export default async function IntuitionPage() {
  const { user, unlocks } = await getAccess();
  const unlocked = !!user && hasUnlock(unlocks, "intuition");

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-40">
            <GateMind className="h-[420px] w-[420px]" />
          </div>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="修炼技术" en="Practice" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="直觉智能" en="Intuitive Intelligence" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="区分「世界教给你的声音」与「升自你心之深处的耳语」。直觉智能，是量子心滴入三维世界所产生的效果——它是把情感历史重铸进慈悲频率的一套技术。"
              en="Distinguish 'the voice the world taught you' from 'the whisper rising from deep in your heart.' Intuitive Intelligence is the effect of the quantum heart trickling into the three-dimensional world — a technique for recasting emotional history into the frequency of compassion."
            />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="心，是门户" en="The heart is the gateway" /></h2>
              <p className="mt-6">
                <Bi
                  zh="心远不只是泵血的肌肉，它是直觉智能的源头性模板。如同物质心脏把氧气送往全身，能量心把直觉智能送往心智。情感有着基于其频率的内置智能；当你听到一个声音里同时鸣奏着慈悲与理解，你就找到了自己的内在声音。"
                  en="The heart is far more than a muscle that pumps blood; it is the source template of intuitive intelligence. As the physical heart sends oxygen throughout the body, the energetic heart sends intuitive intelligence to the mind. Emotions carry a built-in intelligence based on their frequency; when you hear a voice that sounds both compassion and understanding at once, you have found your inner voice."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="那些遮蔽内在声音的「云层」，是被记录在神经与量子网络里的情感历史。清理它们是一个过程，而非一次性事件——通常需要持续练习 30 天或更久。"
                  en="The 'clouds' that veil the inner voice are emotional history recorded in the neural and quantum networks. Clearing them is a process, not a one-time event — usually requiring 30 days of steady practice, or more."
                />
              </p>
            </div>

            <figure className="mx-auto max-w-md">
              <div className="rounded-sm border border-white/10 bg-void">
                <IntuitionDiagram className="w-full" />
              </div>
              <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">
                <Bi zh="直觉智能的能量路径：从地心升起，经过我们的心，伸向无限远的无限（∞）。" en="The energy path of Intuitive Intelligence: rising from the Earth's core, passing through the heart, reaching toward the infinite (∞)." />
              </figcaption>
            </figure>

            <PracticeGate unlocked={unlocked} user={!!user} productName="直觉智能" productNameEn="Intuitive Intelligence">
              <div className="mb-12">
                <PracticeChart src="/images/practice/intuition-chart.jpg" alt="直觉智能技术 · 完整练习图（引文—想象—心呼吸—光之连接，含每日练习）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="唤起 · 引文" en="Evoke · the invocation" /></h3>
                  <p className="mt-3">
                    <Bi zh="把画面投射到胸口中央，而非头脑。轻声在心里念诵，并容许它在心中形成直观的画面：" en="Project the image to the center of your chest, not the head. Recite softly within, and let it form an intuitive picture in the heart:" />
                  </p>
                  <p className="mt-4 rounded-sm border border-white/10 bg-void-deep p-5 italic text-bone">
                    <Bi
                      zh="我的心之光亮起，我宽恕的能力随之活跃；宽恕一流进我的心便向上升起，以最柔和精炼的光充满整个头部。源自这光，一种对过往的慈悲安顿下来，发生过的一切，都被这光改写了。"
                      en="The light of my heart is lit, and my capacity to forgive comes alive; as forgiveness flows into my heart it rises upward, filling the whole head with the softest, most refined light. From this light, a compassion for the past settles in, and all that has happened is rewritten by this light."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="安顿 · 想象" en="Settle · imagine" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="把这光感知为一种极精炼的金色薄雾，悬浮在头部，在不可察觉的层面缓缓运动。去感觉这光带着智能——一种正在重写、改编你情感历史的能力。清晰的视觉与真实的情感，是这一步的关键。"
                      en="Perceive this light as an exquisitely refined golden mist, suspended around the head, moving slowly at an imperceptible level. Feel that this light carries intelligence — a capacity that is rewriting and re-editing your emotional history. Clear visualization and genuine feeling are the keys to this step."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="放手 · 经心而呼吸" en="Release · breathe through the heart" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="将注意力集中于呼吸。吸气时，想象把自我的欲望带入量子心的内室，屏息时让它悬浮其中、混合进升自能量心的慈悲之流。然后经由心脏区域呼出，每一次呼气都默念：让它留在神秘里，绽放自己的光。重复 6 到 8 次。"
                      en="Focus attention on the breath. As you inhale, imagine bringing the ego's desire into the inner chamber of the quantum heart; as you hold, let it hang there and blend into the stream of compassion rising from the energetic heart. Then exhale through the heart area, and with each exhale murmur within: let it stay in the mystery, and bloom its own light. Repeat 6 to 8 times."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="光之连接" en="Connection of light" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="想象一些光的细丝从你的量子心散出，把你连接上一个扩展性的能量格栅。它们既是根（锚定你的存在），也是翅膀（给予扬升与扩展）。一整天里，时不时感觉这个包围你的能量结构，将连接感觉为节律性的光之脉冲——流出格栅、进入心脏、再流向全身。每次约 2 秒，但要频繁。"
                      en="Imagine fine threads of light spreading out from your quantum heart, connecting you to an expansive energy lattice. They are both roots (anchoring your being) and wings (granting ascent and expansion). Throughout the day, feel from time to time this energetic structure surrounding you, sensing the connection as a rhythmic pulse of light — flowing out of the lattice, into the heart, and on through the whole body. About 2 seconds each time, but often."
                    />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi
                      zh="前三步是一组完整练习；第四步可独立、全天多次使用。重点不是用力，而是平衡身体内的光，使它聚合一致、有节律、自由流动。坚持 30 天，云层会一点点散去。"
                      en="The first three steps form one complete practice; the fourth can stand alone and be used many times a day. The point is not effort, but balancing the light within the body so it becomes coherent, rhythmic, and freely flowing. Keep it up for 30 days, and the clouds will disperse, little by little."
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
