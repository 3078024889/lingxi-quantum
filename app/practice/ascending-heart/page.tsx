export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateDestiny from "@/components/gates/GateDestiny";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "上升心经 · 修炼技术 | 灵犀 · The Ascending Heart Sutra | Lingxi", description: "上升心经：光体正迁移向胸腺间的「上升之心」，四式呼吸法助你在行星轴与中枢太阳轴的交汇点上活化自身。The Ascending Heart Sutra — a four-form breath practice at the meeting point of the planetary and central-sun axes." };

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
            <Bi zh="上升心经" en="The Ascending Heart Sutra" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="光体正从松果腺迁移向胸腺——心脏与喉咙之间——这里被称为「上升之心」，是行星轴与中枢太阳轴的交汇点。呼吸与想象力的整合，是活化这个交汇点最有效的工具。"
              en="The light-body is migrating from the pineal gland toward the thymus — between heart and throat — the site known as the Rising Heart, the meeting point of the planetary axis and the central-sun axis. The integration of breath and imagination is the most effective tool for activating this point."
            />
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10 text-base leading-9 text-bone-dim">
            <div>
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice/70"><Bi zh="一 · 理论基底" en="I · Theoretical Foundation" /></p>
              <h2 className="mt-3 font-display text-3xl font-light text-bone"><Bi zh="背景与定位" en="Background and positioning" /></h2>
              <p className="mt-6">
                <Bi
                  zh="本文传递的内容，源自来自远古遥远星系的智慧传承，以古老又切合当下的声音呈现。"
                  en="What this text conveys is drawn from a wisdom lineage passed down from an ancient, far-distant galaxy, delivered in a voice both ancient and precisely attuned to the present moment."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="地球正穿过更高维度的光能量走廊，人类文明将被重构与再校准。其目标是提供框架，使个体赋权自身，成为灵性觉醒的原动力，校准于地球扬升。"
                  en="The earth is passing through a corridor of higher-dimensional light-energy, and human civilization is being restructured and recalibrated. The goal is to provide a framework by which the individual empowers themself, becoming the driving force of their own spiritual awakening, aligned with the earth's ascension."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="光体的本质" en="The nature of the light-body" /></h2>
              <p className="mt-6">
                <Bi
                  zh="光体是神圣心智的一枚粒子，由中枢太阳投射，穿越第5、第4维度矩阵，最终在人类心脏内具体表现。它最初栖息于心脏，前七年内上移至松果腺，临终时返回第五维度。如今，在宏大觉醒时代，它正迁移回心脏方向，现核心栖息地位于胸腺（心脏与喉咙之间），被称为「上升之心」或「心脏之冠」。"
                  en="The light-body is a particle of the divine mind, projected by the central sun, passing through the matrices of the 5th and 4th dimensions, ultimately made manifest within the human heart. It first resides in the heart, ascends to the pineal gland within the first seven years of life, and returns to the fifth dimension at death. Now, in this era of great awakening, it is migrating back toward the heart, its core dwelling now the thymus (between heart and throat), known as the 'Rising Heart' or the 'Crown of the Heart.'"
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="两条轴的交汇" en="Where the two axes meet" /></h2>
              <p className="mt-6">
                <Bi
                  zh="行星轴（水平轴）：连接光体与地球物质存在，将光体接地锚定于行星。中枢太阳轴（垂直轴）：连接光体与中枢太阳源头，承载下降与上升的能量流。两条轴的交汇点——上升之心，正是个体的活化点。"
                  en="The planetary axis (horizontal axis) connects the light-body to the earth's material existence, grounding and anchoring the light-body to the planet. The central-sun axis (vertical axis) connects the light-body to the source of the central sun, carrying the descending and ascending flow of energy. Where these two axes meet — the Rising Heart — is precisely the individual's point of activation."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="光体的迁移与意义" en="The light-body's migration, and its meaning" /></h2>
              <p className="mt-6">
                <Bi
                  zh="光体曾是意识的核心，坐落于松果腺；但因心智长期僵化与扭曲，压制了光体的绽放。如今光体正移向上升之心，以便将能量充分绽放至行星栅格，实现其目的。"
                  en="The light-body was once the core of consciousness, seated in the pineal gland; but long rigidity and distortion of the mind suppressed its blossoming. Now the light-body is moving toward the Rising Heart, so that its energy may fully bloom into the planetary grid and fulfill its purpose."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="光体的灿烂绽放 + 智能表达 = 生命在行星轴上的真正意义。这会启动进化道路的会合，赋权行星迁移，开启「伟大入口」——通往第五维度纯净能量矩阵的通道。"
                  en="The radiant blossoming of the light-body, plus intelligent expression, equals the true meaning of life upon the planetary axis. This sets in motion a convergence of evolutionary paths, empowers planetary migration, and opens the 'Great Gateway' — the passage to the pure energy matrix of the fifth dimension."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="建设者与光之承载者" en="Builders and Light-Bearers" /></h2>
              <p className="mt-6">
                <Bi
                  zh="当下化身的人类中，有许多是「建设者」——设计新文化、金融、科技、灵性系统的设计师与工程师。"
                  en="Among the humans incarnate at this time, many are 'Builders' — designers and engineers of new cultural, financial, technological, and spiritual systems."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="光之承载者并非以语言施教，而是以行为系统、美德之心的表达、以及上升之心这类技术的应用来界定。他们是集体性力量，共同编织时间、空间、能量的新织物，最终通向第五维度入口。"
                  en="Light-Bearers do not teach through words; they are defined by their behavior systems, by the expression of a virtuous heart, and by the application of technologies such as the Rising Heart. They are a collective force, together weaving a new fabric of time, space, and energy, one that ultimately leads to the entrance of the fifth dimension."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸与灵魂的关系" en="The relationship between breath and soul" /></h2>
              <p className="mt-6">
                <Bi
                  zh="灵魂的呼吸由光体引导。光体智能的工作席位于上升之心。吸气时，中枢太阳的光能经顶轮流入，停驻于太阳神经丛，闪耀个人标识的金色光芒。呼气时，能量从太阳神经丛向上释放至上升之心，再向外绽放到行星轴，接地进第三维度所有存在的能量场。"
                  en="The breath of the soul is guided by the light-body. The working seat of the light-body's intelligence is the Rising Heart. On the inhale, the light-energy of the central sun flows in through the crown, coming to rest in the solar plexus, shining with the golden light of one's personal signature. On the exhale, that energy is released upward from the solar plexus to the Rising Heart, then blooms outward along the planetary axis, grounding into the energy field of every third-dimensional being."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸的终极目的" en="The ultimate purpose of the breath" /></h2>
              <p className="mt-6">
                <Bi
                  zh="吸气吸入中枢太阳的光，带入灵魂的工作室，添加进带有你个人指纹的爱，再释放给兄弟姊妹和地球——这一简单行为便创造了更高的连接。借此重新激活呼吸与心跳的联合，校准于宏大觉醒，将假象场留在身后。"
                  en="To inhale the light of the central sun, carry it into the workshop of the soul, add to it the love bearing your own unique fingerprint, and then release it to your brothers and sisters and to the earth — this simple act alone creates a higher connection. Through this, the union of breath and heartbeat is reactivated, aligning you with the great awakening, and leaving the field of illusion behind."
                />
              </p>
            </div>

            <PracticeGate unlocked={unlocked} user={!!user} productName="上升心经" productNameEn="The Ascending Heart Sutra">
              <div className="mb-12">
                <PracticeChart src="/images/practice/ascending-heart-chart.jpg" alt="上升心经 · 完整练习图（吸气接引—呼气绽出—载波调频—节律合一，含四式呼吸法）" />
              </div>
              <div className="space-y-10">
                <p className="text-sm leading-8 text-bone-dim/80">
                  <Bi zh="预备：感知胸腺区（心脏与喉咙间）为「上升之心」能量交汇点，即两条轴的交汇处。" en="Preparation: sense the thymus region (between heart and throat) as the energy meeting point of the 'Rising Heart' — where the two axes intersect." />
                </p>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一式" en="First Form" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="吸气接引（源能灌入）" en="Inhale and Receive (Source Energy Infusion)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="吸气时，观想中枢太阳的金色光能自顶轮灌入，沿脊柱下行，沉入太阳神经丛（脐上）。光在此暂驻，闪耀你独有的个人基调与标识。此为「接收指令」阶段。"
                      en="As you inhale, visualize the golden light-energy of the central sun pouring in through the crown, descending along the spine, settling into the solar plexus (above the navel). The light pauses here, shining with your own unique tone and signature. This is the 'receiving instruction' phase."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二式" en="Second Form" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="呼气绽出（接地赋力）" en="Exhale and Radiate (Grounded Empowerment)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="呼气时，将此能量从太阳神经丛上提至胸腺（上升之心），再沿水平轴向外辐射，接地进行星栅格及众生能量场。每一次呼出，即将更高之光分享给集体之心。此为「投放服务」阶段。"
                      en="As you exhale, lift this energy from the solar plexus up to the thymus (the Rising Heart), then radiate it outward along the horizontal axis, grounding it into the planetary grid and into the energy field of all beings. Each exhale shares this higher light with the collective heart. This is the 'delivering service' phase."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三式" en="Third Form" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="载波调频（标识场锚定）" en="Carrier-Wave Modulation (Signature-Field Anchoring)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="呼吸间，感知自身电磁场如「载波」，承载中枢太阳的原生信号。以内在聚合一致性（思想与情感校准于神圣意志）调制此波，使光能穿透行星的僵化与扭曲电磁场。你的标识场因之成为更高之光的穿透载体。"
                      en="Between breaths, sense your own electromagnetic field as a 'carrier wave,' bearing the native signal of the central sun. Modulate this wave through inner coherence — thought and feeling aligned to the divine will — so that this light-energy can penetrate the planet's rigid and distorted electromagnetic field. Your signature field thus becomes a penetrating vehicle for the higher light."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四式" en="Fourth Form" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="节律合一（心跳与呼吸协同）" en="Rhythmic Unity (Heartbeat and Breath in Concert)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="察觉呼吸与心跳的联合节律，视其为连接宇宙智能的活线，连接个体生命与中枢太阳的遍在智能。吸气为「接引」，呼气为「绽出」，在往复中平衡光与爱的流入流出。此种节律协同，能长久维系光体的活化状态，并复原人类仪具的平衡。"
                      en="Notice the joined rhythm of breath and heartbeat, and regard it as the live wire connecting you to cosmic intelligence — linking individual life to the omnipresent intelligence of the central sun. The inhale is 'receiving,' the exhale is 'radiating,' and in this back-and-forth, the inflow and outflow of light and love come into balance. This rhythmic concert can sustain the light-body's activated state over the long term, and restores balance to the human instrument."
                    />
                  </p>
                </div>

                <div className="rounded-sm border border-white/10 bg-void-deep p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习要诀" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi
                      zh="反复阅读全文，避免轻率判定其是否有益。运用直觉诠释，精密细节由个体自行完成。每日练习，将此呼吸融入静止与行动。你的行为系统与美德之心的表达，才是界定你的真正标志。"
                      en="Read the full text over and over, and avoid judging too quickly whether it is of benefit. Use intuition to interpret it — the fine details are for each individual to work out. Practice daily, weaving this breath into stillness and into action. Your behavior system and the expression of a virtuous heart are what truly define you."
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
