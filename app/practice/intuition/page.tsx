export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateMind from "@/components/gates/GateMind";
import PracticeGate from "@/components/PracticeGate";
import { getAccess, hasUnlock } from "@/lib/access";
import IntuitionDiagram from "@/components/diagrams/IntuitionDiagram";
import PracticeChart from "@/components/PracticeChart";
import Bi from "@/components/Bi";

export const metadata = { title: "直觉丹道 · 修炼技术 | 灵犀 · The Intuitive Way | Lingxi", description: "直觉丹道：区分世界的声音与心之深处的耳语，四步修炼法重铸情感历史、接取内在声音。The Intuitive Way — a four-step practice recasting emotional history and accessing the inner voice." };

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
          <div className="bg-reading-glass mx-auto max-w-2xl rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="修炼技术" en="Practice" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="直觉丹道" en="The Intuitive Way" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="这个世界的声音可以追溯到自我人格，而原创性的声音则出自心之深处的耳语和轻推。直觉丹道，是一套重铸情感历史、接取内在声音的四步修炼法。"
              en="The voice of this world traces back to the personality of the self, while the voice of true originality arises from the whispers and nudges deep within the heart. The Intuitive Way is a four-step practice that recasts emotional history and accesses the inner voice."
            />
          </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="bg-reading-glass mx-auto max-w-3xl space-y-10 rounded-sm px-8 py-10 text-base leading-9 text-bone-dim sm:px-12">
            <div>
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="一 · 理论基底" en="I · Theoretical Foundation" /></p>
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
                  zh="光体是神圣心智的一枚粒子，由中枢太阳投射，穿越第5、第4维度矩阵，最终在人类心脏内具体表现。它最初栖息于心脏，前七年内上移至松果腺，临终时返回第五维度。如今，在宏大觉醒时代，它正迁移回心脏方向，现核心栖息地位于胸腺（心脏与喉咙之间），被称为「上升心经」或「心脏之冠」。"
                  en="The light-body is a particle of the divine mind, projected by the central sun, passing through the matrices of the 5th and 4th dimensions, ultimately made manifest within the human heart. It first resides in the heart, ascends to the pineal gland within the first seven years of life, and returns to the fifth dimension at death. Now, in this era of great awakening, it is migrating back toward the heart, its core dwelling now the thymus (between heart and throat), known as the 'Rising Heart' or the 'Crown of the Heart.'"
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="两条轴的交汇" en="Where the two axes meet" /></h2>
              <p className="mt-6">
                <Bi
                  zh="行星轴（水平轴）：连接光体与地球物质存在，将光体接地锚定于行星。中枢太阳轴（垂直轴）：连接光体与中枢太阳源头，承载下降与上升的能量流。两条轴的交汇点——上升心经，正是个体的活化点。呼吸与想象力的整合，是最有效的活化工具。"
                  en="The planetary axis (horizontal axis) connects the light-body to the earth's material existence, grounding and anchoring the light-body to the planet. The central-sun axis (vertical axis) connects the light-body to the source of the central sun, carrying the descending and ascending flow of energy. Where these two axes meet — the Rising Heart — is precisely the individual's point of activation. The integration of breath and imagination is the most effective tool for this activation."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="光体的迁移与意义" en="The light-body's migration, and its meaning" /></h2>
              <p className="mt-6">
                <Bi
                  zh="光体曾是意识的核心，坐落于松果腺；但因心智长期僵化与扭曲，压制了光体的绽放。如今光体正移向上升心经，以便将能量充分绽放至行星栅格，实现其目的。"
                  en="The light-body was once the core of consciousness, seated in the pineal gland; but long rigidity and distortion of the mind suppressed its blossoming. Now the light-body is moving toward the Rising Heart, so that its energy may fully bloom into the planetary grid and fulfill its purpose."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="光体的灿烂绽放与智能表达的结合，是生命在行星轴上的真正意义。这会启动进化道路的会合，赋权行星迁移，开启「伟大入口」——通往第五维度纯净能量矩阵的通道。"
                  en="The combination of the light-body's radiant blossoming and intelligent expression is the true meaning of life upon the planetary axis. This sets in motion a convergence of evolutionary paths, empowers planetary migration, and opens the 'Great Gateway' — the passage to the pure energy matrix of the fifth dimension."
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
                  zh="光之承载者以行为系统、美德之心的表达来界定。他们是集体性力量，共同编织时间、空间、能量的新织物，最终通向第五维度入口。"
                  en="Light-Bearers are defined by their behavior systems and by the expression of a virtuous heart. They are a collective force, together weaving a new fabric of time, space, and energy, one that ultimately leads to the entrance of the fifth dimension."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="呼吸与灵魂的关系" en="Breath and the soul" /></h2>
              <p className="mt-6">
                <Bi
                  zh="灵魂的呼吸由光体引导。光体智能的工作席位于上升心经。吸气时，中枢太阳的光能经顶轮流入，停驻于太阳神经丛，闪耀个人标识的金色光芒。呼气时，能量从太阳神经丛向上释放至上升心经，再向外绽放到行星轴，接地进第三维度所有存在的能量场。这种接地，灌注以人类仪具的内在聚合一致性，启动人类情感场，构建集体之心与连接性心智，使行星跨越维度栅栏。"
                  en="The breath of the soul is guided by the light-body. The working seat of the light-body's intelligence is the Rising Heart. On the inhale, the light-energy of the central sun flows in through the crown, coming to rest in the solar plexus, shining with the golden light of one's personal signature. On the exhale, that energy is released upward from the solar plexus to the Rising Heart, then blooms outward along the planetary axis, grounding into the energy field of every third-dimensional being. This grounding infuses the human instrument with inner coherence, activates the human emotional field, and builds a collective heart and connective mind, carrying the planet across the barrier of dimensions."
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

            <div>
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="二 · 内在声音与直觉丹道" en="II · The Inner Voice and Intuitive Alchemy" /></p>
              <h2 className="mt-3 font-display text-3xl font-light text-bone"><Bi zh="心是什么" en="What the heart is" /></h2>
              <p className="mt-6">
                <Bi
                  zh="心远远不只是泵压血液的物质性肌肉。能量性心脏是物质性心脏的源头性模板——正如物质心脏分送氧气，能量心分送直觉性智能给心智。"
                  en="The heart is far more than a physical muscle that pumps blood. The energetic heart is the source-template of the physical heart — just as the physical heart distributes oxygen, the energetic heart distributes intuitive intelligence to the mind."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="心是维度性和多重面向的：表达情感流、调节生理功能、触发大脑化学反应、接收预知性印记、连接所有存在。心也是慈悲之爱——复合宇宙中最纯粹力量——的门户。"
                  en="The heart is dimensional and multi-faceted: it expresses the flow of emotion, regulates physiological function, triggers brain chemistry, receives precognitive impressions, and connects to all existence. The heart is also the gateway to compassionate love — the purest force in the composite universe."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="爱分为若干频率，分别共振于复合宇宙的11个意识球。心本身也由不同意识层组成，每一层都拥有感知与表达的智能，链接着大脑和更高心智。"
                  en="Love divides into a number of frequencies, each resonating with one of the 11 spheres of consciousness within the composite universe. The heart itself is likewise composed of distinct layers of consciousness, each carrying its own intelligence of perception and expression, linking the brain to the higher mind."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="心运作于人类仪器内的最高频率上。情感速度比思想更快，当共振于更高回路时，运作于时间/空间之外。最深远的灵性体验编织以心的情感结构，而非心智思想结构。"
                  en="The heart operates at the highest frequency within the human instrument. Emotion moves faster than thought, and when resonating with higher circuits, operates outside of time/space. The most profound spiritual experiences are woven from the heart's structure of feeling, not the mind's structure of thought."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="关于内在声音" en="On the inner voice" /></h2>
              <p className="mt-6">
                <Bi
                  zh="这个世界的声音可以追溯到自我人格，而原创性的声音则出自心之深处的耳语和轻推。心的声音未必由话语构成，更多是感觉。心是多重层次的，真正内在的声音鸣奏着慈悲与理解的平衡。"
                  en="The voice of this world traces back to the personality of the self, while the voice of true originality arises from the whispers and nudges deep within the heart. The heart's voice need not be made of words — it is, more often, a feeling. The heart has many layers, and the truly inner voice plays a note that balances compassion with understanding."
                />
              </p>
              <p className="mt-4">
                <Bi
                  zh="人类仪器与三维度世界的不完美，如同云层遮蔽了心的深邃。若能超越云层，即使只有短暂时刻，都能接取并理解自己那内在的声音。"
                  en="The imperfections of the human instrument and the third-dimensional world are like clouds veiling the heart's depths. If you can rise above the clouds, even for just a brief moment, you can access and understand your own inner voice."
                />
              </p>
            </div>

            <div>
              <h2 className="font-display text-3xl font-light text-bone"><Bi zh="情感历史的清理" en="Clearing the emotional history" /></h2>
              <p className="mt-6">
                <Bi
                  zh="情感残骸并非铭刻在心本身，而是从心传递到大脑及其神经网络。清理需要因循同一条路线，是一个过程。它以宽恕性情感（慈悲频率）开始。心和大脑是一个联合系统，当被慈悲和理解的核心能量所夹带时，在三维度环境中表达固有智能会更为有效。"
                  en="Emotional debris is not inscribed in the heart itself, but transmitted from the heart to the brain and its neural networks. Clearing it must follow that same route, and it is a process. It begins with forgiving emotion (the frequency of compassion). The heart and brain form one joined system — when carried by the core energy of compassion and understanding, expressing innate intelligence within a third-dimensional environment becomes far more effective."
                />
              </p>
            </div>

            <figure className="mx-auto max-w-md">
              <div className="rounded-sm border border-white/10 bg-void">
                <IntuitionDiagram className="w-full" />
              </div>
              <figcaption className="mt-4 text-center text-sm leading-7 text-bone-soft">
                <Bi zh="直觉丹道的练习路径：从心之光的投射出发，穿过情感历史的重铸，抵达光之细丝的连接。" en="The practice path of The Intuitive Way: from the projection of the heart's light, through the recasting of emotional history, to the connection of filaments of light." />
              </figcaption>
            </figure>

            <PracticeGate unlocked={unlocked} user={!!user} productName="直觉丹道" productNameEn="The Intuitive Way">
              <div className="mb-12">
                <PracticeChart src="/images/practice/intuition-chart.jpg" alt="直觉丹道 · 完整练习图（引文与投射—容许光安顿—放手臣服—光之连接，含四步修炼法）" />
              </div>
              <div className="space-y-10">
                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第一步" en="Step 1" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="引文与投射" en="Recitation and Projection" /></h3>
                  <p className="mt-3">
                    <Bi zh="念诵以下引文，同时仔细聆听，容许文字在心里形成直观的画面：" en="Recite the following passage, and as you do, listen closely, allowing the words to form an intuitive image within the heart:" />
                  </p>
                  <p className="mt-4 bg-reading-glass p-5 italic text-bone">
                    <Bi
                      zh="我的心之光亮起，我那宽恕的能力也随着活跃起来，宽恕一流进我的心就向上升起，而以想象到的最柔和、精练的光充满了整个头部，源自这种光，对于我过往的一种慈悲安顿下来，发生过的一切都被这光所改写了。"
                      en="My heart's light comes alive, and my capacity for forgiveness stirs to life along with it. The moment forgiveness flows into my heart, it rises upward, filling my whole head with the softest, most refined light I can imagine. From this light, a compassion for my past settles into place, and everything that has ever happened is rewritten by this light."
                    />
                  </p>
                  <p className="mt-4">
                    <Bi
                      zh="可视化要点：将画面投射到你胸口的中央区域。那个观看这个投射图的人，正是你身体之外几米远处观察着的你自己。关键：可视化和想象能衔接心的核心智能，大脑的接受能力取决于此。清晰想象形象，投射到心脏区域，并灌输心的核心情感，就向更高大脑发送了更强效的信号。"
                      en="Visualization notes: project this image onto the central region of your chest. The one watching this projection is you yourself, observing from a few meters outside your own body. Key point: visualization and imagination link into the heart's core intelligence, and the brain's receptivity depends on this. Clearly imagining the image, projecting it onto the heart region, and infusing it with the heart's core feeling sends a far more potent signal to the higher brain."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第二步" en="Step 2" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="容许光安顿" en="Allowing the Light to Settle" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="将光感知为一种非常精炼的金色薄雾，它悬浮着，在无法感知的层面却又运动着。重要的是去感觉：光在你头部的这种移动具有智能——一种重写的能力，正在重写、改编你的情感历史。这是一个过程，需要坚持践习一段时间——典型的是30天或更长。"
                      en="Perceive the light as an exceedingly refined golden mist — suspended, yet moving at a level beyond ordinary perception. What matters is to feel: this movement of light within your head carries intelligence — a capacity for rewriting, actively rewriting and revising your emotional history. This is a process that requires sustained practice over time — typically 30 days or more."
                    />
                  </p>
                  <p className="mt-4">
                    <Bi
                      zh="原理：更高大脑对心之信息的读取，被设计去基于信息在视觉能量和情感真实性上的界定水平。无论什么形象被投射到心脏区域，都被赋予了能量。"
                      en="Principle: the higher brain's reading of information from the heart is designed to be based on the level of definition that information carries in visual energy and emotional authenticity. Whatever image is projected onto the heart region is thereby imbued with energy."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第三步" en="Step 3" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="放手（臣服）" en="Letting Go (Surrender)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="完成前两步后，采取臣服或放手的姿态——对技术带来的结果放手，对情感历史正在被改变这一事实放手。"
                      en="Once the first two steps are complete, take up a posture of surrender or letting go — letting go of the results this technique brings, and letting go of the fact that your emotional history is being changed."
                    />
                  </p>
                  <p className="mt-4">
                    <Bi zh="操作方法：1. 将注意力集中在呼吸上。2. 想象吸气将自我的欲望带入量子心的内室里。3. 屏气，让这股已吸入的气息悬浮在这个内室里——此时气息正混合进那升自能量心的慈悲之流。4. 经由心脏区域将这被充能了的气息呼出去。5. 每一次呼气，重复这句话：「让它留在神秘里，绽放自己的光。」6. 重复6到8次。" en="Method: 1. Focus attention on the breath. 2. Imagine the inhale carrying the desires of the self into the inner chamber of the quantum heart. 3. Hold the breath, letting the inhaled breath suspend within that inner chamber — as it does, it mixes into the stream of compassion rising from the energetic heart. 4. Exhale this now-charged breath out through the heart region. 5. With each exhale, repeat the phrase: 'Let it remain in mystery, blooming its own light.' 6. Repeat 6 to 8 times." />
                  </p>
                  <p className="mt-4">
                    <Bi
                      zh="要点：放手需要信赖——信任自己最深处的智能，以及它所升自的源头的智能。难的部分，是理解自我人格的评判是有害的、对立于直觉性智能的。自我并不需要被驱逐，而是需要被提纯。经由心脏区域去呼吸，是将自我欲望混合进心之能力的方法，同时也是放手的方法。"
                      en="Key point: letting go requires trust — trust in your own deepest intelligence, and in the intelligence of the source it rises from. The hard part is understanding that the judgment of the self's personality is harmful, standing opposed to intuitive intelligence. The self does not need to be banished — it needs to be purified. Breathing through the heart region is the method by which the self's desires are mixed into the heart's capacity, and it is, at once, the method of letting go."
                    />
                  </p>
                </div>

                <div className="border-l border-lattice/30 pl-6">
                  <p className="font-display text-sm uppercase tracking-widest2 text-amber"><Bi zh="第四步" en="Step 4" /></p>
                  <h3 className="mt-2 font-display text-2xl text-bone"><Bi zh="光之连接（光之分送）" en="Light Connection (Distribution of Light)" /></h3>
                  <p className="mt-3">
                    <Bi
                      zh="原理：如同物质心脏通过血液将氧气分送全身，量子心藉由视觉能量和情感真实性将光分送给人类仪器的各个部分。"
                      en="Principle: just as the physical heart distributes oxygen throughout the body via the blood, the quantum heart distributes light to every part of the human instrument through visual energy and emotional authenticity."
                    />
                  </p>
                  <p className="mt-4">
                    <Bi zh="操作方法：1. 想象心跳动于胸口而将氧气分送到身体和大脑系统。2. 想象同样的机能正发生于量子心——但没有静脉和动脉，只有光的细丝，散自量子心，将你连接上一个扩展性格栅。3. 将这些细丝想作既是根又是翅膀——根在锚定你的实存，翅膀为你的生命提供扬升和扩展。4. 一整天，去感觉这个包围着你的能量结构。想象心像插头般插入这个结构中。5. 将这种连接感觉为节律性的光之脉冲——流出格栅，进入心脏系统，然后流向身体其余部分。" en="Method: 1. Imagine the heart beating in the chest, distributing oxygen to the body and brain systems. 2. Imagine that very same function occurring within the quantum heart — but with no veins or arteries, only filaments of light, radiating out from the quantum heart, connecting you to an expansive grid. 3. Think of these filaments as both roots and wings — roots anchoring your existence, wings providing your life with ascension and expansion. 4. Throughout the day, feel this energy structure surrounding you. Imagine the heart plugging into this structure like a plug into a socket. 5. Feel this connection as a rhythmic pulse of light — flowing out from the grid, into the heart system, then onward to the rest of the body." />
                  </p>
                  <p className="mt-4">
                    <Bi
                      zh="使用频率：可全天使用，每次约2秒钟。理想情况每天使用约20次。这个技术能重新平衡并补充核心的心之频率，确保它们被分送到整个人类仪器，活化内在的流。"
                      en="Frequency of use: can be used throughout the day, about 2 seconds at a time. Ideally, about 20 times a day. This technique rebalances and replenishes the core frequencies of the heart, ensuring they are distributed throughout the whole human instrument, activating the inner flow."
                    />
                  </p>
                  <p className="mt-4">
                    <Bi
                      zh="注意：分送光不是专注于光使之更明亮——那会产生相反效果（身体疲惫虚弱）。而是平衡人类仪器内的光比率，确保它聚合一致、有节律、自由流动。"
                      en="Note: distributing light is not about focusing on the light to make it brighter — that produces the opposite effect (bodily fatigue and weakness). It is about balancing the ratio of light within the human instrument, ensuring it stays coherent, rhythmic, and freely flowing."
                    />
                  </p>
                </div>

                <div className="bg-reading-glass p-8">
                  <p className="font-display text-lg text-lattice"><Bi zh="练习提醒" en="Practice notes" /></p>
                  <p className="mt-4">
                    <Bi
                      zh="这四步法帮助将情感历史重铸进慈悲频率，从而获得对自身内在声音（直觉性智能）更深入的接取和更流畅的表达。"
                      en="These four steps help recast your emotional history into the frequency of compassion, granting you deeper access to your own inner voice — intuitive intelligence — and a more fluent expression of it."
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
