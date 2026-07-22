export type ChineseElement = "wood" | "fire" | "earth" | "metal" | "water";

export type SignTier = "origin" | "soul" | "walker";

export type LifeSign = {
  index: number; // 0-63，全局编号
  tier: SignTier; // 源流签(origin,24)/灵魂签(soul,24)/行者签(walker,16)
  tierIndex: number; // 在所属层里的编号，0起
  nameZh: string; nameEn: string;
  keywordsZh: string; keywordsEn: string;
  meaningZh: string; meaningEn: string;
};

// ────────────────────────────────────────────────────────────────────
// 灵犀生命灵签 · 64枚生命原型库
// ────────────────────────────────────────────────────────────────────
// 不是60甲子的另一种叫法——60甲子负责的是"周期计算"，这64枚签，
// 代表的是人类意识里反复出现的64个生命主题（对应《易经》64卦这个
// 传统里"完整生命变化模型"的数字，不是随便选的）。三层各自独立：
// 源流签24枚（对应年柱，"你携带什么进入此生"）、灵魂签24枚（对应
// 日柱，"你的核心意识模式"）、行者签16枚（对应时柱，"你如何创造
// 现实"）——每层是独立的一套象征库，不是同一批签换个名字。
//
// 每一枚的关键词/核心意象，来自产品最初的设计文档；meaningZh/meaningEn
// 这句解读，是照着"具体、给方向、不是空话"这条全站统一标准补写的
// （文档原文只给到关键词和视觉意象，没有给完整解读句）。
const originSigns: Omit<LifeSign, "index" | "tier" | "tierIndex">[] = [
  { nameZh: "星辰守护者", nameEn: "Star Guardian", keywordsZh: "根源 · 保护 · 传承 · 稳定", keywordsEn: "Root · Protection · Lineage · Stability", meaningZh: "你携带而来的，是一种连接过去经验、守护重要事物的能力——很多人绕远路才学到的东西，你天生就带着一部分。", meaningEn: "What you carry is an ability to hold what's important and stay connected to what came before — something many people learn the hard way, you were born already knowing part of." },
  { nameZh: "古老旅人", nameEn: "Ancient Wanderer", keywordsZh: "探索 · 迁徙 · 经验 · 开启", keywordsEn: "Exploration · Migration · Experience · Opening", meaningZh: "你的生命主题来自探索未知——待在同一个地方太久，你会本能地感到不对劲，移动本身就是你补充能量的方式。", meaningEn: "Your life theme is exploring the unknown — staying too long in one place feels instinctively wrong to you; movement itself is how you recharge." },
  { nameZh: "天穹观察者", nameEn: "Sky Watcher", keywordsZh: "洞察 · 智慧 · 觉察 · 远见", keywordsEn: "Insight · Wisdom · Awareness · Foresight", meaningZh: "你天生在找隐藏在表面之下的规律——别人看到的是一件事，你习惯多看一层，看这件事背后是什么在运作。", meaningEn: "You're built to look for the pattern under the surface — where others see one event, you habitually look one layer deeper, at what's actually driving it." },
  { nameZh: "创造火种", nameEn: "Creation Spark", keywordsZh: "创造 · 表达 · 显化 · 灵感", keywordsEn: "Creation · Expression · Manifestation · Inspiration", meaningZh: "你的力量来自创造——闲置太久、只是重复已有的东西，会让你明显失去精神，你需要一个正在从无到有的东西。", meaningEn: "Your power comes from creating — sitting idle too long, only repeating what already exists, visibly drains you. You need something coming into being." },
  { nameZh: "大地守护者", nameEn: "Earth Guardian", keywordsZh: "稳定 · 建设 · 坚韧 · 根基", keywordsEn: "Stability · Building · Resilience · Foundation", meaningZh: "你负责建立能撑得住时间的结构——比起一时惊艳，你更在意这个东西十年后还站不站得住。", meaningEn: "You're built to establish structures that hold up over time — you care less about a dazzling first impression than whether the thing still stands in ten years." },
  { nameZh: "星河连接者", nameEn: "Galaxy Connector", keywordsZh: "连接 · 沟通 · 网络 · 共鸣", keywordsEn: "Connection · Communication · Network · Resonance", meaningZh: "你的生命通过关系展开——一个人闷头做事，跟你真实的运作方式不太一样，你需要跟别人的连接来激活自己。", meaningEn: "Your life unfolds through relationships — working alone in silence isn't quite how you actually operate; connecting with others is what activates you." },
  { nameZh: "月影感知者", nameEn: "Moonshadow Sensor", keywordsZh: "直觉 · 情绪 · 梦境 · 感受", keywordsEn: "Intuition · Emotion · Dreams · Feeling", meaningZh: "你通过感知理解世界——很多判断，你说不清楚逻辑，但事后往往证明是对的，那是因为你的感知先于分析。", meaningEn: "You understand the world through feeling — many of your calls come without a clean logical trail, yet often prove right, because your perception runs ahead of your analysis." },
  { nameZh: "光明传承者", nameEn: "Light Bearer", keywordsZh: "智慧 · 教导 · 分享 · 传递", keywordsEn: "Wisdom · Teaching · Sharing · Transmission", meaningZh: "你携带着传播知识的使命——学到的东西，你会本能地想找人分享，这不只是习惯，是你确认自己学明白了的方式。", meaningEn: "You carry a mission to pass knowledge on — what you learn, you instinctively want to share; it's not just habit, it's how you confirm you've actually understood it." },
  { nameZh: "风之自由者", nameEn: "Free Wind", keywordsZh: "变化 · 自由 · 流动 · 适应", keywordsEn: "Change · Freedom · Flow · Adaptation", meaningZh: "你的成长来自变化——一成不变的日程，会比忙碌本身更消耗你，你需要留一点没被安排死的空间。", meaningEn: "You grow through change — a rigid, unvarying schedule drains you more than actual busyness does; you need some room that isn't fully planned out." },
  { nameZh: "宇宙建造者", nameEn: "Cosmic Builder", keywordsZh: "结构 · 规划 · 创造文明", keywordsEn: "Structure · Planning · Building Civilization", meaningZh: "你擅长把一个想法，一步步变成真实存在的东西——空谈对你没有吸引力，你的成就感来自看得见、摸得着的结果。", meaningEn: "You're skilled at turning an idea into something that actually exists, step by step — talk alone doesn't interest you; your satisfaction comes from tangible results." },
  { nameZh: "灵魂疗愈者", nameEn: "Soul Healer", keywordsZh: "治愈 · 慈悲 · 修复", keywordsEn: "Healing · Compassion · Repair", meaningZh: "你的存在本身，就带着一种恢复的力量——身边的人受伤或者低落的时候，会不自觉地想靠近你，不一定说得出为什么。", meaningEn: "Your presence itself carries a restorative quality — people who are hurting instinctively want to be near you, often without being able to say exactly why." },
  { nameZh: "时间守望者", nameEn: "Time Keeper", keywordsZh: "周期 · 等待 · 积累", keywordsEn: "Cycles · Waiting · Accumulation", meaningZh: "你理解生命有它自己的节奏——知道什么时候该推进、什么时候该等，这份耐心，是你比别人更少内耗的原因。", meaningEn: "You understand that life has its own rhythm — knowing when to push and when to wait is why you burn out less than most." },
  { nameZh: "梦境行者", nameEn: "Dream Walker", keywordsZh: "梦境 · 潜意识 · 想象", keywordsEn: "Dreams · Subconscious · Imagination", meaningZh: "你通过内在世界探索——你的梦境和白日的胡思乱想，往往藏着比现实线索更早的信号。", meaningEn: "You explore through your inner world — your dreams and daydreams often carry signals earlier than anything real-world evidence gives you." },
  { nameZh: "无限探索者", nameEn: "Infinite Explorer", keywordsZh: "未知 · 学习 · 开放", keywordsEn: "The Unknown · Learning · Openness", meaningZh: "你需要永远保持成长——一旦一件事被你完全摸透、不再有新东西可学，兴趣会很快消退，这不是三分钟热度，是你的运作方式。", meaningEn: "You need to keep growing, always — once something is fully mastered and offers nothing new, your interest fades fast. That's not a short attention span, it's how you're wired." },
  { nameZh: "天火觉醒者", nameEn: "Sky Fire Awakener", keywordsZh: "突破 · 热情 · 转化", keywordsEn: "Breakthrough · Passion · Transformation", meaningZh: "旧模式燃烧、新生命诞生——你的成长很少是平缓的，更多是一次次突破式的跃迁，中间的过程可能很剧烈。", meaningEn: "The old burns so the new can be born — your growth rarely happens gradually; it comes in sharp breakthrough leaps, and the process in between can be intense." },
  { nameZh: "水晶记录者", nameEn: "Crystal Recorder", keywordsZh: "记忆 · 信息 · 记录", keywordsEn: "Memory · Information · Record", meaningZh: "你负责保存生命经验——细节，你比大多数人记得更清楚，这份记性，是你判断力的重要来源之一。", meaningEn: "You're built to preserve lived experience — details stay with you more clearly than most people, and that memory is a real source of your judgment." },
  { nameZh: "星空梦想家", nameEn: "Star Dreamer", keywordsZh: "愿景 · 想象 · 希望", keywordsEn: "Vision · Imagination · Hope", meaningZh: "你擅长创造未来的蓝图——一个还不存在的东西，你能先在脑子里把它想清楚，这是很多人做不到的一步。", meaningEn: "You're good at drafting blueprints for what doesn't exist yet — picturing something clearly before it's real is a step most people can't take." },
  { nameZh: "雷霆突破者", nameEn: "Thunder Breaker", keywordsZh: "勇气 · 改变 · 决断", keywordsEn: "Courage · Change · Decisiveness", meaningZh: "你的力量在于打破限制——犹豫对你的消耗，比做错决定还大，你需要的往往不是更多信息，是敢下决定。", meaningEn: "Your power lies in breaking through limits — hesitation costs you more than a wrong call would; what you need is rarely more information, it's the nerve to decide." },
  { nameZh: "和谐调律者", nameEn: "Harmony Tuner", keywordsZh: "平衡 · 调和 · 秩序", keywordsEn: "Balance · Harmony · Order", meaningZh: "你的天赋是寻找内外的平衡点——两个人吵架、两种方案对立，你往往是那个能看到第三条路的人。", meaningEn: "Your gift is finding balance, inside and out — when two people clash or two plans conflict, you're often the one who sees the third option." },
  { nameZh: "银河守门人", nameEn: "Galaxy Gatekeeper", keywordsZh: "边界 · 选择 · 保护", keywordsEn: "Boundary · Choice · Protection", meaningZh: "你掌握着进入新阶段的钥匙——什么该放进你的生活、什么该挡在外面，你的判断比大多数人清楚。", meaningEn: "You hold the key to the next threshold — what to let into your life and what to keep out, your sense of that is clearer than most." },
  { nameZh: "太阳觉醒者", nameEn: "Sun Awakener", keywordsZh: "生命力 · 光明 · 自信", keywordsEn: "Vitality · Light · Confidence", meaningZh: "你的功课是释放自身的光芒——很多时候不是你不够好，是你自己先把光调暗了，等着别人先认可。", meaningEn: "Your work is releasing your own light — often it isn't that you aren't good enough, it's that you dim yourself first, waiting for others' approval before you shine." },
  { nameZh: "混沌创造者", nameEn: "Chaos Creator", keywordsZh: "重构 · 无限可能", keywordsEn: "Reconstruction · Infinite Possibility", meaningZh: "你的能力是从未知里创造出新秩序——混乱不会让你恐慌，反而是你少数几个真正兴奋的场合之一。", meaningEn: "Your ability is building new order out of the unknown — chaos doesn't panic you; it's one of the few situations that genuinely excites you." },
  { nameZh: "虚空探索者", nameEn: "Void Explorer", keywordsZh: "空性 · 深度 · 静默", keywordsEn: "Emptiness · Depth · Stillness", meaningZh: "你需要的是进入更深的意识层——表面的热闹填不满你，真正让你满足的，是安静下来之后碰到的那个更深的东西。", meaningEn: "What you need is to go deeper into consciousness — surface noise doesn't fill you up; what actually satisfies you is what you find once things go quiet." },
  { nameZh: "宇宙源点", nameEn: "Cosmic Origin", keywordsZh: "合一 · 起源 · 回归", keywordsEn: "Unity · Origin · Return", meaningZh: "你的旅程最终指向回到最初的自己——绕了很多路之后，你要找的答案，往往就在你出发的地方。", meaningEn: "Your journey ultimately points back to the self you started as — after all the detours, the answer you're looking for is often right where you began." },
];

const soulSigns: Omit<LifeSign, "index" | "tier" | "tierIndex">[] = [
  { nameZh: "心之疗愈者", nameEn: "Heart Healer", keywordsZh: "爱 · 修复 · 慈悲", keywordsEn: "Love · Repair · Compassion", meaningZh: "你的核心，是让破碎的东西重新连接起来的能力——这不只是对别人，也包括对你自己。", meaningEn: "Your core is an ability to reconnect what's broken — not just for others, but for yourself too." },
  { nameZh: "无限创造者", nameEn: "Infinite Creator", keywordsZh: "创造 · 显化 · 灵感", keywordsEn: "Creation · Manifestation · Inspiration", meaningZh: "你的核心意识总在生成——脑子里冒出来的念头，比你有时间执行的还多，这是天赋，不是杂乱。", meaningEn: "Your core consciousness is always generating — more ideas surface than you have time to act on; that's a gift, not clutter." },
  { nameZh: "镜像觉察者", nameEn: "Mirror Perceiver", keywordsZh: "关系 · 自我认识", keywordsEn: "Relationship · Self-Knowledge", meaningZh: "别人身上让你有强烈反应的地方，往往也在照见你自己——你认识自己的一条重要路径，是透过跟别人的关系。", meaningEn: "What triggers a strong reaction in others often reflects something in you — relationships are one of your main paths to knowing yourself." },
  { nameZh: "静默修行者", nameEn: "Silent Practitioner", keywordsZh: "内省 · 智慧", keywordsEn: "Introspection · Wisdom", meaningZh: "你的答案，很少来自向外问，多半来自安静下来之后，自己跟自己对话。", meaningEn: "Your answers rarely come from asking outward — they come from getting quiet and talking to yourself." },
  { nameZh: "内在太阳", nameEn: "Inner Sun", keywordsZh: "力量 · 自信", keywordsEn: "Power · Confidence", meaningZh: "你的核心力量，不需要靠别人点亮——本来就在你自己身体里，只是有时候你自己先把它调暗了。", meaningEn: "Your core power doesn't need someone else to light it — it's already inside you; sometimes you're the one who dims it first." },
  { nameZh: "灵感编织者", nameEn: "Inspiration Weaver", keywordsZh: "艺术 · 表达", keywordsEn: "Art · Expression", meaningZh: "你擅长把看似不相关的东西，编织成一个新的整体——这份能力用在表达上，会比你自己以为的更有感染力。", meaningEn: "You're skilled at weaving unrelated things into something new — used in expression, this carries more impact than you realize." },
  { nameZh: "意识航海者", nameEn: "Consciousness Navigator", keywordsZh: "方向 · 探索", keywordsEn: "Direction · Exploration", meaningZh: "你不需要地图也能找到方向，靠的是对内在指南针的信任，不是外部的确定性。", meaningEn: "You find direction without a map, trusting an internal compass rather than external certainty." },
  { nameZh: "真理寻找者", nameEn: "Truth Seeker", keywordsZh: "学习 · 洞察", keywordsEn: "Learning · Insight", meaningZh: "你不满足于表面的答案，总想再往下挖一层——这让你学得慢一点，但学到的更扎实。", meaningEn: "You're never satisfied with a surface answer, always digging one layer deeper — it makes you slower to learn, but what you learn sticks." },
  { nameZh: "梦境解码者", nameEn: "Dream Decoder", keywordsZh: "潜意识 · 象征", keywordsEn: "Subconscious · Symbol", meaningZh: "你的梦，比你以为的更值得被认真对待——里面藏着的信息，往往比清醒时的分析更早察觉到什么。", meaningEn: "Your dreams deserve more attention than you give them — they often notice something before your waking analysis does." },
  { nameZh: "情感炼金师", nameEn: "Emotional Alchemist", keywordsZh: "转化 · 成长", keywordsEn: "Transformation · Growth", meaningZh: "你有把最难的情绪，炼成智慧的能力——痛苦对你来说，很少是纯粹的消耗，最终大多变成了理解。", meaningEn: "You can turn the hardest emotions into wisdom — pain, for you, rarely stays pure loss; most of it eventually becomes understanding." },
  { nameZh: "灵魂舞者", nameEn: "Soul Dancer", keywordsZh: "自由 · 快乐", keywordsEn: "Freedom · Joy", meaningZh: "你的生命力，需要一个能自由流动的出口才会真正舒展——被过度规训的生活，会让你明显枯竭。", meaningEn: "Your vitality needs a free-flowing outlet to actually unfold — an overly regimented life visibly drains you." },
  { nameZh: "光之语言者", nameEn: "Speaker of Light", keywordsZh: "表达 · 沟通", keywordsEn: "Expression · Communication", meaningZh: "你说出口的话，常常比你自己以为的更有分量——别人会记住你随口说的一句话很久。", meaningEn: "What you say carries more weight than you realize — people remember your offhand remarks longer than you'd expect." },
  { nameZh: "时间旅行者", nameEn: "Time Traveler", keywordsZh: "过去 · 未来", keywordsEn: "Past · Future", meaningZh: "你对过去和未来的感知，都比大多数人更清晰——活在纯粹的当下，对你反而是需要练习的事。", meaningEn: "Your sense of both past and future runs clearer than most — staying purely in the present is, for you, the thing that takes practice." },
  { nameZh: "空间创造者", nameEn: "Space Creator", keywordsZh: "环境 · 现实", keywordsEn: "Environment · Reality", meaningZh: "你所在的环境，会不知不觉被你重新塑造——你的存在本身，会改变一个空间的气氛。", meaningEn: "Wherever you are gets quietly reshaped by you — your presence alone changes a room's atmosphere." },
  { nameZh: "内在建筑师", nameEn: "Inner Architect", keywordsZh: "规划 · 重塑", keywordsEn: "Planning · Rebuilding", meaningZh: "你天生知道怎么把一堆散乱的东西，搭建成一个结构——混乱交到你手上，会慢慢变得有条理。", meaningEn: "You instinctively know how to build structure out of scattered pieces — chaos handed to you slowly becomes orderly." },
  { nameZh: "无限慈悲者", nameEn: "Infinite Compassion", keywordsZh: "包容 · 爱", keywordsEn: "Tolerance · Love", meaningZh: "你能包容的范围，比你自己以为的更宽——但也要记得，这份包容也应该分一些给自己。", meaningEn: "Your capacity to accept runs wider than you think — but remember to save some of that acceptance for yourself too." },
  { nameZh: "觉醒观察者", nameEn: "Awakened Observer", keywordsZh: "觉知 · 清醒", keywordsEn: "Awareness · Clarity", meaningZh: "你很少被表象轻易带走，总有一部分自己在清醒地看着——这份抽离感，是你的资产，不是冷漠。", meaningEn: "You're rarely swept away by appearances — part of you always stays awake, watching. That distance is an asset, not coldness." },
  { nameZh: "能量平衡者", nameEn: "Energy Balancer", keywordsZh: "稳定 · 调节", keywordsEn: "Stability · Regulation", meaningZh: "你天生知道什么时候该收、什么时候该放——这份分寸感，是你比别人更少崩溃的原因。", meaningEn: "You instinctively know when to hold back and when to let go — that sense of proportion is why you break down less often than most." },
  { nameZh: "生命歌者", nameEn: "Life Singer", keywordsZh: "频率 · 共振", keywordsEn: "Frequency · Resonance", meaningZh: "你的存在本身，会让周围的频率不自觉地跟着调整——你走进一个房间，气氛会变。", meaningEn: "Your presence alone shifts the frequency around you — walk into a room, and the mood changes." },
  { nameZh: "灵魂炼金者", nameEn: "Soul Alchemist", keywordsZh: "转化 · 蜕变", keywordsEn: "Transformation · Metamorphosis", meaningZh: "你不怕经历蜕变，因为你隐约知道蜕变之后是什么样子——这份笃定，让你比别人更敢往前走一步。", meaningEn: "You aren't afraid of transformation, because part of you already senses what's on the other side — that certainty lets you step forward when others hesitate." },
  { nameZh: "星辰导师", nameEn: "Star Guide", keywordsZh: "引导 · 智慧", keywordsEn: "Guidance · Wisdom", meaningZh: "你说的话，常常在别人需要的那一刻，正好点亮一条路——这不是刻意为之，是你的自然状态。", meaningEn: "What you say often lights a path right when someone needs it — not by design, just your natural state." },
  { nameZh: "纯净初心者", nameEn: "Pure Beginner", keywordsZh: "简单 · 新生", keywordsEn: "Simplicity · Renewal", meaningZh: "你保留着一种不被过度复杂化的能力——这在见识过很多事情之后，反而是很稀有的东西。", meaningEn: "You've kept a kind of simplicity that resists over-complication — after seeing a lot of the world, that's actually rare." },
  { nameZh: "合一觉知者", nameEn: "Unity Perceiver", keywordsZh: "连接 · 完整", keywordsEn: "Connection · Wholeness", meaningZh: "你天生能看到事物之间的连接，不只是看到孤立的部分——这让你更容易看到别人看不到的全貌。", meaningEn: "You naturally see how things connect, not just isolated pieces — which lets you see a bigger picture others miss." },
  { nameZh: "永恒见证者", nameEn: "Eternal Witness", keywordsZh: "观察 · 存在", keywordsEn: "Observation · Presence", meaningZh: "你不急着评判，先愿意如实看见——这份耐心，是很多关系里最缺、也最珍贵的东西。", meaningEn: "You don't rush to judge — you're willing to see clearly first. That patience is what's most missing, and most valuable, in a lot of relationships." },
];

const walkerSigns: Omit<LifeSign, "index" | "tier" | "tierIndex">[] = [
  { nameZh: "风之行者", nameEn: "Wind Walker", keywordsZh: "变化 · 自由", keywordsEn: "Change · Freedom", meaningZh: "你行动的方式，是先感受风向，再决定怎么走——硬按计划表推进，反而不是你最有效的状态。", meaningEn: "You act by sensing the wind first, then deciding how to move — forcing yourself to follow a rigid plan isn't actually your most effective mode." },
  { nameZh: "大地建造者", nameEn: "Earth Builder", keywordsZh: "事业 · 结构", keywordsEn: "Career · Structure", meaningZh: "你更适合把事情做扎实，而不是做快——长期积累出来的东西，才是你真正的护城河。", meaningEn: "You're better suited to building things solidly than quickly — what accumulates over time is your real moat." },
  { nameZh: "光之传播者", nameEn: "Light Spreader", keywordsZh: "影响 · 分享", keywordsEn: "Influence · Sharing", meaningZh: "你的影响力，是通过分享，不是通过说服——你越是自然地分享，反而越有说服力。", meaningEn: "Your influence comes from sharing, not persuading — the more naturally you share, the more persuasive you actually become." },
  { nameZh: "宇宙连接者", nameEn: "Cosmic Connector", keywordsZh: "合作 · 网络", keywordsEn: "Collaboration · Network", meaningZh: "你的力量，在跟别人连接起来之后才真正放大——单打独斗，你能做到的比合作时明显少。", meaningEn: "Your power really amplifies once you connect with others — working alone, you accomplish visibly less than when you collaborate." },
  { nameZh: "火焰行动者", nameEn: "Flame Actor", keywordsZh: "行动 · 勇气", keywordsEn: "Action · Courage", meaningZh: "你需要的不是更多计划，是敢在还不确定的时候先动——完美的时机，往往是等不到的。", meaningEn: "What you need isn't more planning — it's the courage to move before things are certain. The perfect moment usually never arrives." },
  { nameZh: "水流创造者", nameEn: "Flow Creator", keywordsZh: "适应 · 流动", keywordsEn: "Adaptation · Flow", meaningZh: "你创造的方式，是顺着阻力最小的路径走，不是硬闯——这不是妥协，是效率。", meaningEn: "You create by following the path of least resistance, not by forcing through — that's not compromise, it's efficiency." },
  { nameZh: "智慧战略家", nameEn: "Wise Strategist", keywordsZh: "计划 · 判断", keywordsEn: "Planning · Judgment", meaningZh: "你行动之前，习惯先在脑子里走完全局——这让你出手比别人晚一点，但很少走错方向。", meaningEn: "You habitually run the whole scenario in your head before acting — it makes you slower to start, but rarely wrong in direction." },
  { nameZh: "梦想实现者", nameEn: "Dream Fulfiller", keywordsZh: "目标 · 显化", keywordsEn: "Goal · Manifestation", meaningZh: "你擅长的，是把一个模糊的愿望，拆成看得见的步骤——这份拆解能力，是很多人缺的那一环。", meaningEn: "You're skilled at breaking a vague wish into visible steps — that ability to break things down is the missing link for a lot of people." },
  { nameZh: "关系编织者", nameEn: "Relationship Weaver", keywordsZh: "伙伴 · 联盟", keywordsEn: "Partnership · Alliance", meaningZh: "你创造现实的方式，很大程度上要靠别人一起完成——找对伙伴，比自己埋头苦干重要得多。", meaningEn: "How you create reality depends a great deal on doing it with others — finding the right partner matters more than grinding alone." },
  { nameZh: "财富创造者", nameEn: "Wealth Creator", keywordsZh: "价值 · 丰盛", keywordsEn: "Value · Abundance", meaningZh: "你对「什么东西值钱」这件事，有一种天生的敏感——这份直觉，值得被认真训练，不只是靠感觉。", meaningEn: "You have a natural sense for what carries value — that instinct is worth training deliberately, not just following on feel." },
  { nameZh: "秩序建立者", nameEn: "Order Builder", keywordsZh: "规则 · 系统", keywordsEn: "Rules · Systems", meaningZh: "你负责把混乱的东西，变成一套能重复运作的系统——这份能力，会让你天然适合搭建长期的东西。", meaningEn: "You're built to turn chaos into a system that runs repeatedly — this makes you naturally suited to building things meant to last." },
  { nameZh: "转化引导者", nameEn: "Transformation Guide", keywordsZh: "改变 · 新生", keywordsEn: "Change · Renewal", meaningZh: "你擅长的，是带着别人，一起穿过一次真正的改变——这需要你自己先经历过，才带得动别人。", meaningEn: "You're skilled at leading others through real change — but that only works because you've genuinely been through it yourself first." },
  { nameZh: "未来探索者", nameEn: "Future Explorer", keywordsZh: "创新 · 科技", keywordsEn: "Innovation · Technology", meaningZh: "你对还没被验证过的新东西，天生比别人更少恐惧——这让你经常比大多数人更早看到下一个风口。", meaningEn: "You have less instinctive fear of the unproven than most — which is why you often spot the next shift before others do." },
  { nameZh: "生命疗愈者", nameEn: "Life Healer", keywordsZh: "恢复 · 平衡", keywordsEn: "Recovery · Balance", meaningZh: "你行动的方向，常常是先把耗损的部分补回来，再往前走——这不是拖延，是你真正可持续的节奏。", meaningEn: "You tend to move by first restoring what's been depleted, then pushing forward — that's not stalling, it's your actual sustainable pace." },
  { nameZh: "无限旅程者", nameEn: "Infinite Journeyer", keywordsZh: "道路 · 成长", keywordsEn: "Path · Growth", meaningZh: "对你来说，路本身就是目的地的一部分——太早到达终点，反而会让你觉得若有所失。", meaningEn: "For you, the road itself is part of the destination — arriving too soon can leave you feeling something's missing." },
  { nameZh: "宇宙显化者", nameEn: "Cosmic Manifester", keywordsZh: "创造 · 合一", keywordsEn: "Creation · Unity", meaningZh: "你创造现实的方式，是让内在和外在最终对齐成同一件事——想的、说的、做的越一致，你的力量越大。", meaningEn: "You create reality by aligning the inner and outer into one thing — the more your thoughts, words, and actions match, the more power you carry." },
];

function attachIndex(list: Omit<LifeSign, "index" | "tier" | "tierIndex">[], tier: SignTier, startIndex: number): LifeSign[] {
  return list.map((s, i) => ({ ...s, index: startIndex + i, tier, tierIndex: i }));
}

// 64枚生命原型签，全局编号0-63：0-23源流签、24-47灵魂签、48-63行者签
export const LIFE_SIGNS: LifeSign[] = [
  ...attachIndex(originSigns, "origin", 0),
  ...attachIndex(soulSigns, "soul", 24),
  ...attachIndex(walkerSigns, "walker", 48),
];

export const ORIGIN_SIGNS = LIFE_SIGNS.filter((s) => s.tier === "origin");
export const SOUL_SIGNS = LIFE_SIGNS.filter((s) => s.tier === "soul");
export const WALKER_SIGNS = LIFE_SIGNS.filter((s) => s.tier === "walker");

// 三个位置各自的"签"标签——年柱对应源流签、日柱对应灵魂签、时柱对应行者签
export const TIER_LABELS: Record<SignTier, { zh: string; en: string; sub: string; subEn: string }> = {
  origin: { zh: "源流签", en: "Origin Sign", sub: "对应年柱 · 你携带什么进入此生", subEn: "Year Pillar · What you carry into this life" },
  soul: { zh: "灵魂签", en: "Soul Sign", sub: "对应日柱 · 你的核心意识模式", subEn: "Day Pillar · Your core pattern of mind" },
  walker: { zh: "行者签", en: "Walker Sign", sub: "对应时柱 · 你如何创造现实", subEn: "Hour Pillar · How you shape reality" },
};
