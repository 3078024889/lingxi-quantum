export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateMind from "@/components/gates/GateMind";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import IntuitionDiagram from "@/components/diagrams/IntuitionDiagram";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "直觉丹道 · 修炼技术 | 灵犀 · The Intuitive Way | Lingxi", description: "直觉丹道：区分世界教给你的声音，与心底沉淀下来的判断，一套让直觉不再被头脑抢先开口的练习。The Intuitive Way practice." };

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
            <Bi zh="直觉丹道" en="The Intuitive Way" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="区分「这个世界教给你的声音」与「你这些年真正沉淀下来的判断」。直觉从不是凭空而来的神通，是你早已验证过、却不再需要逐步推理，就能调用的经验。"
              en="Distinguish 'the voice this world has taught you' from 'the judgment you've truly settled into over the years.' Intuition was never a gift from nowhere — it is experience you've already tested, no longer needing to pass through step-by-step reasoning to be called upon."
            />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为何直觉总被盖住" en="Why intuition keeps getting buried" /></h2>
              <p className="mt-6">
                <Bi
                  zh="真正拦住直觉的，从不是「想得不够多」，而是不肯让沉淀的部分，先于逐步推理开口。头脑的逐条核对天生比直觉慢——它需要把每个念头重新摆上台面，一条条核对；而沉淀下来的判断，早已把答案，一次性递到眼前。越是刻意告诉自己「别想，凭感觉」，那份刻意本身，就已经是另一层思考，反而把直觉，重新盖了回去。"
                  en="What truly blocks intuition was never 'not thinking enough' — it's refusing to let what has already settled speak before deliberate reasoning does. Step-by-step checking is inherently slower than intuition; it must lay each thought out again, checking one by one, while settled judgment has already handed over the answer in a single motion. The more deliberately you tell yourself not to think, just feel, the more that very deliberateness becomes another layer of thought, burying intuition right back down."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="遮蔽内在声音的，往往是那些没有被好好安放的情绪记忆。清理它们是一个过程，而非一次性事件——通常需要持续练习 30 天或更久。"
                  en="What veils the inner voice is often emotional memory that was never properly settled. Clearing it is a process, not a one-time event — usually requiring 30 days of steady practice, or more."
                />
              </p>
            </div>

            <figure className="mx-auto max-w-md">
              <div className="rounded-sm border border-white/10 bg-void">
                <IntuitionDiagram className="w-full" />
              </div>
              <figcaption className="mt-4 text-center text-sm leading-7 text-bone-dim/70">
                <Bi zh="直觉丹道的练习路径：从平静的胸口出发，穿过纷杂的念头，抵达清晰的判断。" en="The practice path of the Intuitive Way: starting from a calm chest, passing through scattered thought, arriving at clear judgment." />
              </figcaption>
            </figure>

            <PracticeGate unlocked={unlocked} user={!!user} productName="直觉丹道" productNameEn="The Intuitive Way">
              <div className="mb-12">
                <PracticeChart src="/images/practice/intuition-chart.jpg" alt="直觉丹道 · 完整练习图（唤起—安顿—放手—连接，含每日练习）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="唤起 · 一句提醒" en="Evoke · a reminder" /></h3>
                  <p className="mt-3">
                    <Bi zh="把注意力放在胸口，而非头脑。轻声在心里对自己说：" en="Bring attention to the chest, not the head. Say softly to yourself, within:" />
                  </p>
                  <p className="mt-4 rounded-sm border border-white/10 bg-void-deep p-5 italic text-bone">
                    <Bi
                      zh="我愿意先原谅自己，再看清眼下这件事。旧的评判可以先放一放，此刻的判断，只需要诚实，不需要完美。"
                      en="I am willing to forgive myself first, before I look clearly at what's in front of me. Old judgments can wait a moment. This moment's judgment only needs to be honest, not perfect."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="安顿 · 留意身体的信号" en="Settle · notice the body's signal" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="回想一件让你纠结的小事，留意身体的第一反应——是胸口一沉，还是肩膀一松？这个比头脑更快的信号，往往比反复权衡更值得信任。清晰的觉察，比强行分析更重要。"
                      en="Recall something small you've been torn over, and notice the body's first reaction — a sinking in the chest, or a loosening in the shoulders? This signal, faster than the mind, is often more trustworthy than repeated weighing. Clear noticing matters more than forced analysis."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="放手 · 不再反复核对" en="Release · stop double-checking" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="把注意力集中于呼吸。吸气时，让那份纠结的念头静静浮现；呼气时，默念：这个答案，已经够清楚了。重复 6 到 8 次，不再回头反复核对。"
                      en="Focus attention on the breath. As you inhale, let the tangled thought quietly surface; as you exhale, say inwardly: this answer is already clear enough. Repeat 6 to 8 times, without circling back to double-check."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="日常连接" en="Everyday connection" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="一整天里，遇到需要判断的小事时，先给自己两秒钟，感受胸口的第一反应，再决定。这个动作只需要 2 秒，但要经常做——它在训练的，是信任那份沉淀下来的判断的习惯。"
                      en="Throughout the day, whenever a small judgment is needed, give yourself two seconds to notice the chest's first reaction before deciding. This takes only 2 seconds, but do it often — it trains the habit of trusting settled judgment."
                    />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi
                      zh="前三步是一组完整练习；第四步可独立、全天多次使用。重点不是用力分析，而是让身体的第一反应，被听见。坚持 30 天，那些遮蔽判断的旧情绪，会一点点散去。"
                      en="The first three steps form one complete practice; the fourth can stand alone and be used many times a day. The point is not forceful analysis, but letting the body's first reaction be heard. Keep it up for 30 days, and the old emotion clouding judgment will disperse, little by little."
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
