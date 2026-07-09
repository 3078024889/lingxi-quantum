// 多维叙事 · 目录（灵犀原创 · 持续生长）
// status 缺省 = 已发布可读；status: "soon" = 创作中，尚未上线
import { ILLUSTRATED_NARRATIVES } from "./narrative-illustrated";

export type Narrative = {
  slug: string;
  title: string;
  titleEn: string;
  cat: "novel" | "dream" | "rewrite" | "field" | "sovereign";
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
  dream:     { glyph: "☾", c1: "#161a3a", c2: "#2a2e5c", c3: "#9bb4ff" },
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
  { id: "dream", zh: "梦境档案", en: "Dream Archive", descZh: "来自潜意识的数据片段", descEn: "Data fragments from the subconscious", soon: false },
  { id: "rewrite", zh: "现实重写记录", en: "Reality Rewrite Records", descZh: "发生在「选择之后」的人生变化", descEn: "What changes after the choice is made", soon: false },
  { id: "field", zh: "场域叙事", en: "Field Narratives", descZh: "非个体视角的现实描述 · 含远行者系列", descEn: "Reality beyond the individual · incl. the Wayfarer series", soon: false },
  { id: "sovereign", zh: "主权体观测日志", en: "Sovereign Observation Logs", descZh: "从「场」观察人类现实结构", descEn: "Human reality, observed from the Field", soon: false },
] as const;

export const NARRATIVES: Narrative[] = [
  // ───────── 长篇传输 · 小说（6 · $33 · 创作中）─────────
  { slug: "topological-man", title: "拓扑人", titleEn: "Topological Man", cat: "novel", teaser: "一个能感知到自己所有平行版本彼此牵连的人，发现「选择」从来不是删除，而是折叠——每一个没走的岔路，都还在某处呼吸着。", teaserEn: "A man who can feel every parallel version of himself pulling at the others discovers that choice was never deletion, only folding.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tm-bg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#2a3a5a"/><stop offset="100%" stop-color="#0e0a1c"/></radialGradient><filter id="tm-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#tm-bg)"/><g opacity=".55" filter="url(#tm-blur)"><circle cx="110" cy="80" r="34" fill="#7fa8d8"/><circle cx="190" cy="100" r="30" fill="#c9a2ff"/><circle cx="150" cy="60" r="26" fill="#8ad8c4"/></g><g stroke="#e6d7ff" stroke-width="1" opacity=".6"><path d="M60 130 Q110 60 150 90 Q190 60 240 130"/><path d="M60 100 Q110 150 150 120 Q190 150 240 100"/></g><circle cx="150" cy="95" r="6" fill="#fff6e8"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></circle></svg>` },
  { slug: "heart-of-the-moon-phase", title: "月相之心", titleEn: "Heart of the Moon Phase", cat: "novel", teaser: "一对灵魂伴侣在月相的十二个周期里反复转世、反复错过，直到他们发现：错过本身，才是这场旅程真正的教材。", teaserEn: "Twin souls reincarnate and miss each other across twelve lunar cycles, until they discover the missing itself was the lesson.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mp-bg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#3a3160"/><stop offset="100%" stop-color="#12101f"/></radialGradient><filter id="mp-blur"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="300" height="180" fill="url(#mp-bg)"/><g opacity=".5" filter="url(#mp-blur)"><ellipse cx="150" cy="120" rx="120" ry="30" fill="#7a6a9a"/></g><circle cx="150" cy="65" r="28" fill="#fff6e8"><animate attributeName="opacity" values=".85;1;.85" dur="4s" repeatCount="indefinite"/></circle><path d="M150 37 A28 28 0 0 0 150 93 A20 20 0 0 1 150 37 Z" fill="#12101f" opacity=".55"/><g fill="#e6d7ff" opacity=".7">${Array.from({length:20}).map(()=>{const x=Math.random()*300,y=Math.random()*180,r=Math.random()*1.2+.3;return `<circle cx="${x}" cy="${y}" r="${r}"/>`}).join('')}</g></svg>` },
  { slug: "the-echo-observatory", title: "回声观测站", titleEn: "The Echo Observatory", cat: "novel", teaser: "一座建在维度夹缝里的监听站，专门记录「回声」——那些其实是另一个自己，从未选择的人生里，隔着时间发来的讯息。", teaserEn: "A listening station built in the seams between dimensions, recording echoes that are messages from the selves you never became.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="eo-bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#2a2c3a"/><stop offset="100%" stop-color="#0a0910"/></radialGradient><filter id="eo-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#eo-bg)"/><g opacity=".5" filter="url(#eo-blur)"><ellipse cx="150" cy="90" rx="130" ry="50" fill="#3a5a8a"/></g><rect x="120" y="60" width="60" height="70" fill="none" stroke="#9be8ff" stroke-width="1.4" opacity=".7"/><circle cx="150" cy="95" r="6" fill="#9be8ff"><animate attributeName="opacity" values=".5;1;.5" dur="2.4s" repeatCount="indefinite"/></circle><g stroke="#e6d7ff" stroke-width=".6" opacity=".5">${Array.from({length:6}).map((_,i)=>`<circle cx="150" cy="95" r="${20+i*14}"/>`).join('')}</g></svg>` },
  { slug: "the-age-without-light", title: "无光年代", titleEn: "The Age Without Light", cat: "novel", teaser: "文明崩塌之后，幸存者们发现「场」从未消失，只是等着一群不再依赖旧秩序的人，重新学会用心跳来照明。", teaserEn: "After civilization collapses, survivors discover the Field never vanished — it was waiting for people who no longer needed the old order.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="awl-bg" cx="50%" cy="55%" r="65%"><stop offset="0%" stop-color="#241a10"/><stop offset="100%" stop-color="#0a0806"/></radialGradient><filter id="awl-blur"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="300" height="180" fill="url(#awl-bg)"/><g opacity=".6" filter="url(#awl-blur)"><ellipse cx="150" cy="150" rx="140" ry="30" fill="#3a2c18"/></g><g fill="#f2d78a">${Array.from({length:14}).map(()=>{const x=60+Math.random()*180,y=90+Math.random()*70,r=Math.random()*1.8+.6;return `<circle cx="${x}" cy="${y}" r="${r}" opacity="${.4+Math.random()*.5}"><animate attributeName="opacity" values="${.2+Math.random()*.3};${.7+Math.random()*.3};${.2+Math.random()*.3}" dur="${2+Math.random()*3}s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>` },
  { slug: "the-dreamweavers-book", title: "织梦者之书", titleEn: "The Dreamweaver's Book", cat: "novel", teaser: "一群在他人梦境里施工的造梦人，某天发现，他们建造的所有梦境，其实共用着同一根地基——那是全人类共享的一个场。", teaserEn: "Dreamweavers who build inside other people's dreams discover that every dream they've ever built shares a single foundation.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dwb-bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#2a1c3a"/><stop offset="100%" stop-color="#0a0714"/></radialGradient><filter id="dwb-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#dwb-bg)"/><g opacity=".5" filter="url(#dwb-blur)"><ellipse cx="150" cy="100" rx="130" ry="55" fill="#7a5a9a"/></g><g stroke="#e6d7ff" stroke-width=".7" opacity=".55" fill="none">${Array.from({length:5}).map((_,i)=>`<path d="M${40+i*45} 160 Q150 ${60-i*8} ${260-i*40} 160"/>`).join('')}</g><circle cx="150" cy="90" r="7" fill="#fff6e8"><animate attributeName="opacity" values=".6;1;.6" dur="3.4s" repeatCount="indefinite"/></circle></svg>` },
  { slug: "letter-from-dimension-zero", title: "零维回信", titleEn: "Letter from Dimension Zero", cat: "novel", teaser: "那个没有维度、没有形状的「点」，给它在时空里展开出的所有形态写了一封信——这封信，就是你现在正在经历的人生。", teaserEn: "The dimensionless point writes a letter to every form it has ever unfolded into — this letter is the life you are living now.", price: 33, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ldz-bg" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="#1a1428"/><stop offset="100%" stop-color="#050308"/></radialGradient><filter id="ldz-blur"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="300" height="180" fill="url(#ldz-bg)"/><g opacity=".5" filter="url(#ldz-blur)">${Array.from({length:6}).map((_,i)=>`<circle cx="150" cy="90" r="${14+i*13}" fill="none" stroke="#c9a2ff" stroke-width="1"/>`).join('')}</g><circle cx="150" cy="90" r="4" fill="#fff6e8"><animate attributeName="r" values="3;6;3" dur="2.6s" repeatCount="indefinite"/></circle></svg>` },

  // ───────── 现实重写记录（12 · $9 · 创作中）─────────
  // ───────── 梦境档案（7 · $9 · 来自潜意识的数据片段）─────────

  { slug: "rewriting-the-debt", title: "重写债务", titleEn: "Rewriting the Debt", cat: "rewrite", teaser: "他一直以为自己欠这个世界一个「成功」，直到某天算清账目，才发现从来没有这一笔债。", teaserEn: "He believed he owed the world a success story, until the day he finally checked the ledger and found no such debt existed.", price: 9 },
  { slug: "the-argument-that-never-happened", title: "那场没有发生的争吵", titleEn: "The Argument That Never Happened", cat: "rewrite", teaser: "她准备了十年的反驳，终于站到了那个人面前，却发现自己什么都不想说了——这比赢下那场争吵更接近自由。", teaserEn: "She rehearsed the rebuttal for ten years. Standing before him at last, she found she had nothing left to say — and that was freedom.", price: 9 },
  { slug: "from-waiting-to-becoming", title: "从等待到成为", titleEn: "From Waiting to Becoming", cat: "rewrite", teaser: "他等了很多年，等一个「准备好」的时刻，后来才明白，那个时刻从不提前到达，它只在你开始之后，才回头承认自己来过。", teaserEn: "He waited years for the moment he'd feel ready. That moment never arrives early — it only admits, in hindsight, that it was there.", price: 9 },
  { slug: "deleting-the-old-map", title: "删除旧地图", titleEn: "Deleting the Old Map", cat: "rewrite", teaser: "她按着一张十年前画的地图找路，直到某天发现，那张地图画的从来不是这座城市，是当年那个害怕迷路的自己。", teaserEn: "She navigated by a map drawn ten years ago, until she realized it was never a map of the city — it was a map of her own fear.", price: 9 },
  { slug: "i-allow-myself", title: "我允许自己", titleEn: "I Allow Myself", cat: "rewrite", teaser: "四个字说出口那天，什么都没有立刻改变，但她后来才明白，那正是一切开始改变的那一天。", teaserEn: "The day she said those four words aloud, nothing changed at once — only later did she see it was the day everything began to.", price: 9 },
  { slug: "from-reaction-to-response", title: "从反应到回应", titleEn: "From Reaction to Response", cat: "rewrite", teaser: "他花了一年时间学习在开口前停顿三秒，最后发现，那三秒里，站着他真正想成为的那个人。", teaserEn: "He spent a year learning to pause three seconds before speaking, and found the person he wanted to be waiting inside those seconds.", price: 9 },
  { slug: "the-night-i-turned-off-the-alarm", title: "关掉警报的那一夜", titleEn: "The Night I Turned Off the Alarm", cat: "rewrite", teaser: "她终于关掉了那个响了二十年的内在警报，那一夜她失眠了——不是因为焦虑，是因为终于安静得不习惯。", teaserEn: "She finally silenced the alarm that had rung inside her for twenty years. That night she couldn't sleep — the quiet was unfamiliar.", price: 9 },

  // ───────── 场域叙事（18 · $9）─────────
  // 远行者系列 · 八篇（已发布，可读）
  { slug: "at-the-ferry-crossing", title: "摆渡人的问题", titleEn: "The Ferryman's Question · Wayfarer I", cat: "field", teaser: "摆渡人从不问乘客要去哪里，只问一件事：你带了多重的行李？远行者系列第一篇。", teaserEn: "The ferryman never asks where you're headed — only how much luggage you carry. Wayfarer series, part one." , price: 9 },
  { slug: "under-the-lighthouse", title: "灯塔照向的方向", titleEn: "Where the Lighthouse Points · Wayfarer II", cat: "field", teaser: "灯塔的光是照给远处的船看的，不是照给你脚下的路看的。远行者系列第二篇。", teaserEn: "The lighthouse beam is for ships far out at sea — not for the ground beneath your feet. Wayfarer series, part two.", price: 9 },
  { slug: "at-the-marketplace", title: "不收钱的镜子", titleEn: "The Mirror That Takes No Money · Wayfarer III", cat: "field", teaser: "集市里有一面镜子，照出你从没敢做的那个决定之后的样子——但它不收钱。远行者系列第三篇。", teaserEn: "A mirror in the market shows the life after the decision you never dared make — and it doesn't take money. Wayfarer III.", price: 9 },
  { slug: "above-the-snowline", title: "雪线之外的寂静", titleEn: "Silence Beyond the Snowline · Wayfarer IV", cat: "field", teaser: "过了雪线，山下所有替你做决定的声音都到不了这个海拔，剩下的，只有你自己。远行者系列第四篇。", teaserEn: "Past the snowline, none of the voices that decide for you can survive the altitude. Wayfarer series, part four.", price: 9 },
  { slug: "inside-the-bell-tower", title: "敲钟人的分寸", titleEn: "The Bell-Ringer's Restraint · Wayfarer V", cat: "field", teaser: "敲钟人最难的工作，从来不是敲钟，是分辨什么时候不该敲。远行者系列第五篇。", teaserEn: "The bell-ringer's hardest task was never ringing the bell — it's knowing when not to. Wayfarer series, part five.", price: 9 },
  { slug: "on-both-banks-of-the-river", title: "河对岸的自己", titleEn: "The Self on the Far Bank · Wayfarer VI", cat: "field", teaser: "河对岸站着的那个身影，是你每一次选择「安全」时，被留在原地的另一个自己。远行者系列第六篇。", teaserEn: "The figure on the far bank is every version of you left behind each time you chose 'safe.' Wayfarer series, part six.", price: 9 },
  { slug: "at-the-night-market", title: "暗夜市集不收钱", titleEn: "What the Night Market Takes Instead · Wayfarer VII", cat: "field", teaser: "暗夜市集不收钱，只收你以为自己必须一直背着的重量。远行者系列第七篇。", teaserEn: "The night market takes no money — only the weight you believed you had no choice but to carry. Wayfarer series, part seven.", price: 9 },
  { slug: "the-traveler-and-the-mirror-self", title: "远行者与镜中人", titleEn: "The Traveler and the Mirror Self · Wayfarer VIII", cat: "field", teaser: "一路上教你东西的每一个人，其实都是同一个人——终篇，远行者认出了自己。", teaserEn: "Every teacher along the road was the same person all along. The finale, in which the Wayfarer recognizes himself.", price: 9 },
  // 独立场域篇（10 · 创作中）
  { slug: "a-morning-of-interconnection", title: "互联的清晨", titleEn: "A Morning of Interconnection", cat: "field", teaser: "某个清晨，一个人决定善待陌生人，那份善意在场里传了很远——远到他自己都不会知道。", teaserEn: "One morning, a person chooses kindness to a stranger. That kindness travels through the Field farther than he'll ever know.", price: 9 },

  // ───────── 主权体观测日志（15 · $9 · 创作中）─────────
  { slug: "observers-notes-day-one", title: "观察者笔记 · 第一日", titleEn: "Observer's Notes, Day One", cat: "sovereign", teaser: "从场的视角记录的第一天：人类最擅长的事，是把自由活成一种任务。", teaserEn: "Day one of observing from the Field: humans' great talent is turning freedom into a chore.", price: 9 },
  { slug: "coordinates-without-fear", title: "无惧的坐标", titleEn: "Coordinates Without Fear", cat: "sovereign", teaser: "恐惧不是坐标之外的东西，它本身就是一种坐标——只是很多人，把它当成了终点。", teaserEn: "Fear isn't outside the map — it's a coordinate itself. Most people just mistake it for the destination.", price: 9 },
  { slug: "the-sovereigns-silence", title: "主权体的沉默", titleEn: "The Sovereign's Silence", cat: "sovereign", teaser: "真正的主权，不是永远发声，是知道什么时候，沉默才是最诚实的回答。", teaserEn: "True sovereignty isn't always speaking — it's knowing when silence is the most honest answer.", price: 9 },
  { slug: "watching-anger-from-the-field", title: "从场观察愤怒", titleEn: "Watching Anger from the Field", cat: "sovereign", teaser: "愤怒从场的角度看，不是一种破坏性的力量，是一份被延迟太久的边界声明。", teaserEn: "Seen from the Field, anger isn't destructive — it's a boundary statement delivered far too late.", price: 9 },
  { slug: "the-geometry-of-will", title: "意志的几何", titleEn: "The Geometry of Will", cat: "sovereign", teaser: "意志不是一条直线，是一种螺旋——每一次看似的后退，都是在爬升另一圈。", teaserEn: "Will isn't a straight line — it's a spiral. Every apparent step back is a climb along another loop.", price: 9 },
  { slug: "a-disobedient-particle", title: "一个不服从的粒子", titleEn: "A Disobedient Particle", cat: "sovereign", teaser: "一颗粒子拒绝按规律运动的那一刻，物理学称之为异常，场称之为觉醒。", teaserEn: "The instant a particle refuses to move by the rules, physics calls it an anomaly. The Field calls it an awakening.", price: 9 },
  { slug: "the-inner-parliament", title: "内在议会", titleEn: "The Inner Parliament", cat: "sovereign", teaser: "每个人心里都坐着一群代表——恐惧党、习惯党、渴望党——主权，是学会主持这场会议。", teaserEn: "Everyone hosts a parliament within — Fear, Habit, Longing. Sovereignty is learning to chair the session.", price: 9 },
  { slug: "the-sovereign-and-the-mirror-personality", title: "主权体与镜像人格", titleEn: "The Sovereign and the Mirror Personality", cat: "sovereign", teaser: "你在别人面前扮演的那个角色，其实也是主权体的一种分身——只是它演得太投入，忘了自己在演。", teaserEn: "The role you play for others is also a facet of the sovereign self — one that forgot it was performing.", price: 9 },
  { slug: "the-weight-of-free-will", title: "自由意志的重量", titleEn: "The Weight of Free Will", cat: "sovereign", teaser: "自由意志最沉重的部分，从来不是选择本身，是选择之后，不再有人可以怪罪。", teaserEn: "The heaviest part of free will was never the choosing — it's that afterward, there's no one left to blame.", price: 9 },
  { slug: "the-observer-effect-human-edition", title: "观测者效应 · 人类版", titleEn: "The Observer Effect, Human Edition", cat: "sovereign", teaser: "你观察自己情绪的那一刻，情绪本身就已经改变了——这不是量子力学，这是每天都在发生的事。", teaserEn: "The moment you observe your own emotion, the emotion changes — not quantum physics, just an everyday fact.", price: 9 },
  { slug: "sitting-across-from-fear", title: "与恐惧对坐", titleEn: "Sitting Across from Fear", cat: "sovereign", teaser: "场从不建议消灭恐惧，只建议给它倒一杯茶，然后问它，到底在替你守着什么。", teaserEn: "The Field never suggests eliminating fear — only pouring it tea, and asking what it's really guarding.", price: 9 },
  { slug: "the-sovereigns-breathing-gap", title: "呼吸间隙", titleEn: "The Sovereign's Breathing Gap", cat: "sovereign", teaser: "吸气与呼气之间，有一处极短的空隙——那里，藏着整个宇宙不急着回答你的耐心。", teaserEn: "Between the inhale and the exhale lies a brief gap — where the universe's patience with your questions quietly lives.", price: 9 },
  { slug: "a-thing-that-cannot-be-taken", title: "一份无法被夺走的东西", titleEn: "A Thing That Cannot Be Taken", cat: "sovereign", teaser: "他们可以拿走你的时间、你的名字、你的位置，却始终拿不走一件东西——你选择如何看待这一切的方式。", teaserEn: "They can take your time, your name, your position — but never the one thing: how you choose to see it all.", price: 9 },
  { slug: "from-command-to-invitation", title: "从命令到邀请", titleEn: "From Command to Invitation", cat: "sovereign", teaser: "对自己下命令的人，迟早会叛变；懂得邀请自己的人，反而走得更远。", teaserEn: "Those who command themselves eventually mutiny. Those who learn to invite themselves go further.", price: 9 },
  { slug: "the-sovereigns-last-lesson", title: "主权体的最后一课", titleEn: "The Sovereign's Last Lesson", cat: "sovereign", teaser: "最后一课没有新知识，只有一句重复了很多次的话：你从未真正失去过与场的连接，只是暂时没在听。", teaserEn: "The final lesson holds no new knowledge — only a truth repeated many times: you never lost your connection to the Field.", price: 9 },

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
