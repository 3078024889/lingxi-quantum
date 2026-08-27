import Link from "next/link";
import Bi from "./Bi";

export type FieldInsight = { href:string; no:string; glyph:string; zh:string; en:string; leadZh:string; leadEn:string; bodyZh:string[]; bodyEn:string[]; timeZh?:string; timeEn?:string; ctaZh:string; ctaEn:string; closingZh?:string; closingEn?:string };

// One editorial source for all nine entrances. Product pages remain the source
// of forms and reports; this is the complete bilingual orientation layer.
const INSIGHTS: FieldInsight[] = [
  {href:"/life-map",no:"01",glyph:"🌌",zh:"生命图谱",en:"Life Blueprint",leadZh:"照见你的生命结构",leadEn:"Witness the structure of your life",bodyZh:[
    "你的每一次呼吸与选择，并非随机的散落，而是内在意识与此时此地持续共振的显化。",
    "在这里，西方占星、中式八字、紫微斗数、玛雅圣历与吠陀占星，是五条交汇的意识流。它们在这个活的场域中共同流淌，化作一面多维的镜像，温柔且如实地照见你携带而来的独特生命结构。",
    "作为正在体验物质世界的意识体，日常的嘈杂往往会掩盖住我们本真的频率。这份图谱，只是为你创造一个向内停泊的空间。它不越界替你定义任何答案，只是将你内心深处早已知晓、却在旅途中暂时遗忘的那部分内在智慧，重新浮现于你的眼前。",
    "真正的确认，发生在你与真实的自己重新对齐的那一瞬。每一段涌现的解读，都来自多维视角之间的交叉映照——它最终仍要回到你的真实经历、关系、选择与感受之中，被你亲自确认。"],bodyEn:[
    "None of your breaths or choices are random fragments. Each manifests the continuing resonance between your inner awareness and this moment and place.",
    "Here, Western astrology, Chinese Bazi, Zi Wei Dou Shu, the Maya sacred calendar, and Vedic astrology meet as five currents of consciousness. Together they form a multidimensional mirror, gently and honestly reflecting the unique life structure you carry.",
    "Daily noise can conceal our original frequency. This blueprint creates a place to anchor inward. It does not define you; it brings back into view the inner wisdom you have always known, yet may have temporarily forgotten along the way.",
    "True recognition happens when you realign with who you are. Every interpretation emerges through multiple perspectives and ultimately returns to your own experiences, relationships, choices, and feelings for you to confirm."],timeZh:"当愿意补充更具体的降生时刻，图谱会展开更多与时间位置相关的细微层次，让一些原本隐藏在整体结构中的连接变得更清晰。",timeEn:"A precise birth time unfolds subtler layers of time and position, bringing connections hidden within the larger structure into clearer view.",ctaZh:"开始探索",ctaEn:"Begin the Exploration",closingZh:"这是一场不带评判的自我觉察。当你看见那些曾经不易察觉的模式，它们便不再只是无意识地发生，而成为你重新选择、重新创造现实的起点。",closingEn:"This is self-awareness without judgment. Once unseen patterns become visible, they become a place from which you can choose again and create anew."},
  {href:"/relationship",no:"02",glyph:"🌌",zh:"关系共振",en:"Relationship Resonance",leadZh:"照见两个生命的交汇",leadEn:"Witness where two lives meet",bodyZh:[
    "每一段相遇，都是两个独立宇宙的引力交织。",
    "当两套生命结构在场域中多条节点相遇，关系便开始显现属于它自己的纹理。哪里自然靠近，哪里彼此映照，哪里形成互补，又有哪些差异与张力，正在让彼此看见过去未曾察觉的部分。",
    "关系不是一个静止的答案。它发生在一次次靠近、回应、理解与选择之中。关系共振所呈现的，是这段连接此刻正在形成的样子——你们如何感受彼此，如何影响彼此，又如何在真实互动中共同塑造这段关系。",
    "请选择你们正在体验的共振类型：深度关系共振，照见情感流动、内在需求与安全感如何回应；合伙商业关系，照见创造、决策、行动与资源流动中的互补；其他关系，适用于家人、朋友、伙伴、导师与重要同行者。"],bodyEn:[
    "Every meeting is the gravitational interweaving of two independent universes.",
    "When two life structures meet across many nodes, the relationship reveals a texture of its own: where closeness comes naturally, where you mirror or complement one another, and which tensions reveal what neither had seen before.",
    "A relationship is not a fixed answer. It happens through approaching, responding, understanding, and choosing. Relationship Resonance reveals the connection as it is taking shape now and how you create it together through real interaction.",
    "Choose Deep Relationship Resonance for emotional flow, inner needs, and felt safety; Business Partnership for creation, decisions, action, and resources; or Other Relationship for family, friends, collaborators, mentors, and important companions."],timeZh:"补充双方更具体的降生时刻，可展开更多与时间位置相关的互动层次，让一些细微的连接、差异与彼此之间的呼应被进一步照见。",timeEn:"Adding both precise birth times unfolds subtler layers of timing and interaction, revealing finer connections, differences, and echoes between you.",ctaZh:"开启共振探索",ctaEn:"Begin the Resonance Exploration",closingZh:"万物交织，所有的关系，在彼此的引力中，温柔地走向自己。",closingEn:"All things interweave. Within each other’s gravity, every relationship gently moves each person toward themselves."},
  {href:"/resilience",no:"03",glyph:"🌱",zh:"生命韧性指数",en:"Life Resilience Index",leadZh:"当现实发生偏转，系统如何接住自己",leadEn:"How your system catches you when reality shifts",bodyZh:[
    "真正的韧性，不是咬牙硬撑，而是在变化、未知与失重到来时，生命仍能重新调整自己的节奏。",
    "很多时候，人们只顾着问“还能撑多久”，却很少真正看见：自己的生命结构，原本是怎样恢复、回稳与重新展开的。",
    "灵犀场沿着你的生命结构，展开多个彼此关联的韧性节点。它们彼此连接，共同呈现力量如何流动、恢复如何发生、哪些部分更容易形成支撑，又有哪些位置需要更多理解与照顾。",
    "这些节点与你有关，因为真正能够确认它们的，是你已经走过的人生。那些变化、停顿、坚持与重新开始，都会成为这张图谱最真实的参照。",
    "看见自己的韧性结构，是为了更懂得如何与自己相处。当你知道力量通常从哪里回来，也看见哪些位置更容易失衡，便能在下一次变化发生时，更早理解自己的状态，也更清楚该怎样把自己重新接住。"],bodyEn:[
    "Real resilience is not gritting your teeth and enduring. It is life finding its rhythm again when change, uncertainty, or weightlessness arrives.",
    "We often ask how much longer we can hold on, yet rarely notice how our own life structure naturally recovers, steadies, and begins to unfold again.",
    "Lingxi Field traces interconnected resilience nodes through your life structure. Together they show how strength moves, how recovery happens, where support forms, and which places need more understanding and care.",
    "These nodes are yours to confirm through the life you have already lived. Every change, pause, act of persistence, and new beginning becomes a real reference for this map.",
    "Seeing your resilience structure helps you understand how to be with yourself. When you know where strength returns and where balance is easier to lose, you can recognize your state earlier and know how to catch yourself when change comes again."],timeZh:"补充更具体的降生时刻，可展开更多与时间节律相关的结构层次，让韧性节点之间更细微的连接被进一步照见。",timeEn:"A precise birth time unfolds additional layers of timing and rhythm, revealing subtler connections among your resilience nodes.",ctaZh:"展开我的生命韧性指数",ctaEn:"Unfold My Life Resilience Index"},
  {href:"/romance",no:"04",glyph:"🌸",zh:"桃花磁场指数",en:"Romance Resonance Index",leadZh:"你的频率，正在唤醒怎样的共振",leadEn:"What resonance is your frequency awakening?",bodyZh:[
    "每个人向外传递的吸引力，都有自己的方式。有人明亮直接，有人温柔包容；有人在深度交流中产生连接，也有人只是安静地存在，便会被感受到。吸引力不是刻意维持的表现，而是你的表达、回应、边界与情感节奏，共同形成的一种生命互动方式。",
    "灵犀场沿着你的生命结构，展开与吸引、靠近和关系感知相关的磁场纹理——照见你的吸引力更容易从哪里自然流露，你习惯怎样与他人建立连接，以及什么样的互动，更容易与你形成真实的回应。",
    "曾经的心动、靠近、被感受到，甚至那些没有继续展开的连接，都会成为理解自己磁场方式的真实参照。",
    "看见自己的桃花磁场，不是为了改变自己去迎合谁。而是更清楚地知道，当真实地成为自己时，你正在以怎样的方式被世界感受到。"],bodyEn:[
    "Everyone carries attraction outward differently. Some are bright and direct, others gentle and spacious; some connect through deep conversation, while others are felt simply through quiet presence. Attraction is a way of relating formed by expression, response, boundaries, and emotional rhythm.",
    "Lingxi Field follows your life structure to reveal patterns of attraction, approach, and relational perception: where your magnetism flows naturally, how you connect, and which interactions meet you with a genuine response.",
    "Moments of attraction, closeness, being seen, and even connections that never unfolded further all become real references for understanding your magnetic field.",
    "Seeing your romance field is not about changing yourself to appeal to someone. It is about knowing how the world feels you when you are genuinely yourself."],timeZh:"补充更具体的降生时刻，可展开更多与时间节律相关的结构层次，让吸引与关系连接中更细微的纹理被进一步照见。",timeEn:"A precise birth time unfolds additional layers of timing and rhythm, revealing finer textures within attraction and connection.",ctaZh:"连接我的桃花磁场",ctaEn:"Connect with My Romance Field"},
  {href:"/wealth",no:"05",glyph:"🌾",zh:"财富创造地图",en:"Wealth Creation Map",leadZh:"照见你与丰盛对齐的方式",leadEn:"Witness how you align with abundance",bodyZh:[
    "财富从来不是单一的数字积累，而是你的生命能量在物质世界中的显化与流动。它关乎你如何感知机会、如何建立价值、如何调动现实资源，也关乎内在的创造力，如何以更自然的方式进入现实。",
    "每个人都有属于自己的创造路径——有人擅长开拓，有人更适合沉淀与积累；有人通过连接促成资源流动，也有人通过洞察与创意，让新的价值由此发生。",
    "灵犀场沿着你的生命结构，展开与创造、行动、资源和价值流动相关的纹理——照见你更自然地以怎样的角色进入创造过程，以什么节奏推动事物，以及哪些方式，更容易让你的能力形成持续而真实的回响。",
    "这些呈现，最终都会回到你的真实经历之中。那些曾经做得格外顺畅的事，那些反复出现的机会与连接，以及曾经让你感到停滞或消耗的过程，都会成为理解自己创造方式的真实参照。",
    "看见财富创造地图，不是为了得到一个关于未来的答案。而是更清楚地知道：你的价值适合从哪里生长，又以怎样的方式，更自然地进入现实世界。"],bodyEn:[
    "Wealth is never only accumulated numbers. It is the manifestation and movement of your life energy through the material world: how you sense opportunity, establish value, mobilize resources, and let creativity enter reality.",
    "Everyone has a distinct creative path. Some open new ground, others deepen and accumulate; some move resources through connection, while others bring new value into being through insight and imagination.",
    "Lingxi Field traces creation, action, resources, and value through your life structure, revealing the role and rhythm that come naturally and the ways your capacities create sustained, authentic resonance.",
    "These reflections return to your lived experience. Work that once flowed with unusual ease, recurring opportunities and connections, and processes that left you stalled or depleted all become real references for understanding how you create.",
    "The Wealth Creation Map is not an answer about the future. It helps you see where your value can grow and how it can enter the real world more naturally."],timeZh:"补充更具体的降生时刻，可展开更多与时间节律相关的结构层次，让价值流动与创造模式中更细微的纹理被进一步照见。",timeEn:"A precise birth time unfolds additional layers of timing and rhythm, revealing finer textures within value flow and creative patterns.",ctaZh:"进入我的财富创造频率",ctaEn:"Enter My Wealth-Creation Frequency"},
  {href:"/daily",no:"06",glyph:"🌙",zh:"灵犀场 · 今日潮汐",en:"Lingxi Field · Today’s Tide",leadZh:"感受当下的宇宙节律",leadEn:"Feel the cosmic rhythm of this moment",bodyZh:[
    "宇宙的刻度，每一天都在变化。",
    "真实的月相与行星位置持续流转，灵犀场依据当日天文数据，将这一刻的天空状态映照为属于今天的潮汐参照。",
    "当今日的宇宙节律与你的太阳位置相遇，它可能落在情绪的起伏、行动的节奏、灵感的出现，也可能只是提醒你：今天，哪里适合向前，哪里更适合停下来听见自己。",
    "选择你的太阳星座。在纷繁的日常里，看见自己此刻正处于怎样的节律之中，感受生命与宇宙之间那些细微却真实的呼应。每日数据更新 · 即时呈现。"],bodyEn:[
    "The universe’s measure changes every day.",
    "Real lunar phases and planetary positions continue to move. Using the day’s astronomical data, Lingxi Field reflects the present sky as a tidal reference for today.",
    "When today’s cosmic rhythm meets your Sun, it may appear as emotional movement, a pace for action, a moment of inspiration, or a reminder of where to move forward and where to pause and hear yourself.",
    "Choose your Sun sign. Amid everyday complexity, notice the rhythm you are moving through and feel the subtle yet real echoes between life and the cosmos. Updated daily · Shown in real time."],ctaZh:"感知我的今日潮汐",ctaEn:"Sense My Today’s Tide"},
  {href:"/mirror",no:"07",glyph:"✦",zh:"灵犀量子生命镜像",en:"Lingxi Quantum Life Mirror",leadZh:"在三重镜像中，看见此刻的自己",leadEn:"See yourself now through three mirrors",bodyZh:[
    "三张生命镜像牌，正在等待与你相遇。它们不是孤立的随机答案，而是以你的生命信息为入口，在灵犀场中展开三重映照。",
    "🌙 过往镜像：照见仍在影响此刻的经验、感受与意识痕迹。☀️ 当下镜像：照见你此刻正在经历的状态，以及内在正在回应什么。⭐ 展开镜像：照见从当下延伸出去的可能方向，以及哪些选择正在等待被你看见。",
    "三张镜像彼此连接，呈现的不是一条被写好的路径，而是过去如何进入现在，现在又如何参与下一刻的形成。真正的确认，仍然来自你的真实经历。",
    "看见它们，不是为了提前知道答案。而是在生命继续展开之前，多看见一层自己，也多拥有一次清醒选择的空间。"],bodyEn:[
    "Three Life Mirror cards are waiting to meet you. They are not isolated random answers; your life information becomes an entrance for a threefold reflection within Lingxi Field.",
    "🌙 Past Mirror: what still shapes this moment. ☀️ Present Mirror: what you are living now and what your inner world is answering. ⭐ Unfolding Mirror: possible directions extending from now and choices waiting to be seen.",
    "The three mirrors connect. They do not present a prewritten path, but show how the past enters the present and how the present helps form the next moment. Confirmation still comes from lived experience.",
    "You are not looking to know the answer ahead of time, but to see one more layer of yourself and make room for a clearer choice before life continues to unfold."],timeZh:"补充更具体的降生时刻，可展开更多与时间位置相关的结构层次，让三重镜像之间更细微的连接被进一步照见。",timeEn:"A precise birth time unfolds subtler time-and-position layers, revealing finer connections among the three mirrors.",ctaZh:"与灵犀场连接",ctaEn:"Connect with Lingxi Field"},
  {href:"/qian",no:"08",glyph:"✦",zh:"灵犀生命灵签 · 意识坐标读取",en:"Lingxi Life Oracle · Consciousness Coordinate Reading",leadZh:"看见此刻与你发生回应的三枚生命原型",leadEn:"Meet the three life archetypes responding to you now",bodyZh:[
    "六十四枚生命原型中，会有三枚在此刻与你形成更清晰的连接。灵犀场以你的出生信息作为时间入口，将这组个人坐标映射进 64 枚生命原型库，并从三层结构中展开读取。",
    "源流签：照见你长期携带的背景与底层倾向。灵魂签：照见此刻最值得被看见的核心模式。行者签：照见你正在如何把内在选择带入现实。",
    "真正有意义的，不是单独看某一枚签，而是看三枚原型放在一起之后，彼此之间形成了怎样的呼应。",
    "这些呈现，最终仍会回到你的真实经历中被确认——你正在经历什么、什么反复出现、什么正在发生变化，都会成为理解这组三签的参照。静心片刻，让三枚生命原型自然显现。"],bodyEn:[
    "Among sixty-four life archetypes, three form a clearer connection with you now. Lingxi Field uses your birth information as an entrance through time, maps your coordinates into the archetype library, and reads them through three layers.",
    "Source Sign: the background and underlying tendencies you carry. Soul Sign: the core pattern most ready to be seen now. Wayfarer Sign: how you are bringing inner choices into reality.",
    "Meaning comes not from any one sign alone, but from the resonance formed when all three archetypes are placed together.",
    "These reflections return to your real experience for confirmation: what you are living, what recurs, and what is changing all help you understand the three signs. Be still and let them appear naturally."],timeZh:"补充更具体的降生时刻，可展开更多与时间位置相关的结构层次，让第三层行者签中的细微连接被进一步照见。",timeEn:"A precise birth time unfolds subtler time-and-position layers, revealing finer connections within the third, Wayfarer layer.",ctaZh:"开启我的生命灵签",ctaEn:"Open My Life Oracle"},
  {href:"/archetype",no:"09",glyph:"◎",zh:"生命原型",en:"Life Archetype",leadZh:"让八个场域节点汇入此刻的三重原型",leadEn:"Let eight field nodes converge into your current threefold archetype",bodyZh:[
    "生命原型不是第九份孤立答案，而是八个场域精测节点在此刻形成的汇流。它读取生命图谱、关系共振、韧性、桃花、财富、潮汐、镜像与生命灵签之间正在出现的共同结构。",
    "主原型照见此刻最清晰的驱动力；隐藏原型照见表面安静、内里持续活动的力量；行动原型照见下一步最值得进入现实的选择。",
    "在小程序中，这一结构由哥白尼树突算法形成：每次真实选择激活知识节点，节点之间的联锁与历史场域记录共同构成当前图谱。它不是随机抽取，也不替你预测未来。"],bodyEn:[
    "Life Archetype is not a ninth isolated answer. It is the present convergence of eight Field Insight nodes: Blueprint, Relationship Resonance, Resilience, Romance, Wealth, Tide, Mirror, and Life Oracle.",
    "The Main Archetype reflects the clearest present drive; the Hidden Archetype reveals what remains active beneath the surface; the Action Archetype shows what is most ready to enter reality next.",
    "In the Mini Program, this structure is formed by the Copernican Dendrite Engine: each real response activates knowledge nodes, whose links and prior field records form a current map. It is neither a random draw nor a prediction."],ctaZh:"展开我的生命原型",ctaEn:"Unfold My Life Archetype"},
];

export function getFieldInsight(href: string) {
  return INSIGHTS.find((item) => item.href === href);
}

export default function FieldInsightsSection(){return <section id="field-insights" className="relative overflow-hidden border-t border-white/5 px-5 py-24 sm:px-6 sm:py-36"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(98,214,203,.09),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(193,145,255,.08),transparent_34%)]"/><div className="relative mx-auto max-w-6xl"><header className="mx-auto max-w-3xl text-center"><p className="font-display text-sm uppercase tracking-widest2 text-lattice"><Bi zh="场域精测" en="Field Insights"/></p><h2 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl"><Bi zh="九个入口，同一场生命的回声" en="Nine Entrances into One Living Field"/></h2><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-bone-dim"><Bi zh="选择此刻与你发生回应的入口。这里没有替你定义的结论，只有可以带回真实经历中、由你亲自确认的多维映照。" en="Choose the entrance that responds to you now. Nothing here defines you; each reflection returns to your lived experience for you to recognize and confirm."/></p><div className="mt-7 border border-lattice/25 bg-lattice/[.04] p-5 text-left text-sm leading-7 text-bone-dim"><p className="font-display text-lattice"><Bi zh="双引擎 · 两种观察路径" en="Dual Engines · Two Paths of Observation"/></p><p className="mt-2"><Bi zh="官网场域精测以真实天文与历法数据展开结构演算；微信小程序使用灵犀哥白尼树突算法，让情境中的真实选择激活知识节点并形成联锁。两者互为参照，但不会混算，也不替你预测未来。" en="The website unfolds structural calculations from astronomical and calendrical data. The WeChat Mini Program uses Lingxi’s Copernican Dendrite Engine, where lived choices activate and link knowledge nodes. The two paths can cross-reflect, but are never mixed and do not predict your future."/></p></div></header><div className="mt-16 space-y-7">{INSIGHTS.map((item)=><article key={item.href} className="lx-glass group relative overflow-hidden rounded-sm border border-white/10 p-6 transition duration-500 hover:border-lattice/35 sm:p-9 lg:p-12"><div className="relative grid gap-8 lg:grid-cols-[minmax(220px,.72fr)_1.8fr] lg:gap-14"><div><p className="text-xs uppercase tracking-[.32em] text-bone-mute">FIELD {item.no}</p><div className="mt-5 text-3xl" aria-hidden>{item.glyph}</div><h3 className="mt-4 font-display text-2xl font-light text-bone sm:text-3xl"><Bi zh={item.zh} en={item.en}/></h3><p className="mt-3 font-display text-base leading-7 text-lattice"><Bi zh={item.leadZh} en={item.leadEn}/></p></div><div><div className="space-y-4 text-[15px] leading-8 text-bone-dim sm:text-base">{item.bodyZh.map((zh,i)=><p key={i}><Bi zh={zh} en={item.bodyEn[i]}/></p>)}</div>{item.timeZh&&<div className="mt-6 border-l border-lattice/40 pl-4 text-sm leading-7 text-bone-soft"><p className="font-display text-lattice"><Bi zh="出生日期" en="Birth date"/></p><p className="mt-1"><Bi zh="请选择实际使用的历法：阳历（公历）或农历。两种历法并不相同，通常身份证日期为阳历，知晓是农历的选农历；海外用户一般直接选择阳历。若补充具体出生时刻，图谱可展开更细的时间层次与结构连接。" en="Choose the calendar actually used: Gregorian (solar) or Chinese lunar. They are different systems. Identity-document dates are usually Gregorian; choose lunar only when known. Users outside China can generally choose Gregorian. A specific birth time can reveal finer time layers and structural connections."/></p></div>}<Link href={item.href} className="mt-8 inline-flex items-center gap-3 border border-lattice/40 bg-lattice/5 px-6 py-3 font-display text-sm tracking-wider text-lattice transition hover:border-lattice hover:bg-lattice hover:text-void-deep"><span aria-hidden>✨</span><Bi zh={item.ctaZh} en={item.ctaEn}/><span aria-hidden>→</span></Link>{item.closingZh&&<p className="mt-6 text-sm italic leading-7 text-bone-soft"><Bi zh={item.closingZh} en={item.closingEn||""}/></p>}</div></div></article>)}</div></div></section>}
