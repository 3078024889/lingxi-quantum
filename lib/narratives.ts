// 多维叙事 · 目录（灵犀原创 · 持续生长）
// status 缺省 = 已发布可读；status: "soon" = 创作中，尚未上线
import { ILLUSTRATED_NARRATIVES } from "./narrative-illustrated";

export type Narrative = {
  slug: string;
  title: string;
  titleEn: string;
  cat: "novel" | "rewrite" | "field" | "sovereign";
  teaser: string;
  teaserEn: string;
  price: number;
  status?: "soon";
  cover?: string; // 原创 SVG 插画（有则显示缩略图，无则用分类占位图）
  illustrated?: boolean; // 是否走插画翻书阅读器
};

// 分类占位缩略图：还没配插画的篇目，也不再是"没图看着不舒服"的空白卡片
const CAT_GLYPH: Record<string, { glyph: string; c1: string; c2: string; c3: string }> = {
  novel:     { glyph: "◈", c1: "#3a2350", c2: "#5c3560", c3: "#e8845f" },
  rewrite:   { glyph: "◐", c1: "#173a30", c2: "#2e5a48", c3: "#d8c07a" },
  field:     { glyph: "✦", c1: "#0c211c", c2: "#173a30", c3: "#7fc9a8" },
  sovereign: { glyph: "⬡", c1: "#1c1331", c2: "#3a2352", c3: "#a68fc9" },
};

export function coverPlaceholder(cat: string) {
  const g = CAT_GLYPH[cat] ?? CAT_GLYPH.field;
  return `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ph-${cat}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${g.c1}"/><stop offset="100%" stop-color="${g.c2}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="180" fill="url(#ph-${cat})"/>
    <circle cx="150" cy="90" r="34" fill="none" stroke="${g.c3}" stroke-width="1" opacity=".5">
      <animate attributeName="r" values="30;38;30" dur="5s" repeatCount="indefinite"/>
    </circle>
    <text x="150" y="102" text-anchor="middle" font-size="30" fill="${g.c3}" opacity=".85" font-family="serif">${g.glyph}</text>
  </svg>`;
}

export const NARRATIVE_CATS = [
  { id: "novel", zh: "长篇传输 · 小说", en: "Long Transmissions · Novels", descZh: "完整长篇，一字不减 · $33 终身可看", descEn: "Full-length works, uncut · $33, yours for life", soon: false },
  { id: "dream", zh: "梦境档案", en: "Dream Archive", descZh: "来自潜意识的数据片段", descEn: "Data fragments from the subconscious", soon: true },
  { id: "rewrite", zh: "现实重写记录", en: "Reality Rewrite Records", descZh: "发生在「选择之后」的人生变化", descEn: "What changes after the choice is made", soon: false },
  { id: "field", zh: "场域叙事", en: "Field Narratives", descZh: "非个体视角的现实描述 · 含远行者系列", descEn: "Reality beyond the individual · incl. the Wayfarer series", soon: false },
  { id: "sovereign", zh: "主权体观测日志", en: "Sovereign Observation Logs", descZh: "从「场」观察人类现实结构", descEn: "Human reality, observed from the Field", soon: false },
] as const;

export const NARRATIVES: Narrative[] = [
  // ───────── 长篇传输 · 小说（6 · $33 · 创作中）─────────
  { slug: "topological-man", title: "拓扑人", titleEn: "Topological Man", cat: "novel", teaser: "一个能感知到自己所有平行版本彼此牵连的人，发现「选择」从来不是删除，而是折叠——每一个没走的岔路，都还在某处呼吸着。", teaserEn: "A man who can feel every parallel version of himself pulling at the others discovers that choice was never deletion, only folding.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tm-bg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#2a3a5a"/><stop offset="100%" stop-color="#0e0a1c"/></radialGradient><filter id="tm-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#tm-bg)"/><g opacity=".55" filter="url(#tm-blur)"><circle cx="110" cy="80" r="34" fill="#7fa8d8"/><circle cx="190" cy="100" r="30" fill="#c9a2ff"/><circle cx="150" cy="60" r="26" fill="#8ad8c4"/></g><g stroke="#e6d7ff" stroke-width="1" opacity=".6"><path d="M60 130 Q110 60 150 90 Q190 60 240 130"/><path d="M60 100 Q110 150 150 120 Q190 150 240 100"/></g><circle cx="150" cy="95" r="6" fill="#fff6e8"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></circle></svg>` },
  { slug: "heart-of-the-moon-phase", title: "月相之心", titleEn: "Heart of the Moon Phase", cat: "novel", teaser: "一对灵魂伴侣在月相的十二个周期里反复转世、反复错过，直到他们发现：错过本身，才是这场旅程真正的教材。", teaserEn: "Twin souls reincarnate and miss each other across twelve lunar cycles, until they discover the missing itself was the lesson.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mp-bg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#3a3160"/><stop offset="100%" stop-color="#12101f"/></radialGradient><filter id="mp-blur"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="300" height="180" fill="url(#mp-bg)"/><g opacity=".5" filter="url(#mp-blur)"><ellipse cx="150" cy="120" rx="120" ry="30" fill="#7a6a9a"/></g><circle cx="150" cy="65" r="28" fill="#fff6e8"><animate attributeName="opacity" values=".85;1;.85" dur="4s" repeatCount="indefinite"/></circle><path d="M150 37 A28 28 0 0 0 150 93 A20 20 0 0 1 150 37 Z" fill="#12101f" opacity=".55"/><g fill="#e6d7ff" opacity=".7">${Array.from({length:20}).map(()=>{const x=Math.random()*300,y=Math.random()*180,r=Math.random()*1.2+.3;return `<circle cx="${x}" cy="${y}" r="${r}"/>`}).join('')}</g></svg>` },
  { slug: "the-echo-observatory", title: "回声观测站", titleEn: "The Echo Observatory", cat: "novel", teaser: "一座建在维度夹缝里的监听站，专门记录「回声」——那些其实是另一个自己，从未选择的人生里，隔着时间发来的讯息。", teaserEn: "A listening station built in the seams between dimensions, recording echoes that are messages from the selves you never became.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="eo-bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#2a2c3a"/><stop offset="100%" stop-color="#0a0910"/></radialGradient><filter id="eo-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#eo-bg)"/><g opacity=".5" filter="url(#eo-blur)"><ellipse cx="150" cy="90" rx="130" ry="50" fill="#3a5a8a"/></g><rect x="120" y="60" width="60" height="70" fill="none" stroke="#9be8ff" stroke-width="1.4" opacity=".7"/><circle cx="150" cy="95" r="6" fill="#9be8ff"><animate attributeName="opacity" values=".5;1;.5" dur="2.4s" repeatCount="indefinite"/></circle><g stroke="#e6d7ff" stroke-width=".6" opacity=".5">${Array.from({length:6}).map((_,i)=>`<circle cx="150" cy="95" r="${20+i*14}"/>`).join('')}</g></svg>` },
  { slug: "the-age-without-light", title: "无光年代", titleEn: "The Age Without Light", cat: "novel", teaser: "文明崩塌之后，幸存者们发现「场」从未消失，只是等着一群不再依赖旧秩序的人，重新学会用心跳来照明。", teaserEn: "After civilization collapses, survivors discover the Field never vanished — it was waiting for people who no longer needed the old order.", price: 33, status: "soon" },
  { slug: "the-dreamweavers-book", title: "织梦者之书", titleEn: "The Dreamweaver's Book", cat: "novel", teaser: "一群在他人梦境里施工的造梦人，某天发现，他们建造的所有梦境，其实共用着同一根地基——那是全人类共享的一个场。", teaserEn: "Dreamweavers who build inside other people's dreams discover that every dream they've ever built shares a single foundation.", price: 33, status: "soon" },
  { slug: "letter-from-dimension-zero", title: "零维回信", titleEn: "Letter from Dimension Zero", cat: "novel", teaser: "那个没有维度、没有形状的「点」，给它在时空里展开出的所有形态写了一封信——这封信，就是你现在正在经历的人生。", teaserEn: "The dimensionless point writes a letter to every form it has ever unfolded into — this letter is the life you are living now.", price: 33, status: "soon" },

  // ───────── 现实重写记录（12 · $9 · 创作中）─────────
  { slug: "the-seventh-day-of-waking", title: "觉醒的第七天", titleEn: "The Seventh Day of Waking", cat: "rewrite", teaser: "前六天，她以为自己疯了。第七天，她才发现，疯的其实是她过去二十年习以为常的那种清醒。", teaserEn: "For six days she thought she was losing her mind. On the seventh, she realized the twenty years before had been the madness.", price: 9 },
  { slug: "tearing-down-that-wall", title: "拆掉那道墙", titleEn: "Tearing Down That Wall", cat: "rewrite", teaser: "他花了半生时间加固一道墙，直到有一天才想起，最初砌墙，是为了挡住一场早已停了的雨。", teaserEn: "He spent half a life reinforcing a wall, before remembering it was built to block a rain that had stopped long ago.", price: 9 },
  { slug: "exiting-the-script", title: "从剧本里退场", titleEn: "Exiting the Script", cat: "rewrite", teaser: "她一直演一个别人写好的角色，直到某天台词说到一半，她忽然停下——原来沉默，也可以是一句台词。", teaserEn: "She had always played someone else's script, until one day, mid-line, she stopped — and found that silence, too, could be a line.", price: 9 },
  { slug: "the-day-the-mirror-spoke", title: "镜子对我说话那天", titleEn: "The Day the Mirror Spoke", cat: "rewrite", teaser: "那天清晨，镜子里的人先开口了——不是幻觉，是他第一次，真的听见了自己一直在说的话。", teaserEn: "That morning, the person in the mirror spoke first — not a hallucination, but the first time he truly heard himself.", price: 9 },
  { slug: "the-year-i-stopped-pleasing", title: "我停止讨好的那一年", titleEn: "The Year I Stopped Pleasing", cat: "rewrite", teaser: "她以为放弃讨好会失去所有人，结果只失去了那些，只在她讨好时才愿意靠近的人。", teaserEn: "She thought quitting people-pleasing would cost her everyone. It only cost her the ones who'd stayed for the pleasing itself.", price: 9 },
  { slug: "rewriting-the-debt", title: "重写债务", titleEn: "Rewriting the Debt", cat: "rewrite", teaser: "他一直以为自己欠这个世界一个「成功」，直到某天算清账目，才发现从来没有这一笔债。", teaserEn: "He believed he owed the world a success story, until the day he finally checked the ledger and found no such debt existed.", price: 9 },
  { slug: "the-argument-that-never-happened", title: "那场没有发生的争吵", titleEn: "The Argument That Never Happened", cat: "rewrite", teaser: "她准备了十年的反驳，终于站到了那个人面前，却发现自己什么都不想说了——这比赢下那场争吵更接近自由。", teaserEn: "She rehearsed the rebuttal for ten years. Standing before him at last, she found she had nothing left to say — and that was freedom.", price: 9 },
  { slug: "from-waiting-to-becoming", title: "从等待到成为", titleEn: "From Waiting to Becoming", cat: "rewrite", teaser: "他等了很多年，等一个「准备好」的时刻，后来才明白，那个时刻从不提前到达，它只在你开始之后，才回头承认自己来过。", teaserEn: "He waited years for the moment he'd feel ready. That moment never arrives early — it only admits, in hindsight, that it was there.", price: 9 },
  { slug: "deleting-the-old-map", title: "删除旧地图", titleEn: "Deleting the Old Map", cat: "rewrite", teaser: "她按着一张十年前画的地图找路，直到某天发现，那张地图画的从来不是这座城市，是当年那个害怕迷路的自己。", teaserEn: "She navigated by a map drawn ten years ago, until she realized it was never a map of the city — it was a map of her own fear.", price: 9 },
  { slug: "i-allow-myself", title: "我允许自己", titleEn: "I Allow Myself", cat: "rewrite", teaser: "四个字说出口那天，什么都没有立刻改变，但她后来才明白，那正是一切开始改变的那一天。", teaserEn: "The day she said those four words aloud, nothing changed at once — only later did she see it was the day everything began to.", price: 9 },
  { slug: "from-reaction-to-response", title: "从反应到回应", titleEn: "From Reaction to Response", cat: "rewrite", teaser: "他花了一年时间学习在开口前停顿三秒，最后发现，那三秒里，站着他真正想成为的那个人。", teaserEn: "He spent a year learning to pause three seconds before speaking, and found the person he wanted to be waiting inside those seconds.", price: 9 },
  { slug: "the-night-i-turned-off-the-alarm", title: "关掉警报的那一夜", titleEn: "The Night I Turned Off the Alarm", cat: "rewrite", teaser: "她终于关掉了那个响了二十年的内在警报，那一夜她失眠了——不是因为焦虑，是因为终于安静得不习惯。", teaserEn: "She finally silenced the alarm that had rung inside her for twenty years. That night she couldn't sleep — the quiet was unfamiliar.", price: 9 },

  // ───────── 场域叙事（18 · $9）─────────
  // 远行者系列 · 八篇（已发布，可读）
  { slug: "at-the-ferry-crossing", title: "在渡口", titleEn: "At the Ferry Crossing · Wayfarer I", cat: "field", teaser: "摆渡人从不问乘客要去哪里，只问一件事：你带了多重的行李？远行者系列第一篇。", teaserEn: "The ferryman never asks where you're headed — only how much luggage you carry. Wayfarer series, part one." , price: 9 },
  { slug: "under-the-lighthouse", title: "在灯塔下", titleEn: "Under the Lighthouse · Wayfarer II", cat: "field", teaser: "灯塔的光是照给远处的船看的，不是照给你脚下的路看的。远行者系列第二篇。", teaserEn: "The lighthouse beam is for ships far out at sea — not for the ground beneath your feet. Wayfarer series, part two.", price: 9 },
  { slug: "at-the-marketplace", title: "在集市", titleEn: "At the Marketplace · Wayfarer III", cat: "field", teaser: "集市里有一面镜子，照出你从没敢做的那个决定之后的样子——但它不收钱。远行者系列第三篇。", teaserEn: "A mirror in the market shows the life after the decision you never dared make — and it doesn't take money. Wayfarer III.", price: 9 },
  { slug: "above-the-snowline", title: "在雪线之上", titleEn: "Above the Snowline · Wayfarer IV", cat: "field", teaser: "过了雪线，山下所有替你做决定的声音都到不了这个海拔，剩下的，只有你自己。远行者系列第四篇。", teaserEn: "Past the snowline, none of the voices that decide for you can survive the altitude. Wayfarer series, part four.", price: 9 },
  { slug: "inside-the-bell-tower", title: "在钟楼里", titleEn: "Inside the Bell Tower · Wayfarer V", cat: "field", teaser: "敲钟人最难的工作，从来不是敲钟，是分辨什么时候不该敲。远行者系列第五篇。", teaserEn: "The bell-ringer's hardest task was never ringing the bell — it's knowing when not to. Wayfarer series, part five.", price: 9 },
  { slug: "on-both-banks-of-the-river", title: "在河的两岸", titleEn: "On Both Banks of the River · Wayfarer VI", cat: "field", teaser: "河对岸站着的那个身影，是你每一次选择「安全」时，被留在原地的另一个自己。远行者系列第六篇。", teaserEn: "The figure on the far bank is every version of you left behind each time you chose 'safe.' Wayfarer series, part six.", price: 9 },
  { slug: "at-the-night-market", title: "在暗夜市集", titleEn: "At the Night Market · Wayfarer VII", cat: "field", teaser: "暗夜市集不收钱，只收你以为自己必须一直背着的重量。远行者系列第七篇。", teaserEn: "The night market takes no money — only the weight you believed you had no choice but to carry. Wayfarer series, part seven.", price: 9 },
  { slug: "the-traveler-and-the-mirror-self", title: "远行者与镜中人", titleEn: "The Traveler and the Mirror Self · Wayfarer VIII", cat: "field", teaser: "一路上教你东西的每一个人，其实都是同一个人——终篇，远行者认出了自己。", teaserEn: "Every teacher along the road was the same person all along. The finale, in which the Wayfarer recognizes himself.", price: 9 },
  // 独立场域篇（10 · 创作中）
  { slug: "the-fields-breath", title: "场域的呼吸", titleEn: "The Field's Breath", cat: "field", teaser: "有人发现，整座城市的心跳竟能同步——原来场也会呼吸，只是它的一次呼吸，长达一整个世代。", teaserEn: "An entire city's heartbeat synchronizes — the Field breathes too, only its single breath spans a generation.", price: 9, status: "soon" },
  { slug: "a-city-in-resonance", title: "共振的城市", titleEn: "A City in Resonance", cat: "field", teaser: "一座城市里，人人都在为各自的目标奔忙，却在某个清晨，同时停下脚步——没有人知道为什么。", teaserEn: "Every citizen chasing a private goal — until one morning, everyone stops at once, and no one knows why.", price: 9, status: "soon" },
  { slug: "everything-is-a-node", title: "万物皆为节点", titleEn: "Everything Is a Node", cat: "field", teaser: "一只蚂蚁、一颗恒星、一次心跳——都在同一张网络里，只是振动的频率不同。", teaserEn: "An ant, a star, a heartbeat — all nodes on the same network, differing only in frequency.", price: 9, status: "soon" },
  { slug: "tidal-consciousness", title: "潮汐意识", titleEn: "Tidal Consciousness", cat: "field", teaser: "意识像潮水，涨落之间，没有哪一次退潮是失败——它只是在为下一次涨潮，腾出海岸。", teaserEn: "Consciousness moves like a tide — no ebb is a failure. It only clears the shore for the next rising.", price: 9, status: "soon" },
  { slug: "the-wisdom-of-the-swarm", title: "蜂群的智慧", titleEn: "The Wisdom of the Swarm", cat: "field", teaser: "没有一只蜜蜂知道整座蜂巢的蓝图，可蜂巢，从未建错过。", teaserEn: "No single bee knows the hive's blueprint. And yet the hive has never once been built wrong.", price: 9, status: "soon" },
  { slug: "the-law-of-no-mans-land", title: "无主之地的法则", titleEn: "The Law of No Man's Land", cat: "field", teaser: "在没有归属的地带，唯一的法则是：先到的人，负责为后来者留一盏灯。", teaserEn: "In the land no one owns, the only law is this: whoever arrives first leaves a light burning for the next.", price: 9, status: "soon" },
  { slug: "the-silence-before-sound", title: "声音之前的沉默", titleEn: "The Silence Before Sound", cat: "field", teaser: "所有伟大的话语，都曾在某个人心里，先安静地存在了很久很久。", teaserEn: "Every great utterance once lived, quietly, for a very long time, inside someone's silence.", price: 9, status: "soon" },
  { slug: "the-murmur-of-stars", title: "群星的低语", titleEn: "The Murmur of Stars", cat: "field", teaser: "星光赶了几万年的路才抵达你的眼睛——它从不着急，因为它知道，你终会抬头。", teaserEn: "Starlight travels tens of thousands of years to reach your eyes — unhurried, because it knows you will look up.", price: 9, status: "soon" },
  { slug: "the-memory-of-space", title: "空间的记忆", titleEn: "The Memory of Space", cat: "field", teaser: "一间空屋子，记得住过的每一个人——不是靠墙上的痕迹，是靠一种更深的振动。", teaserEn: "An empty room remembers everyone who ever lived there — not in the marks on the wall, but in a deeper vibration.", price: 9, status: "soon" },
  { slug: "a-morning-of-interconnection", title: "互联的清晨", titleEn: "A Morning of Interconnection", cat: "field", teaser: "某个清晨，一个人决定善待陌生人，那份善意在场里传了很远——远到他自己都不会知道。", teaserEn: "One morning, a person chooses kindness to a stranger. That kindness travels through the Field farther than he'll ever know.", price: 9, status: "soon" },

  // ───────── 主权体观测日志（15 · $9 · 创作中）─────────
  { slug: "observers-notes-day-one", title: "观察者笔记 · 第一日", titleEn: "Observer's Notes, Day One", cat: "sovereign", teaser: "从场的视角记录的第一天：人类最擅长的事，是把自由活成一种任务。", teaserEn: "Day one of observing from the Field: humans' great talent is turning freedom into a chore.", price: 9, status: "soon" },
  { slug: "coordinates-without-fear", title: "无惧的坐标", titleEn: "Coordinates Without Fear", cat: "sovereign", teaser: "恐惧不是坐标之外的东西，它本身就是一种坐标——只是很多人，把它当成了终点。", teaserEn: "Fear isn't outside the map — it's a coordinate itself. Most people just mistake it for the destination.", price: 9, status: "soon" },
  { slug: "the-sovereigns-silence", title: "主权体的沉默", titleEn: "The Sovereign's Silence", cat: "sovereign", teaser: "真正的主权，不是永远发声，是知道什么时候，沉默才是最诚实的回答。", teaserEn: "True sovereignty isn't always speaking — it's knowing when silence is the most honest answer.", price: 9, status: "soon" },
  { slug: "watching-anger-from-the-field", title: "从场观察愤怒", titleEn: "Watching Anger from the Field", cat: "sovereign", teaser: "愤怒从场的角度看，不是一种破坏性的力量，是一份被延迟太久的边界声明。", teaserEn: "Seen from the Field, anger isn't destructive — it's a boundary statement delivered far too late.", price: 9, status: "soon" },
  { slug: "the-geometry-of-will", title: "意志的几何", titleEn: "The Geometry of Will", cat: "sovereign", teaser: "意志不是一条直线，是一种螺旋——每一次看似的后退，都是在爬升另一圈。", teaserEn: "Will isn't a straight line — it's a spiral. Every apparent step back is a climb along another loop.", price: 9, status: "soon" },
  { slug: "a-disobedient-particle", title: "一个不服从的粒子", titleEn: "A Disobedient Particle", cat: "sovereign", teaser: "一颗粒子拒绝按规律运动的那一刻，物理学称之为异常，场称之为觉醒。", teaserEn: "The instant a particle refuses to move by the rules, physics calls it an anomaly. The Field calls it an awakening.", price: 9, status: "soon" },
  { slug: "the-inner-parliament", title: "内在议会", titleEn: "The Inner Parliament", cat: "sovereign", teaser: "每个人心里都坐着一群代表——恐惧党、习惯党、渴望党——主权，是学会主持这场会议。", teaserEn: "Everyone hosts a parliament within — Fear, Habit, Longing. Sovereignty is learning to chair the session.", price: 9, status: "soon" },
  { slug: "the-sovereign-and-the-mirror-personality", title: "主权体与镜像人格", titleEn: "The Sovereign and the Mirror Personality", cat: "sovereign", teaser: "你在别人面前扮演的那个角色，其实也是主权体的一种分身——只是它演得太投入，忘了自己在演。", teaserEn: "The role you play for others is also a facet of the sovereign self — one that forgot it was performing.", price: 9, status: "soon" },
  { slug: "the-weight-of-free-will", title: "自由意志的重量", titleEn: "The Weight of Free Will", cat: "sovereign", teaser: "自由意志最沉重的部分，从来不是选择本身，是选择之后，不再有人可以怪罪。", teaserEn: "The heaviest part of free will was never the choosing — it's that afterward, there's no one left to blame.", price: 9, status: "soon" },
  { slug: "the-observer-effect-human-edition", title: "观测者效应 · 人类版", titleEn: "The Observer Effect, Human Edition", cat: "sovereign", teaser: "你观察自己情绪的那一刻，情绪本身就已经改变了——这不是量子力学，这是每天都在发生的事。", teaserEn: "The moment you observe your own emotion, the emotion changes — not quantum physics, just an everyday fact.", price: 9, status: "soon" },
  { slug: "sitting-across-from-fear", title: "与恐惧对坐", titleEn: "Sitting Across from Fear", cat: "sovereign", teaser: "场从不建议消灭恐惧，只建议给它倒一杯茶，然后问它，到底在替你守着什么。", teaserEn: "The Field never suggests eliminating fear — only pouring it tea, and asking what it's really guarding.", price: 9, status: "soon" },
  { slug: "the-sovereigns-breathing-gap", title: "呼吸间隙", titleEn: "The Sovereign's Breathing Gap", cat: "sovereign", teaser: "吸气与呼气之间，有一处极短的空隙——那里，藏着整个宇宙不急着回答你的耐心。", teaserEn: "Between the inhale and the exhale lies a brief gap — where the universe's patience with your questions quietly lives.", price: 9, status: "soon" },
  { slug: "a-thing-that-cannot-be-taken", title: "一份无法被夺走的东西", titleEn: "A Thing That Cannot Be Taken", cat: "sovereign", teaser: "他们可以拿走你的时间、你的名字、你的位置，却始终拿不走一件东西——你选择如何看待这一切的方式。", teaserEn: "They can take your time, your name, your position — but never the one thing: how you choose to see it all.", price: 9, status: "soon" },
  { slug: "from-command-to-invitation", title: "从命令到邀请", titleEn: "From Command to Invitation", cat: "sovereign", teaser: "对自己下命令的人，迟早会叛变；懂得邀请自己的人，反而走得更远。", teaserEn: "Those who command themselves eventually mutiny. Those who learn to invite themselves go further.", price: 9, status: "soon" },
  { slug: "the-sovereigns-last-lesson", title: "主权体的最后一课", titleEn: "The Sovereign's Last Lesson", cat: "sovereign", teaser: "最后一课没有新知识，只有一句重复了很多次的话：你从未真正失去过与场的连接，只是暂时没在听。", teaserEn: "The final lesson holds no new knowledge — only a truth repeated many times: you never lost your connection to the Field.", price: 9, status: "soon" },

  // ───────── 插画版原创篇目（每页自带原创插画与轻量动效） ─────────
  ...ILLUSTRATED_NARRATIVES.map((n) => ({
    slug: n.slug, title: n.title, titleEn: n.titleEn, cat: n.cat,
    teaser: n.teaser, teaserEn: n.teaserEn, price: n.price,
    cover: n.cover, illustrated: true as const,
  })),
];

export function getNarrative(slug: string) {
  return NARRATIVES.find((n) => n.slug === slug);
}
