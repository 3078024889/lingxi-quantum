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
export const CAT_GLYPH: Record<string, { glyph: string; c1: string; c2: string; c3: string }> = {
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
  { id: "novel", zh: "长篇传输 · 小说", en: "Long Transmissions · Novels", descZh: "完整长篇，一字不减 · $5 终身可看", descEn: "Full-length works, uncut · $5, yours for life", soon: false },
  { id: "dream", zh: "梦境档案", en: "Dream Archive", descZh: "来自潜意识的数据片段", descEn: "Data fragments from the subconscious", soon: false },
  { id: "rewrite", zh: "现实重写记录", en: "Reality Rewrite Records", descZh: "发生在「选择之后」的人生变化", descEn: "What changes after the choice is made", soon: false },
  { id: "field", zh: "场域叙事", en: "Field Narratives", descZh: "非个体视角的现实描述 · 含远行者系列", descEn: "Reality beyond the individual · incl. the Wayfarer series", soon: false },
  { id: "sovereign", zh: "主权体观测日志", en: "Sovereign Observation Logs", descZh: "从「场」观察人类现实结构", descEn: "Human reality, observed from the Field", soon: false },
] as const;

export const NARRATIVES: Narrative[] = [
  // ───────── 长篇传输 · 小说（6 · $33 · 创作中）─────────
  { slug: "topological-man", title: "拓扑人", titleEn: "Topological Man", cat: "novel", teaser: "一个能感知到自己所有平行版本彼此牵连的人，发现「选择」从来不是删除，而是折叠——每一个没走的岔路，都还在某处呼吸着。", teaserEn: "A man who can feel every parallel version of himself pulling at the others discovers that choice was never deletion, only folding.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tm-bg" cx="50%" cy="45%" r="70%"><stop offset="0%" stop-color="#2a1c4a"/><stop offset="55%" stop-color="#140c2a"/><stop offset="100%" stop-color="#05030c"/></radialGradient><radialGradient id="tm-core" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="45%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="#6a4a9a" stop-opacity="0"/></radialGradient><filter id="tm-blur"><feGaussianBlur stdDeviation="9"/></filter></defs><rect width="300" height="180" fill="url(#tm-bg)"/><g opacity=".5" filter="url(#tm-blur)"><circle cx="90" cy="70" r="30" fill="#7fa8d8"/><circle cx="210" cy="110" r="34" fill="#8ad8c4"/><circle cx="150" cy="130" r="24" fill="#c9a2ff"/></g><g fill="#fff6e8" opacity=".7">${Array.from({length:16}).map(()=>{const x=(Math.random()*300).toFixed(0),y=(Math.random()*180).toFixed(0),r=(Math.random()*1.3+.4).toFixed(1),d=(2+Math.random()*2.5).toFixed(1);return `<circle cx="${x}" cy="${y}" r="${r}"><animate attributeName="opacity" values="0;.9;0" dur="${d}s" repeatCount="indefinite"/></circle>`;}).join('')}</g><g stroke="#c9a2ff" stroke-width=".8" opacity=".4" fill="none">${Array.from({length:3}).map((_,i)=>`<circle cx="150" cy="90" r="${20+i*16}"><animate attributeName="opacity" values="${.5-i*.1};${.15};${.5-i*.1}" dur="${3+i*.6}s" repeatCount="indefinite"/></circle>`).join('')}</g><circle cx="150" cy="90" r="14" fill="url(#tm-core)"><animate attributeName="r" values="11;16;11" dur="3.2s" repeatCount="indefinite"/></circle></svg>` },
  { slug: "heart-of-the-moon-phase", title: "月相之心", titleEn: "Heart of the Moon Phase", cat: "novel", teaser: "一对灵魂伴侣在月相的十二个周期里反复转世、反复错过，直到他们发现：错过本身，才是这场旅程真正的教材。", teaserEn: "Twin souls reincarnate and miss each other across twelve lunar cycles, until they discover the missing itself was the lesson.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mp-bg" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#3a3160"/><stop offset="100%" stop-color="#12101f"/></radialGradient><filter id="mp-blur"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="300" height="180" fill="url(#mp-bg)"/><g opacity=".5" filter="url(#mp-blur)"><ellipse cx="150" cy="120" rx="120" ry="30" fill="#7a6a9a"/></g><circle cx="150" cy="65" r="28" fill="#fff6e8"><animate attributeName="opacity" values=".85;1;.85" dur="4s" repeatCount="indefinite"/></circle><path d="M150 37 A28 28 0 0 0 150 93 A20 20 0 0 1 150 37 Z" fill="#12101f" opacity=".55"/><g fill="#e6d7ff" opacity=".7">${Array.from({length:20}).map(()=>{const x=Math.random()*300,y=Math.random()*180,r=Math.random()*1.2+.3;return `<circle cx="${x}" cy="${y}" r="${r}"/>`}).join('')}</g></svg>` },
  { slug: "the-echo-observatory", title: "回声观测站", titleEn: "The Echo Observatory", cat: "novel", teaser: "一座建在维度夹缝里的监听站，专门记录「回声」——那些其实是另一个自己，从未选择的人生里，隔着时间发来的讯息。", teaserEn: "A listening station built in the seams between dimensions, recording echoes that are messages from the selves you never became.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="eo-bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#2a2c3a"/><stop offset="100%" stop-color="#0a0910"/></radialGradient><filter id="eo-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#eo-bg)"/><g opacity=".5" filter="url(#eo-blur)"><ellipse cx="150" cy="90" rx="130" ry="50" fill="#3a5a8a"/></g><rect x="120" y="60" width="60" height="70" fill="none" stroke="#9be8ff" stroke-width="1.4" opacity=".7"/><circle cx="150" cy="95" r="6" fill="#9be8ff"><animate attributeName="opacity" values=".5;1;.5" dur="2.4s" repeatCount="indefinite"/></circle><g stroke="#e6d7ff" stroke-width=".6" opacity=".5">${Array.from({length:6}).map((_,i)=>`<circle cx="150" cy="95" r="${20+i*14}"/>`).join('')}</g></svg>` },
  { slug: "the-age-without-light", title: "无光年代", titleEn: "The Age Without Light", cat: "novel", teaser: "文明崩塌之后，幸存者们发现「场」从未消失，只是等着一群不再依赖旧秩序的人，重新学会用心跳来照明。", teaserEn: "After civilization collapses, survivors discover the Field never vanished — it was waiting for people who no longer needed the old order.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="awl-bg" cx="50%" cy="55%" r="65%"><stop offset="0%" stop-color="#241a10"/><stop offset="100%" stop-color="#0a0806"/></radialGradient><filter id="awl-blur"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="300" height="180" fill="url(#awl-bg)"/><g opacity=".6" filter="url(#awl-blur)"><ellipse cx="150" cy="150" rx="140" ry="30" fill="#3a2c18"/></g><g fill="#f2d78a">${Array.from({length:14}).map(()=>{const x=60+Math.random()*180,y=90+Math.random()*70,r=Math.random()*1.8+.6;return `<circle cx="${x}" cy="${y}" r="${r}" opacity="${.4+Math.random()*.5}"><animate attributeName="opacity" values="${.2+Math.random()*.3};${.7+Math.random()*.3};${.2+Math.random()*.3}" dur="${2+Math.random()*3}s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>` },
  { slug: "the-dreamweavers-book", title: "织梦者之书", titleEn: "The Dreamweaver's Book", cat: "novel", teaser: "一群在他人梦境里施工的造梦人，某天发现，他们建造的所有梦境，其实共用着同一根地基——那是全人类共享的一个场。", teaserEn: "Dreamweavers who build inside other people's dreams discover that every dream they've ever built shares a single foundation.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dwb-bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#2a1c3a"/><stop offset="100%" stop-color="#0a0714"/></radialGradient><filter id="dwb-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#dwb-bg)"/><g opacity=".5" filter="url(#dwb-blur)"><ellipse cx="150" cy="100" rx="130" ry="55" fill="#7a5a9a"/></g><g stroke="#e6d7ff" stroke-width=".7" opacity=".55" fill="none">${Array.from({length:5}).map((_,i)=>`<path d="M${40+i*45} 160 Q150 ${60-i*8} ${260-i*40} 160"/>`).join('')}</g><circle cx="150" cy="90" r="7" fill="#fff6e8"><animate attributeName="opacity" values=".6;1;.6" dur="3.4s" repeatCount="indefinite"/></circle></svg>` },
  { slug: "letter-from-dimension-zero", title: "零维回信", titleEn: "Letter from Dimension Zero", cat: "novel", teaser: "那个没有维度、没有形状的「点」，给它在时空里展开出的所有形态写了一封信——这封信，就是你现在正在经历的人生。", teaserEn: "The dimensionless point writes a letter to every form it has ever unfolded into — this letter is the life you are living now.", price: 5, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ldz-bg" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="#1a1428"/><stop offset="100%" stop-color="#050308"/></radialGradient><filter id="ldz-blur"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="300" height="180" fill="url(#ldz-bg)"/><g opacity=".5" filter="url(#ldz-blur)">${Array.from({length:6}).map((_,i)=>`<circle cx="150" cy="90" r="${14+i*13}" fill="none" stroke="#c9a2ff" stroke-width="1"/>`).join('')}</g><circle cx="150" cy="90" r="4" fill="#fff6e8"><animate attributeName="r" values="3;6;3" dur="2.6s" repeatCount="indefinite"/></circle></svg>` },

  // ───────── 现实重写记录（12 · $9 · 创作中）─────────
  // ───────── 梦境档案（7 · $9 · 来自潜意识的数据片段）─────────


  // ───────── 场域叙事（18 · $9）─────────
  // 远行者系列 · 八篇（已发布，可读）
  // 独立场域篇（10 · 创作中）

  // ───────── 主权体观测日志（15 · $9 · 创作中）─────────
  { slug: "watcher-from-the-lyra-field", title: "织女星域来信 · 观测者手记 I", titleEn: "A Letter from the Lyra Field · Observer's Notes I", cat: "sovereign", teaser: "一个从未用过\"个体\"这个词的意识场，第一次靠近地球，看见的不是战争或贫穷，而是几十亿具身体挤在一起、却各自被锁进骨头房间里的巨大孤独——直到他们看见了一道光。", teaserEn: "A field of consciousness that has never needed the word \"individual\" draws close to Earth for the first time — and finds not war or poverty, but a vast loneliness. Then it sees a light.", price: 2, cover: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="wlf-bg" cx="50%" cy="42%" r="70%"><stop offset="0%" stop-color="#3a2352"/><stop offset="55%" stop-color="#1c1331"/><stop offset="100%" stop-color="#05030c"/></radialGradient><filter id="wlf-blur"><feGaussianBlur stdDeviation="8"/></filter></defs><rect width="300" height="180" fill="url(#wlf-bg)"/><g opacity=".5" filter="url(#wlf-blur)"><circle cx="90" cy="60" r="26" fill="#a68fc9"/><circle cx="215" cy="100" r="30" fill="#7fc9a8"/></g><g fill="#f4ecff" opacity=".75">${Array.from({length:22}).map(()=>{const x=(Math.random()*300).toFixed(0),y=(Math.random()*180).toFixed(0),r=(Math.random()*1.2+.3).toFixed(1),d=(2+Math.random()*3).toFixed(1);return `<circle cx="${x}" cy="${y}" r="${r}"><animate attributeName="opacity" values="0;.9;0" dur="${d}s" repeatCount="indefinite"/></circle>`;}).join('')}</g><path d="M150 150 L150 70" stroke="#f4ecff" stroke-width="1.2" opacity=".6"><animate attributeName="opacity" values=".3;.9;.3" dur="3.6s" repeatCount="indefinite"/></path><circle cx="150" cy="62" r="7" fill="#fff6e8"><animate attributeName="r" values="5;9;5" dur="3.2s" repeatCount="indefinite"/></circle></svg>` },

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
