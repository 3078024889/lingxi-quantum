export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateHealth from "@/components/gates/GateHealth";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "归零心诀 · 修炼技术 | 灵犀 · Heart Reset | Lingxi", description: "归零心诀：一套有具体步骤、可自我验证的呼吸重置练习，把心带回清晰、有序的状态。The Heart Reset — a concrete, verifiable breathing practice." };

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
            <Bi zh="修炼技术 · 约6分钟 · 可随时重复" en="Practice · about 6 minutes · repeatable anytime" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="归零心诀" en="Heart Reset" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="一套有明确步骤、能自我检验效果的呼吸练习——不需要相信任何东西，做完之后，你自己就能判断，它有没有起作用。" en="A breathing practice with clear steps and a way to check its own results — you don't need to believe anything. When it's done, you'll be able to judge for yourself whether it worked." />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="为什么心跳的节律会乱" en="Why the heart's rhythm goes ragged" /></h2>
              <p className="mt-6">
                <Bi zh="心脏并不是按固定间隔跳动的——两次心跳之间的间隔，一直在微小地变化，这种变化幅度，叫心率变异性。压力、愤怒、焦虑，会让交感神经占主导，这个间隔变得急促而没有规律；而当身体真正放松下来，副交感神经接管，这个间隔会变得舒缓、接近一种平滑起伏的波形。归零心诀要练的，就是主动切换到后一种状态——不是靠想象，是靠一个具体、可重复的生理动作：拉长呼气。" en="The heart doesn't beat at a fixed interval — the gap between beats constantly shifts, in a pattern called heart rate variability. Under stress, anger, or anxiety, the sympathetic nervous system takes over, and that gap grows rushed and erratic; when the body truly relaxes, the parasympathetic system takes over instead, and the gap settles into something slower, closer to a smooth wave. Heart Reset trains you to switch to that second state on purpose — not through imagination, but through one specific, repeatable physical action: lengthening the exhale." />
              </p>
              <p className="mt-4">
                <Bi zh="呼气比吸气长，会直接刺激迷走神经，这是连接心脏和大脑、负责让身体\u201c冷静下来\u201d的主要神经通路。这不是比喻，是可以在任何一台心率监测设备上，实时看到波形变化的生理反应。" en="Exhaling longer than you inhale directly stimulates the vagus nerve — the main pathway connecting heart and brain responsible for the body's 'calm down' response. This isn't a metaphor; it's a physiological reaction you can watch happen, in real time, on any heart-rate monitor." />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="归零心诀" productNameEn="Heart Reset">
              <div className="mb-12">
                <PracticeChart src="/images/practice/heart-reset-chart.jpg" alt="归零心诀 · 完整练习图（评分—落座—4-7-8呼吸—定位记忆—复评）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步 · 约20秒" en="Step 1 · about 20 seconds" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="先打一个分" en="Rate it first" /></h3>
                  <p className="mt-3">
                    <Bi zh="在开始之前，想一件此刻正让你紧绷、烦躁或委屈的具体事，给这份感觉的强度，打一个 0 到 10 分（10 分最强烈）。记住这个数字，或者写下来——这是练习结束后，唯一用来判断有没有效果的标准，不需要靠感觉猜。" en="Before you begin, think of one specific thing making you tense, irritated, or upset right now, and rate the intensity of that feeling from 0 to 10 (10 being strongest). Remember the number, or write it down — this is the only thing you'll use afterward to judge whether it worked. No guessing required." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步 · 约30秒" en="Step 2 · about 30 seconds" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="坐好，两只手各放一个位置" en="Sit down, hands in place" /></h3>
                  <p className="mt-3">
                    <Bi zh="找一个能坐直、后背有支撑的地方坐下。一只手，掌心贴在胸口正中央；另一只手，放在小腹上，肚脐上方两指宽的位置。闭上眼睛。这两个位置，是接下来用来\u201c感觉\u201d呼吸的定位点，不是象征，是实际要用手去感受起伏的地方。" en="Sit somewhere you can sit upright, with back support. Place one hand flat on the center of your chest; place the other hand on your lower belly, about two finger-widths above the navel. Close your eyes. These two spots aren't symbolic — they're where you'll actually feel the breath move, for real, with your hands." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步 · 约2.5分钟" en="Step 3 · about 2.5 minutes" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="拉长呼气的呼吸：4-7-8" en="The extended-exhale breath: 4-7-8" /></h3>
                  <p className="mt-3">
                    <Bi zh="用鼻子吸气，心里默数 4 秒；屏住呼吸，默数 7 秒；用嘴巴缓缓呼气，发出轻微的\u201c呼——\u201d声，默数 8 秒。这是一个完整的循环。重复 8 到 10 个循环。如果一开始数不到 7 秒或 8 秒也没关系，用自己能坚持、且不憋得难受的比例（比如 3-4-6），保持\u201c呼气明显比吸气长\u201d这个原则就够了。" en="Inhale through your nose, silently counting to 4. Hold the breath, counting to 7. Exhale slowly through your mouth, making a soft 'whoosh' sound, counting to 8. That's one full cycle. Repeat for 8 to 10 cycles. If you can't reach 7 or 8 seconds at first, that's fine — use whatever ratio you can sustain without straining (like 3-4-6), as long as the exhale stays noticeably longer than the inhale." />
                  </p>
                  <p className="mt-3">
                    <Bi zh="在第 4 到第 5 个循环左右，留意放在小腹上的那只手——如果呼吸做对了，你会感觉到它比放在胸口的那只手，起伏更明显。这是一个具体的检查点：如果胸口那只手动得更多，说明呼吸偏浅，试着把气吸得更深一点，让小腹先鼓起来。" en="Around the 4th or 5th cycle, notice the hand on your belly — if you're breathing correctly, it should move more than the hand on your chest. This is a concrete checkpoint: if the chest hand is moving more, your breath is too shallow. Try inhaling a bit deeper, letting the belly rise first." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步 · 约1.5分钟" en="Step 4 · about 1.5 minutes" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="锚定一个具体的画面" en="Anchor to one specific memory" /></h3>
                  <p className="mt-3">
                    <Bi zh="呼吸的节律稳定下来后，回到自然呼吸，不再刻意计数。在脑海里，找一个具体到能回忆起细节的、感到安心或被善待的真实片段——不是抽象的\u201c开心的事\u201d，是一个场景：谁在场、说了什么、当时的光线或气味。让注意力，停在这个画面上，直到胸口那只手，能感觉到心跳，比刚才安静了下来。" en="Once the breath settles, return to natural breathing without counting. In your mind, find one real memory specific enough to recall in detail — of feeling safe or cared for — not an abstract 'happy thing,' but an actual scene: who was there, what was said, the light or smell in that moment. Hold attention on this scene until the hand on your chest can feel the heartbeat grow quieter than it was." />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第五步 · 约20秒" en="Step 5 · about 20 seconds" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="睁眼，再打一次分" en="Open your eyes, rate it again" /></h3>
                  <p className="mt-3">
                    <Bi zh="睁开眼睛，回想第一步那件让你紧绷的事，再打一次 0 到 10 分。多数人第一次做完，分数会降 2 到 4 分——这不是玄学，是副交感神经真的被激活了，可以用心率监测设备验证。如果分数几乎没变，很可能是呼气没有拉长到位，或者第四步找的画面不够具体，下次调整这两处，比追问\u201c我是不是不够相信\u201d更有用。" en="Open your eyes, recall the thing from step one, and rate it again from 0 to 10. Most people, the first time, see the number drop by 2 to 4 points — this isn't mysticism, it's the parasympathetic system genuinely activating, verifiable on any heart-rate device. If the number barely moved, it's likely the exhale wasn't long enough, or the memory in step four wasn't specific enough. Adjusting those two things next time is more useful than wondering whether you 'believed hard enough.'" />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="怎么安排练习" en="How to schedule it" /></p>
                  <p className="mt-4">
                    <Bi zh="每天固定练一次，选一个不太可能被打断的时间——比如午休前，或者睡前。如果某天特别烦躁，随时可以加练。这套练习不会让你从此不再烦躁，它能做到的，是给你一个，在情绪已经升起来之后，还能主动把它降下来一截的、具体可靠的办法。" en="Practice once a day at a fixed time, ideally when you're unlikely to be interrupted — before a midday break, or before sleep. On a especially difficult day, do it again whenever needed. This won't make you stop feeling irritated ever again. What it gives you is a concrete, reliable way to bring an already-risen emotion back down a notch, on purpose." />
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
