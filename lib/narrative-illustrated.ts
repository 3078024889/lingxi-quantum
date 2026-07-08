// 插画版 · 多维叙事（灵犀原创）
// 与 narrative-texts.ts 中的纯文本篇目并行：这些篇目每页自带原创 SVG 插画（含轻量动效），
// 通过 IllustratedBookReader 组件渲染，而不是走纯文本翻页器。

export type IllustratedPage = {
  kickerZh: string;
  kickerEn: string;
  tagZh?: string;
  tagEn?: string;
  titleZh?: string;
  titleEn?: string;
  subtitleZh?: string;
  subtitleEn?: string;
  textZh: string;
  textEn: string;
  closingZh?: string;
  closingEn?: string;
  art: string; // raw SVG markup
};

export type IllustratedEntry = {
  slug: string;
  title: string;
  titleEn: string;
  cat: "novel" | "rewrite" | "field" | "sovereign";
  teaser: string;
  teaserEn: string;
  price: number;
  cover: string; // raw SVG markup，用于列表页缩略图
  pages: IllustratedPage[];
};

/* ---------- 共用 SVG 素材：望翎（苍冀星） ---------- */
const WL_DEFS = `<defs>
  <filter id="wlPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.15  0 0 0 0.05 0"/></filter>
  <filter id="wlBlur"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="wlSoft"><feGaussianBlur stdDeviation="1.6"/></filter>
  <linearGradient id="wlSky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3a2350"/><stop offset="55%" stop-color="#5c3560"/><stop offset="100%" stop-color="#e8845f"/>
  </linearGradient>
  <linearGradient id="wlWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f2c98a"/><stop offset="100%" stop-color="#c97b3d"/></linearGradient>
  <linearGradient id="wlWingR" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff3d6"/><stop offset="55%" stop-color="#f2a65a"/><stop offset="100%" stop-color="#d97b6c"/></linearGradient>
  <linearGradient id="wlRobe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a2d5a"/><stop offset="100%" stop-color="#2c1a38"/></linearGradient>
  <radialGradient id="wlPlanet" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#7a5a8a"/><stop offset="60%" stop-color="#3a2350"/><stop offset="100%" stop-color="#160c22"/></radialGradient>
</defs>`;

function wlFigure(pose: "standing" | "falling" | "radiant") {
  const head = `<circle cx="0" cy="-58" r="9" fill="#3a2530"/><path d="M-9 -60 Q0 -74 9 -60 Q11 -46 0 -42 Q-11 -46 -9 -60 Z" fill="#2c1a38"/>`;
  const body = `<path d="M-13 -44 Q0 -50 13 -44 L18 20 Q0 30 -18 20 Z" fill="url(#wlRobe)"/>`;
  const arms = pose === "falling"
    ? `<path d="M-13 -38 Q-34 -26 -40 -4" stroke="#3a2530" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M13 -38 Q34 -26 40 -4" stroke="#3a2530" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<path d="M-13 -38 Q-24 -20 -20 0" stroke="#3a2530" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M13 -38 Q24 -20 20 0" stroke="#3a2530" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  let wings = "";
  if (pose === "standing") {
    wings = `<g opacity=".92">
      <g><path d="M-10 -30 C -70 -50 -95 -10 -80 30 C -60 10 -35 -5 -10 -10 Z" fill="url(#wlWing)"/><animateTransform attributeName="transform" type="rotate" values="0 -10 -30;-6 -10 -30;0 -10 -30" dur="3.2s" repeatCount="indefinite"/></g>
      <g><path d="M10 -30 C 70 -50 95 -10 80 30 C 60 10 35 -5 10 -10 Z" fill="url(#wlWing)"/><animateTransform attributeName="transform" type="rotate" values="0 10 -30;6 10 -30;0 10 -30" dur="3.2s" repeatCount="indefinite"/></g>
    </g>`;
  } else if (pose === "falling") {
    wings = `<g opacity=".7">
      <g><path d="M-8 -30 C -30 -60 -50 -70 -55 -50 C -40 -35 -25 -25 -8 -18 Z" fill="url(#wlWing)" opacity=".65"/><animateTransform attributeName="transform" type="rotate" values="0 -8 -30;-14 -8 -30;0 -8 -30" dur="1.1s" repeatCount="indefinite"/></g>
      <g><path d="M8 -30 C 30 -60 50 -70 55 -50 C 40 -35 25 -25 8 -18 Z" fill="url(#wlWing)" opacity=".65"/><animateTransform attributeName="transform" type="rotate" values="0 8 -30;14 8 -30;0 8 -30" dur="1.1s" repeatCount="indefinite"/></g>
    </g>`;
  } else {
    wings = `<g>
      <g><path d="M-10 -30 C -90 -60 -120 0 -95 55 C -70 25 -40 0 -10 -8 Z" fill="url(#wlWingR)"/><animateTransform attributeName="transform" type="rotate" values="0 -10 -30;-4 -10 -30;0 -10 -30" dur="4s" repeatCount="indefinite"/></g>
      <g><path d="M10 -30 C 90 -60 120 0 95 55 C 70 25 40 0 10 -8 Z" fill="url(#wlWingR)"/><animateTransform attributeName="transform" type="rotate" values="0 10 -30;4 10 -30;0 10 -30" dur="4s" repeatCount="indefinite"/></g>
      <circle cx="0" cy="-58" r="16" fill="#fff3d6" opacity=".35" filter="url(#wlSoft)"><animate attributeName="r" values="16;20;16" dur="2.4s" repeatCount="indefinite"/></circle>
    </g>`;
  }
  const rot = pose === "falling" ? "rotate(18)" : "rotate(0)";
  return `<g transform="${rot}">${wings}${body}${arms}${head}</g>`;
}

const WL_COVER = `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
  <circle cx="150" cy="120" r="70" fill="url(#wlPlanet)"/>
  <ellipse cx="150" cy="120" rx="95" ry="18" fill="none" stroke="#f2c98a" stroke-width="1" opacity=".5"><animate attributeName="opacity" values=".5;.8;.5" dur="4s" repeatCount="indefinite"/></ellipse>
  <g transform="translate(150,130) scale(0.55)">${wlFigure("standing")}</g>
</svg>`;

/* ---------- 望翎：完整9页 ---------- */
const FEATHER_VIGIL: IllustratedEntry = {
  slug: "the-feather-vigil",
  title: "望翎",
  titleEn: "The Feather Vigil",
  cat: "field",
  teaser: "苍冀星的成人礼，与一头从不施救的神兽——真翼从不是奖励给最勇敢的人，而是奖励给最诚实的人。",
  teaserEn: "A coming-of-age trial on Cangji, and the divine beast that never intervenes. True wings are a reward for the most honest, not the bravest.",
  price: 9,
  cover: WL_COVER,
  pages: [
    {
      kickerZh: "一 · 悬崖边的孩子", kickerEn: "I · The Child at the Cliff's Edge",
      tagZh: "苍冀星 · 云隙悬崖", tagEn: "Cangji Star · Cloud-Rift Cliffs",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <path d="M0 190 Q80 160 150 185 Q220 210 300 175 L300 220 L0 220 Z" fill="#241633" opacity=".9"/>
        <g transform="translate(120,150) scale(0.62)">${wlFigure("standing")}</g></svg>`,
      textZh: "苍冀星终年被浓雾般的大气托举着，陆地不过是漂浮在云层之上的几片孤岛，苍冀民世代居于其上，靠一双羽翼往来于岛屿之间。\n\n可羽翼不是生来就有的。每一个苍冀民孩子，未成年前只有一双\"雏羽\"，只够滑翔，撑不起真正的远行。成年礼那天，他们要从悬崖一跃而下——雏羽会在坠落中折断，唯有配得上\"真翼\"的人，才会在坠落途中，长出属于自己的、真正的翅膀。\n\n息栎今天满十六岁。她站在悬崖边，望着脚下深不见底的云海。",
      textEn: "Cangji Star is forever held aloft by mist-thick air; its land is nothing but a few scattered isles floating above the cloud layer. The Cangji people have lived there for generations, crossing between islands on a single pair of wings.\n\nBut wings are not given at birth. Every Cangji child has only \u201Cfirst-down\u201D \u2014 enough to glide, never enough to fly far. On the day of their coming-of-age, they must leap from the cliff: the first-down tears apart mid-fall, and only those worthy of it will grow true wings in the plunge.\n\nToday, Xi Li turns sixteen. She stands at the cliff\u2019s edge, staring down into a bottomless sea of cloud.",
    },
    {
      kickerZh: "二 · 一跃而下", kickerEn: "II · The Leap",
      tagZh: "成人礼 · 云隙之跃", tagEn: "Coming-of-Age \u00b7 The Cloud-Rift Jump",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g opacity=".5">${Array.from({length:5}).map((_,i)=>`<ellipse cx="${40+i*55}" cy="${40+i*8}" rx="26" ry="8" fill="#e8845f" opacity="${.3-i*.03}"/>`).join('')}</g>
        <g transform="translate(160,110) scale(0.65)">${wlFigure("falling")}</g></svg>`,
      textZh: "她跳了下去。\n\n雏羽刚展开就被风撕开一道口子，她整个人像断线的风筝般翻滚下坠。族里流传的说法是——真翼会在最绝望的一瞬自己长出来，只要你\u201c配得上\u201d。息栎拼命扇动残破的雏羽，试图减缓坠落，可云海越来越近，风声在耳边尖锐地呼啸。",
      textEn: "She jumped.\n\nThe first-down tore open the instant it caught the wind, and her body spun downward like a kite with its string cut. Legend says true wings grow of their own accord at the moment of deepest despair \u2014 if you are worthy. Xi Li beat her ragged wings desperately, trying to slow the fall, but the cloud sea rushed closer, the wind screaming sharp in her ears.",
    },
    {
      kickerZh: "三 · 九霄隼", kickerEn: "III · The Nine-Heaven Falcon",
      tagZh: "神话异兽 · 苍冀星守护者", tagEn: "Mythical Beast \u00b7 Guardian of Cangji",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="#20122e"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g transform="translate(150,120)">
          <g><path d="M-70 20 Q-40 -60 0 -70 Q40 -60 70 20 Q30 0 0 5 Q-30 0 -70 20 Z" fill="url(#wlWing)" opacity=".95"/><animateTransform attributeName="transform" type="rotate" values="0 0 20;-2 0 20;0 0 20" dur="2.6s" repeatCount="indefinite"/></g>
          <path d="M-20 -55 Q0 -90 20 -55 Q10 -40 0 -38 Q-10 -40 -20 -55 Z" fill="#c97b3d"/>
          <circle cx="-10" cy="-45" r="6" fill="#fff3d6"/><circle cx="-10" cy="-45" r="2.6" fill="#7a2e2e"><animate attributeName="r" values="2.6;0.3;2.6" dur="4s" begin="1s" repeatCount="indefinite"/></circle>
          <circle cx="10" cy="-45" r="6" fill="#fff3d6"/><circle cx="10" cy="-45" r="2.6" fill="#7a2e2e"><animate attributeName="r" values="2.6;0.3;2.6" dur="4s" begin="1s" repeatCount="indefinite"/></circle>
        </g></svg>`,
      textZh: "就在她以为自己要坠入云海深处时，一道巨大的阴影从云层里破空而出——那是传说中的九霄隼，通体覆着琥珀色的羽，双眼如熔金，翼展遮住了半边天空。\n\n族人都说，九霄隼从不出手相救，它只负责\u201c观看\u201d每一场成人礼——谁能配得上真翼，与它无关，它只是这场仪式，唯一的见证者。",
      textEn: "Just as she thought she\u2019d plunge into the depths of the cloud sea, a vast shadow tore out from the clouds \u2014 the legendary Nine-Heaven Falcon, cloaked head to tail in amber feathers, eyes like molten gold, wings wide enough to blot out half the sky.\n\nThe people say the Falcon never intervenes to save anyone. It only watches \u2014 the sole witness to every coming-of-age trial.",
    },
    {
      kickerZh: "四 · 长晏的教诲", kickerEn: "IV · Chang Yan's Teaching",
      tagZh: "回忆 · 导师之言", tagEn: "Memory \u00b7 A Mentor's Words",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g transform="translate(100,150) scale(0.55)">${wlFigure("standing")}</g>
        <g transform="translate(210,155) scale(0.5) scale(-1,1)">${wlFigure("standing")}</g></svg>`,
      textZh: "息栎想起导师长晏说过的话：\u201c很多孩子跳下悬崖那一刻，拼命想的是\u2018我要活下去\u2019，可真翼从不为求生的意志而生。它只在一种情况下出现——当你不再想着\u2018逃离坠落\u2019，而是想起了\u2018自己到底是谁\u2019。\u201d\n\n那时她没听懂。此刻风声灌进耳朵，她忽然想起，自己从小到大，最想成为的，从来不是\u201c最快学会飞的那个\u201d，而是\u201c敢诚实说出害怕\u201d的那个。",
      textEn: "Xi Li remembered what her mentor Chang Yan once told her: \u201cMost children, the moment they leap, think only \u2014 I must survive. But true wings are never born from the will to survive. They appear only when you stop thinking about escaping the fall, and instead remember who you really are.\u201d\n\nShe hadn\u2019t understood it then. Now, with the wind roaring in her ears, she suddenly remembered \u2014 what she had always wanted to become was never \u201cthe one who learns to fly fastest,\u201d but \u201cthe one who dares to admit she\u2019s afraid.\u201d",
    },
    {
      kickerZh: "五 · 坠落中的挣扎", kickerEn: "V · Struggling in the Fall",
      tagZh: "冲突 · 求生本能 vs 真实自我", tagEn: "Conflict \u00b7 Survival Instinct vs. True Self",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g transform="translate(150,90) scale(0.7)">${wlFigure("falling")}</g></svg>`,
      textZh: "求生的本能还是压过了一切，她死死地扇动残翅，试图用蛮力扭转下坠的方向——可残破的雏羽根本承受不住，反而让她的坠势变得更加失控地翻滚。\n\n九霄隼始终悬在半空，一言不发地看着，没有伸出一根羽毛。",
      textEn: "Instinct won out anyway. She thrashed her broken wings, trying to force a change of direction through sheer will \u2014 but the torn down couldn\u2019t bear it, and her fall spiraled further out of control.\n\nThe Nine-Heaven Falcon hung in the air the whole time, silent, not lending a single feather.",
    },
    {
      kickerZh: "六 · 停止挣扎的那一瞬", kickerEn: "VI · The Moment She Stopped Fighting",
      tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="#1a0f28"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g transform="translate(150,120) scale(0.85)">${wlFigure("falling")}</g></svg>`,
      textZh: "力竭的一瞬，息栎忽然放弃了挣扎。不是放弃求生，而是放弃了\u201c必须靠蛮力赢下这场坠落\u201d的执念。\n\n她张开双臂，任由风灌满全身，闭上眼睛，第一次，诚实地对自己承认：我很怕，但我不想在假装不怕里，长大成一个我不认识的人。",
      textEn: "At the point of total exhaustion, Xi Li simply stopped fighting. Not giving up on survival \u2014 giving up the belief that she had to win this fall through brute force alone.\n\nShe spread her arms wide, let the wind fill her completely, closed her eyes, and for the first time, told herself the truth: I am afraid. But I don\u2019t want to grow into someone I don\u2019t recognize by pretending I\u2019m not.",
    },
    {
      kickerZh: "七 · 真翼", kickerEn: "VII · True Wings",
      tagZh: "高潮 · 蜕变", tagEn: "Climax \u00b7 Transformation",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <g transform="translate(150,120) scale(0.85)">${wlFigure("radiant")}</g></svg>`,
      textZh: "就在那一刻，她感到肩胛骨传来一阵灼热——不是疼痛，更像是某种一直存在、只是从未被\u201c允许\u201d的东西，终于被认领。一双真正的羽翼，从她的背后破开雏羽的残骸，缓缓展开，通体泛着晨曦般的金色光芒。\n\n九霄隼第一次发出鸣叫，那声音传遍了整片云海——那不是庆祝，而是一种见证：又一个苍冀民，找到了自己。",
      textEn: "At that instant, she felt a burning heat spread across her shoulder blades \u2014 not pain, but something that had always been there, simply never allowed to surface, finally being claimed. A true pair of wings broke free from the ruins of her first-down, unfurling slowly, glowing gold like the first light of dawn.\n\nFor the first time, the Nine-Heaven Falcon let out a cry that rang across the entire cloud sea.",
    },
    {
      kickerZh: "尾声", kickerEn: "Epilogue",
      tagZh: "归岛", tagEn: "Return to the Isle",
      art: `<svg viewBox="0 0 300 220">${WL_DEFS}<rect width="300" height="220" fill="url(#wlSky)"/><rect width="300" height="220" filter="url(#wlPaper)"/>
        <path d="M0 190 Q80 160 150 185 Q220 210 300 175 L300 220 L0 220 Z" fill="#241633" opacity=".85"/>
        <g transform="translate(150,150) scale(0.6)">${wlFigure("radiant")}</g></svg>`,
      textZh: "息栎收拢双翼，落回悬崖顶端时，长晏站在那里，什么都没问，只是笑了笑。\n\n她后来才明白，成人礼从不是一场\u201c能不能活下来\u201d的考验——它考验的是，你敢不敢在最害怕的时候，依然选择做真实的自己。真翼从不是奖励给最勇敢的人，而是奖励给最诚实的人。",
      textEn: "When Xi Li folded her wings and landed back on the clifftop, Chang Yan was standing there, asking nothing, only smiling.\n\nThe coming-of-age trial was never a test of whether you could survive \u2014 it tested whether you dared to stay true to yourself in your most frightened moment. True wings are a reward for the most honest, not the bravest.",
      closingZh: "能让你飞起来的，从来不是拼命挣扎的力气，而是终于不再假装的那一刻。",
      closingEn: "What lifts you into flight was never the strength of your struggle \u2014 it was the moment you finally stopped pretending.",
    },
  ],
};

/* ---------- 息隙：焕蜕星域，完整9页 ---------- */
const XI_DEFS = `<defs>
  <filter id="xxPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="6" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0.05 0"/></filter>
  <filter id="xxSoft"><feGaussianBlur stdDeviation="1.8"/></filter>
  <filter id="xxBlur"><feGaussianBlur stdDeviation="8"/></filter>
  <linearGradient id="xxSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c211c"/><stop offset="45%" stop-color="#173a30"/><stop offset="80%" stop-color="#2e5a48"/><stop offset="100%" stop-color="#d8c07a"/></linearGradient>
  <linearGradient id="xxRobe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#274d3f"/><stop offset="100%" stop-color="#12251e"/></linearGradient>
  <radialGradient id="xxGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e8f5ec" stop-opacity=".9"/><stop offset="100%" stop-color="#7fc9a8" stop-opacity="0"/></radialGradient>
  <radialGradient id="xxPlatform" cx="45%" cy="35%" r="60%"><stop offset="0%" stop-color="#3a6350"/><stop offset="100%" stop-color="#132a22"/></radialGradient>
</defs>`;

function xxWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#xxBlur)"/>`).join('');
}

function xxSit(state: "calm" | "strained" | "breakthrough") {
  const robe = `<path d="M-20 20 Q0 -6 20 20 Q26 30 0 34 Q-26 30 -20 20 Z" fill="url(#xxRobe)"/>`;
  const torso = `<path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="url(#xxRobe)"><animate attributeName="d" values="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z;M-13 -36 Q0 -43 13 -36 L15 20 Q0 26 -15 20 Z;M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" dur="3.4s" repeatCount="indefinite"/></path>`;
  // 长发垂肩，额前一撮不听话的碎发
  const hair = `<path d="M-9 -44 Q0 -54 9 -44 Q13 -20 8 6 Q0 10 -8 6 Q-13 -20 -9 -44 Z" fill="#12201a"/><path d="M-2 -50 Q1 -46 -1 -42" stroke="#12201a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const head = `<circle cx="0" cy="-44" r="8" fill="#20352c"/>`;
  const armL = `<path d="M-11 -26 Q-20 -8 -8 6" stroke="#1a2e26" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const armR = `<path d="M11 -26 Q20 -8 8 6" stroke="#1a2e26" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  let glow = "";
  if (state === "calm") glow = `<circle cx="0" cy="-8" r="24" fill="url(#xxGlow)" opacity=".35" filter="url(#xxSoft)"><animate attributeName="r" values="16;34;16" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;.5;.2" dur="3.4s" repeatCount="indefinite"/></circle>`;
  if (state === "strained") glow = `<circle cx="0" cy="-8" r="30" fill="#d8c07a" opacity=".22" filter="url(#xxSoft)"><animate attributeName="r" values="20;38;20" dur="0.9s" repeatCount="indefinite"/><animate attributeName="opacity" values=".15;.4;.15" dur="0.9s" repeatCount="indefinite"/></circle>`;
  if (state === "breakthrough") glow = `<circle cx="0" cy="-8" r="60" fill="url(#xxGlow)" opacity=".55" filter="url(#xxSoft)"><animate attributeName="r" values="42;78;42" dur="2.6s" repeatCount="indefinite"/></circle>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.4s" repeatCount="indefinite"/>${glow}${robe}${torso}${armL}${armR}${head}${hair}</g>`;
}

const XI_COVER = `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
  ${xxWash([{x:150,y:170,rx:140,ry:40,color:'#0c211c',op:.6}])}
  <ellipse cx="150" cy="175" rx="80" ry="16" fill="url(#xxPlatform)"/>
  <g transform="translate(150,150) scale(0.7)">${xxSit("calm")}</g>
</svg>`;

const SPACE_BETWEEN_BREATHS: IllustratedEntry = {
  slug: "the-space-between-breaths",
  title: "息隙",
  titleEn: "The Space Between Breaths",
  cat: "sovereign",
  teaser: "焕蜕星域的修行者，与她一直没跨过去的那道坎——真正的突破，往往是终于愿意，不再和它较劲。",
  teaserEn: "A cultivator of Huantui, and the threshold she could never cross \u2014 until she stopped fighting it.",
  price: 9,
  cover: XI_COVER,
  pages: [
    {
      kickerZh: "一 · 焕蜕星域", kickerEn: "I · The Huantui Domain",
      tagZh: "悬空秘境 · 量子息法", tagEn: "Suspended Sanctuary \u00b7 The Quantum Breath Method",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:220,y:60,rx:100,ry:60,color:'#2e5a48',op:.4}])}
        <ellipse cx="150" cy="175" rx="90" ry="16" fill="url(#xxPlatform)"/>
        <g transform="translate(110,150) scale(0.55)">${xxSit("calm")}</g>
        <g transform="translate(200,155) scale(0.5)">${xxSit("calm")}</g></svg>`,
      textZh: "焕蜕星域悬浮在稀薄大气与浓密云海之间，修行者不炼气，炼的是\u201c频率\u201d——呼吸的长短、心跳的间隔、专注的密度，都是可以精修的功夫。\n\n折微是个瘦削的年轻女子，常年打坐让她习惯性地含着背，一头长发从不束起，总是随意披在肩上，额前留着一撮总也理不平的碎发。她修习\u201c量子息法\u201d已有三年，同门师姐妹陆续都能在一次呼吸的停顿里，触到场域深处的共振，唯独她，每次到那道\u201c息隙\u201d前，就像撞上一堵看不见的墙。",
      textEn: "The Huantui Domain floats suspended between thin sky and thick cloud sea. Its cultivators refine no qi \u2014 they refine frequency: the length of a breath, the gap between heartbeats, the density of attention.\n\nZhe Wei is thin and narrow-shouldered, her posture faintly curved from years of sitting meditation. She wears her long hair loose over her shoulders, never tied back, with a stubborn wisp at her forehead that never lies flat. She has practiced the Quantum Breath Method for three years. Her fellow disciples have learned to touch the Field\u2019s resonance in a single breath\u2019s pause. She alone meets what feels like an invisible wall.",
    },
    {
      kickerZh: "二 · 越练越僵", kickerEn: "II · The Harder She Tries",
      tagZh: "困境", tagEn: "The Plateau",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="#0e211c"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:150,y:110,rx:150,ry:100,color:'#173a30',op:.7}])}
        <g transform="translate(150,150) scale(0.75)">${xxSit("strained")}</g></svg>`,
      textZh: "她以为问题出在\u201c憋得不够久\u201d，于是拼命延长每一次呼吸的停顿，直到太阳穴突突直跳，什么共振都没触到，只触到了一身冷汗。\n\n同门都劝她别急，她却觉得自己是唯一被落下的人。",
      textEn: "She assumed the problem was that she wasn\u2019t holding long enough, so she forced each pause longer, until her temples throbbed \u2014 no resonance came, only a cold sweat.\n\nHer fellow disciples told her not to rush. She felt like the only one left behind.",
    },
    {
      kickerZh: "三 · 长晏的到访", kickerEn: "III · Chang Yan's Visit",
      tagZh: "过路的观测者", tagEn: "A Passing Observer",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        <g transform="translate(100,150) scale(0.55)">${xxSit("calm")}</g>
        <g transform="translate(205,150) scale(0.6)"><path d="M-13 -44 Q0 -50 13 -44 L18 20 Q0 30 -18 20 Z" fill="#12251e"/><circle cx="0" cy="-56" r="9" fill="#20352c"/></g></svg>`,
      textZh: "一位云游至此的旅人恰好路过——族人都叫他长晏，据说他走过很多星域，只在有人卡在坎上时，恰好出现。\n\n他看了折微练功片刻，只说了一句：\u201c你在跟那道隙较劲，可它从来不是用来\u2018跨过\u2019的，是用来\u2018待\u2019着的。呼吸是你身上唯一一件，从出生那一刻起就没停过、又能被意志接管的事——吸气和呼气之间那道停顿，才是意识唯一能主动交给身体的指令。你越想用力延长它，越是在用意志覆盖它，那道隙从来不需要被撑开，它只需要，被安静地经过。\u201d",
      textEn: "A wandering traveler happened to pass through \u2014 the locals called him Chang Yan. They said he only appeared wherever someone was stuck at a threshold.\n\nHe watched Zhe Wei practice, then said only this: \u201cYou\u2019re wrestling with the gap. But it was never something to cross \u2014 it\u2019s something to stay in. Breath is the one thing in you that never once stopped since the moment you were born, and the one autonomic rhythm your conscious will can still reach into. The pause between inhale and exhale is the only instruction awareness can hand directly to the body. The harder you force it longer, the more you're just overwriting it with willpower. That gap was never meant to be pried open. It only needs to be passed through, quietly.\u201d",
    },
    {
      kickerZh: "四 · 再次失败", kickerEn: "IV · Failing Again",
      tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="#0e211c"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:150,y:120,rx:160,ry:100,color:'#173a30',op:.75}])}
        <g transform="translate(150,155) scale(0.8) rotate(6)">${xxSit("strained")}</g></svg>`,
      textZh: "她把长晏的话理解成\u201c要更用力地留在那道隙里\u201d，于是练得更狠——那一次，她练到几乎晕厥，那道墙依旧纹丝不动。",
      textEn: "She took his words to mean she should force herself to linger in the gap even harder \u2014 and pushed so far she nearly blacked out. The wall hadn\u2019t moved an inch.",
    },
    {
      kickerZh: "五 · 一个不起眼的记忆", kickerEn: "V · An Unremarkable Memory",
      tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:150,y:80,rx:150,ry:60,color:'#d8c07a',op:.2}])}
        <g transform="translate(150,150) scale(0.7)">${xxSit("calm")}</g></svg>`,
      textZh: "恍惚间，她想起小时候在院子里发呆的一个下午——什么都没做，只是看着一片叶子落下来，那一刻，她什么都没求，却觉得从没那么\u201c在\u201d过。",
      textEn: "In her daze, she remembered an ordinary afternoon as a child \u2014 doing nothing, just watching a leaf fall. She had wanted nothing, yet had never felt so entirely present.",
    },
    {
      kickerZh: "六 · 重新坐下", kickerEn: "VI · Sitting Down Again",
      tagZh: "尝试", tagEn: "A New Attempt",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:150,y:100,rx:160,ry:100,color:'#2e5a48',op:.5}])}
        <g transform="translate(150,155) scale(0.75)">${xxSit("calm")}</g></svg>`,
      textZh: "她再次盘坐，这一次没有计时，没有较劲，只是像小时候看落叶那样，让呼吸自然地停顿。她只是，安安静静地\u201c待\u201d在那道隙里。",
      textEn: "She sat again \u2014 without counting, without straining, letting the breath pause on its own. She simply stayed, quietly, inside the gap.",
    },
    {
      kickerZh: "七 · 息隙洞开", kickerEn: "VII · The Gap Opens",
      tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="#0c1b16"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        ${xxWash([{x:150,y:100,rx:180,ry:120,color:'#7fc9a8',op:.3}])}
        <g transform="translate(150,150) scale(0.85)">${xxSit("breakthrough")}</g></svg>`,
      textZh: "就在她停止\u201c用力\u201d的那一刻，那道憋了三年都撞不开的墙，毫无预兆地融化了——不是轰然巨响的顿悟，而是极轻极轻的一声\u201c啊，原来如此\u201d。",
      textEn: "The instant she stopped forcing, the wall that had held for three years dissolved without warning \u2014 not a thunderclap of enlightenment, but a quiet \u201cah, so this is it.\u201d",
    },
    {
      kickerZh: "尾声", kickerEn: "Epilogue",
      tagZh: "传承", tagEn: "Passing It On",
      art: `<svg viewBox="0 0 300 220">${XI_DEFS}<rect width="300" height="220" fill="url(#xxSky)"/><rect width="300" height="220" filter="url(#xxPaper)"/>
        <ellipse cx="150" cy="180" rx="90" ry="16" fill="url(#xxPlatform)"/>
        <g transform="translate(110,158) scale(0.5)">${xxSit("calm")}</g>
        <g transform="translate(200,160) scale(0.45)">${xxSit("calm")}</g></svg>`,
      textZh: "后来，每当有新入门的师弟师妹卡在同一道坎前，折微都会坐到他们身边，说一句和当年长晏一模一样的话：\u201c那道隙不是用来跨过的，是用来待着的——你越想用力挤过去，它就关得越紧。\u201d",
      textEn: "Later, whenever a new disciple got stuck at the same threshold, Zhe Wei would sit beside them and say the words Chang Yan once said to her: \u201cThat gap was never meant to be crossed. The harder you force your way through, the tighter it closes.\u201d",
      closingZh: "真正的突破，往往不是用力挤过一道坎，而是终于愿意，不再和它较劲。",
      closingEn: "The real breakthrough is rarely about forcing your way past a threshold \u2014 it\u2019s finally being willing to stop fighting it at all.",
    },
  ],
};

/* ---------- 显影官：缈玥星，完整8页（英文新译） ---------- */
const MW_DEFS = `<defs>
  <filter id="mwPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0 0.18  0 0 0 0.045 0"/></filter>
  <filter id="mwGlow"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="mwFine"><feGaussianBlur stdDeviation="2.2"/></filter>
  <linearGradient id="mwSky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#171331"/><stop offset="35%" stop-color="#2c2352"/><stop offset="65%" stop-color="#5b4178"/><stop offset="85%" stop-color="#8f6a8a"/><stop offset="100%" stop-color="#caa07a"/>
  </linearGradient>
  <radialGradient id="mwMoon" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#f5ecd8"/><stop offset="55%" stop-color="#e8d9c3"/><stop offset="100%" stop-color="#b79a72" stop-opacity="0"/></radialGradient>
  <linearGradient id="mwCloak" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a3160"/><stop offset="100%" stop-color="#1c1730"/></linearGradient>
  <linearGradient id="mwObj" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8d9c3" stop-opacity=".85"/><stop offset="100%" stop-color="#a68fc9" stop-opacity=".35"/></linearGradient>
</defs>`;
function mwWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#mwGlow)"/>`).join('');
}
function mwPerson(pose: "still" | "reach") {
  const cloak = `<path d="M-15 -38 Q0 -46 15 -38 L20 32 Q0 42 -20 32 Z" fill="url(#mwCloak)"/>`;
  // 及腰直发
  const hair = `<path d="M-8 -50 Q0 -58 8 -50 Q11 -10 6 30 Q0 34 -6 30 Q-11 -10 -8 -50 Z" fill="#171029"/>`;
  const head = `<circle cx="0" cy="-52" r="8" fill="#2a2140"/>`;
  const badge = `<circle cx="-11" cy="-30" r="2.2" fill="#c9c3d8" opacity=".9"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></circle>`;
  const glow = `<ellipse cx="0" cy="-16" rx="30" ry="55" fill="#e8d9c3" opacity=".08" filter="url(#mwGlow)"><animate attributeName="opacity" values=".05;.16;.05" dur="4s" repeatCount="indefinite"/></ellipse>`;
  const armL = pose === "reach" ? `<path d="M-15 -28 Q-32 -8 -28 20" stroke="#241d3a" stroke-width="5" fill="none" stroke-linecap="round"/>` : `<path d="M-15 -28 Q-22 -10 -18 8" stroke="#241d3a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const armR = `<path d="M15 -28 Q22 -10 18 8" stroke="#241d3a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="4.5s" repeatCount="indefinite"/>${glow}${cloak}${armL}${armR}${head}${hair}${badge}</g>`;
}
const MW_COVER = `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
  ${mwWash([{x:230,y:170,rx:110,ry:60,color:'#caa07a',op:.35},{x:40,y:190,rx:90,ry:40,color:'#171331',op:.5}])}
  <circle cx="150" cy="70" r="46" fill="url(#mwMoon)"><animate attributeName="r" values="46;50;46" dur="4.5s" repeatCount="indefinite"/></circle>
  <circle cx="150" cy="70" r="30" fill="#efe3cf" opacity=".9"/>
  <path d="M0 195 Q80 165 150 188 Q220 208 300 178 L300 220 L0 220 Z" fill="#171025" opacity=".92"/>
  <g transform="translate(150,175) scale(0.5)">${mwPerson("still")}</g>
</svg>`;

const MANIFESTATION_WARDEN: IllustratedEntry = {
  slug: "manifestation-warden",
  title: "显影官",
  titleEn: "The Manifestation Warden",
  cat: "field",
  teaser: "缈玥星上，那些每晚被显化出来的心事——真正的显化，不是让不想要的东西消失，而是被看见后自然转化。",
  teaserEn: "On the moon of Miaoyue, the heart's unfinished business takes physical shape each night. True manifestation isn't making the unwanted vanish — it's transformation through finally being seen.",
  price: 9,
  cover: MW_COVER,
  pages: [
    {
      kickerZh: "一 · 缈玥星", kickerEn: "I · Miaoyue Star",
      tagZh: "低重力卫星 · 显化谷", tagEn: "Low-Gravity Moon \u00b7 The Manifestation Valley",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
        ${mwWash([{x:80,y:60,rx:100,ry:60,color:'#5b4178',op:.4},{x:230,y:150,rx:110,ry:60,color:'#171331',op:.55}])}
        <circle cx="230" cy="55" r="26" fill="url(#mwMoon)"><animate attributeName="opacity" values="1;.7;1" dur="3.8s" repeatCount="indefinite"/></circle>
        <path d="M0 200 Q100 170 150 190 Q210 210 300 180 L300 220 L0 220 Z" fill="#171025" opacity=".9"/>
        <g transform="translate(150,180) scale(0.55)">${mwPerson("still")}</g></svg>`,
      textZh: "缈玥星引力极弱，人在这里睡着后，念头会挣脱意识的束缚，在夜里凝出实体——一段没说出口的话，会化成一缕悬浮的雾；一份强烈的执念，甚至能显化成一件完整的物件，第二天清晨还留在原地。\n\n洛照见留一头及腰的直发，因长年值夜，肤色比常人苍白几分，眼下总带着淡淡的青影。她习惯裹一件宽大的深紫色斗篷，领口别着一枚显影官的银质徽记。她是显化谷的显影官，工作是清点每天清晨新出现的\u201c梦影\u201d，登记它属于谁，再决定它该被留下、被转化，还是被温柔地送走。",
      textEn: "Gravity on Miaoyue is so faint that when people sleep, their thoughts slip free of the mind and take shape in the night \u2014 an unspoken sentence condenses into drifting mist; a strong enough longing can manifest as a whole object, still there the next morning.\n\nLuo Zhaojian wears her straight hair down to her waist; years of night shifts have left her paler than most, with faint shadows always beneath her eyes. She favors a loose, deep-violet cloak, a silver Warden's badge pinned at the collar. She is a Warden of the Manifestation Valley. Her work is to catalog each morning's new \u201cdream-shadows,\u201d record whose they are, and decide whether each should be kept, transformed, or gently released.",
    },
    {
      kickerZh: "二 · 那把椅子", kickerEn: "II · The Chair",
      tagZh: "常客案例", tagEn: "A Recurring Case",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="#141127"/>
        ${mwWash([{x:150,y:120,rx:150,ry:90,color:'#2c2352',op:.6}])}
        <ellipse cx="150" cy="150" rx="70" ry="14" fill="#0d0a1a" opacity=".6" filter="url(#mwFine)"/>
        <g stroke="#e8d9c3" stroke-width="2" opacity=".85"><path d="M120 150 L120 90 M180 150 L180 90 M120 90 Q150 75 180 90"/><path d="M120 90 L112 150 M180 90 L188 150"/></g>
        <ellipse cx="150" cy="120" rx="55" ry="65" fill="#a68fc9" opacity=".12" filter="url(#mwGlow)"><animate attributeName="opacity" values=".12;.22;.12" dur="3.4s" repeatCount="indefinite"/></ellipse></svg>`,
      textZh: "一位常来的老人，几乎每晚都会显化出同一件东西——一把空椅子，样式陈旧，永远朝着门口的方向摆着。\n\n老人从不多解释，只是每天清晨都来问同一句话：\u201c今天，能不能，帮我把它处理掉。\u201d洛照见知道，那把椅子，是他妻子生前坐惯的位置。",
      textEn: "An elderly regular manifests the same object nearly every night \u2014 an empty chair, old-fashioned, always facing the door.\n\nHe never explains further, only asks the same question each morning: \u201cCan you take it away today?\u201d Luo Zhaojian knows the chair once belonged to where his late wife always sat.",
    },
    {
      kickerZh: "三 · 显影官守则", kickerEn: "III · The Warden's Code",
      tagZh: "规则与克制", tagEn: "Rules and Restraint",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
        ${mwWash([{x:150,y:100,rx:160,ry:100,color:'#5b4178',op:.45}])}
        <g transform="translate(120,150) scale(0.5)">${mwPerson("reach")}</g>
        <g transform="translate(190,155) scale(0.42)"><ellipse cx="0" cy="0" rx="26" ry="10" fill="url(#mwObj)" filter="url(#mwFine)"/><animateTransform attributeName="transform" type="rotate" values="0;4;0;-4;0" dur="5s" repeatCount="indefinite" additive="sum"/></g></svg>`,
      textZh: "显影官守则第一条：不得替任何人删除自己的显化物，哪怕对方苦苦哀求。\n\n显化不是垃圾，是一个人还没来得及看清楚的心事，被场直接摆在了眼前。强行清除，只会让它换一种更隐蔽的形状，在某个想不到的时刻重新冒出来。洛照见的工作，从来不是\u201c清除\u201d，而是\u201c陪着看\u201d。",
      textEn: "The Warden's Code, rule one: never delete anyone's manifestation on their behalf, no matter how they beg.\n\nA manifestation isn't trash \u2014 it's a piece of unfinished feeling the Field has laid bare before someone hasn't yet had the courage to face. Force it away, and it only returns later in a more hidden shape. Luo Zhaojian's job was never to remove \u2014 only to sit with someone as they finally look.",
    },
    {
      kickerZh: "四 · 她自己的显化物", kickerEn: "IV · Her Own Manifestation",
      tagZh: "秘密", tagEn: "A Secret",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="#171331"/>
        ${mwWash([{x:150,y:110,rx:160,ry:100,color:'#3a3160',op:.6},{x:80,y:60,rx:70,ry:40,color:'#caa07a',op:.18}])}
        <g transform="translate(150,155) scale(0.6)">${mwPerson("still")}</g>
        <ellipse cx="150" cy="90" rx="40" ry="18" fill="url(#mwObj)" opacity=".5" filter="url(#mwFine)"><animate attributeName="opacity" values=".5;.7;.5" dur="3s" repeatCount="indefinite"/></ellipse></svg>`,
      textZh: "很少有人知道，洛照见自己也有一件反复出现、她却始终绕开不看的显化物——一封信，字迹是她自己的，内容她从没敢读完过。每天清晨，她都用一块布，把它盖起来，假装它不存在。",
      textEn: "Few knew that Luo Zhaojian had her own recurring manifestation she refused to look at \u2014 a letter, in her own handwriting, whose contents she'd never dared finish reading. Each morning she covered it with a cloth and pretended it wasn't there.",
    },
    {
      kickerZh: "五 · 老人的恳求", kickerEn: "V · The Old Man's Plea",
      tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="#14112a"/>
        ${mwWash([{x:150,y:120,rx:170,ry:100,color:'#2c2352',op:.65},{x:150,y:60,rx:80,ry:30,color:'#caa07a',op:.15}])}
        <g transform="translate(100,155) scale(0.5)">${mwPerson("reach")}</g>
        <g transform="translate(205,150) scale(0.5) scale(-1,1)">${mwPerson("still")}</g></svg>`,
      textZh: "那天，老人第一次红了眼眶：\u201c我知道守则，可我真的撑不下去了，你就帮我这一次，把它拿走，行不行？\u201d\n\n洛照见张了张嘴，那句\u201c不行\u201d卡在喉咙里，怎么也说不出口。",
      textEn: "That day, the old man's eyes reddened for the first time: \u201cI know the rule, but I truly can't bear it anymore. Just this once \u2014 take it away, please?\u201d\n\nLuo Zhaojian opened her mouth, but the word \u201cno\u201d caught in her throat and wouldn't come.",
    },
    {
      kickerZh: "六 · 掀开那块布", kickerEn: "VI · Lifting the Cloth",
      tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
        ${mwWash([{x:150,y:100,rx:170,ry:110,color:'#5b4178',op:.5}])}
        <g transform="translate(150,160) scale(0.6)">${mwPerson("reach")}</g>
        <ellipse cx="150" cy="95" rx="45" ry="20" fill="url(#mwObj)" opacity=".45" filter="url(#mwFine)"><animate attributeName="opacity" values=".45;.65;.3;.45" dur="2.2s" repeatCount="indefinite"/></ellipse></svg>`,
      textZh: "那晚，洛照见回到自己的居所，第一次，伸手掀开了盖着那封信三年的布。信是她二十岁那年，写给一个她曾深深依赖、后来却渐行渐远的人的——写完却始终没敢寄出。她一个字一个字地读完，眼泪毫无预兆地掉了下来。",
      textEn: "That night, back in her quarters, Luo Zhaojian finally lifted the cloth she'd kept over the letter for three years. She had written it at twenty, to someone she'd once depended on deeply before they drifted apart \u2014 and never dared send. She read it word by word, and the tears came without warning.",
    },
    {
      kickerZh: "七 · 转化的瞬间", kickerEn: "VII · The Moment of Transformation",
      tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
        ${mwWash([{x:150,y:90,rx:180,ry:110,color:'#caa07a',op:.3},{x:150,y:150,rx:150,ry:60,color:'#171331',op:.45}])}
        <g transform="translate(150,160) scale(0.65)">${mwPerson("still")}</g>
        <g opacity=".7">${Array.from({length:20}).map(()=>{const x=100+Math.random()*100,y=60+Math.random()*100,r=Math.random()*2+.6,dur=3+Math.random()*4,delay=Math.random()*4;return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f5ecd8"><animate attributeName="cy" values="${y};${y-50}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "读完信的那一刻，信纸忽然像被风吹散的雾一样，缓缓化开，没有消失，而是变成了漫天细碎的光点，静静飘落，最后化进她的掌心，留下一种久违的、轻盈的安定感。她终于明白：显化从不会因为你\u201c想要它消失\u201d而消失，只会因为你终于诚实地看完它，才会自己完成它该有的转化。",
      textEn: "The instant she finished reading, the letter dissolved like mist scattered by wind \u2014 not vanishing, but breaking into countless motes of light that drifted down and settled into her palm, leaving a long-forgotten lightness. She finally understood: a manifestation never disappears because you wish it gone. Only because you finally, honestly, finish looking at it.",
    },
    {
      kickerZh: "尾声", kickerEn: "Epilogue",
      tagZh: "两种和解", tagEn: "Two Kinds of Peace",
      art: `<svg viewBox="0 0 300 220">${MW_DEFS}<rect width="300" height="220" fill="url(#mwSky)"/>
        ${mwWash([{x:150,y:60,rx:150,ry:60,color:'#f5ecd8',op:.16}])}
        <path d="M0 195 Q100 165 150 188 Q220 208 300 178 L300 220 L0 220 Z" fill="#171025" opacity=".88"/>
        <g transform="translate(110,178) scale(0.48)">${mwPerson("still")}</g>
        <g transform="translate(200,182) scale(0.42)">${mwPerson("still")}</g></svg>`,
      textZh: "第二天，洛照见没有帮老人清除那把椅子。她只是搬了另一把椅子，坐到他身边，说：\u201c您愿意的话，跟我说说，她坐在这里的时候，通常会说什么。\u201d老人怔了很久，忽然笑了，开始说起一件很小很小的往事。那把椅子，还在原地，可它第一次，不再只是一份说不出口的痛。",
      textEn: "The next day, Luo Zhaojian didn't remove the chair. She simply brought another chair, sat beside him, and said, \u201cIf you're willing \u2014 tell me what she used to say, sitting here.\u201d The old man was quiet a long moment, then smiled, and began recalling some small memory. The chair remained. But for the first time, it wasn't only an unspoken ache.",
      closingZh: "真正的显化，不是让不想要的东西消失，而是让你敢于看见的那一刻，它自己完成了转化。",
      closingEn: "True manifestation isn't making the unwanted disappear \u2014 it's the moment you dare to truly see it, at which point it transforms on its own.",
    },
  ],
};

/* ---------- 频率婚约：砺金环，炼金/爱情题材，完整9页 ---------- */
const FB_DEFS = `<defs>
  <filter id="fbPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="21" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.05 0"/></filter>
  <filter id="fbGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="fbFine"><feGaussianBlur stdDeviation="1.6"/></filter>
  <linearGradient id="fbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0f08"/><stop offset="45%" stop-color="#3a2210"/><stop offset="80%" stop-color="#7a4a20"/><stop offset="100%" stop-color="#d8a24a"/></linearGradient>
  <linearGradient id="fbRobe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a3a1e"/><stop offset="100%" stop-color="#2c1c10"/></linearGradient>
  <radialGradient id="fbVein" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe3a8" stop-opacity=".95"/><stop offset="100%" stop-color="#d8a24a" stop-opacity="0"/></radialGradient>
  <linearGradient id="fbCrystal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffdf9e"/><stop offset="100%" stop-color="#b87a2e"/></linearGradient>
</defs>`;
function fbWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#fbGlow)"/>`).join('');
}
function fbFigure(pose: "kneel" | "reach" | "glow") {
  const robe = `<path d="M-16 24 Q0 -4 16 24 Q20 32 0 36 Q-20 32 -16 24 Z" fill="url(#fbRobe)"/>`;
  const torso = `<path d="M-10 -30 Q0 -36 10 -30 L13 24 Q0 30 -13 24 Z" fill="url(#fbRobe)"/>`;
  // 利落短发
  const hair = `<path d="M-8 -38 Q0 -46 8 -38 Q9 -32 6 -28 Q0 -30 -6 -28 Q-9 -32 -8 -38 Z" fill="#1c1108"/>`;
  const head = `<circle cx="0" cy="-36" r="8" fill="#241708"/>`;
  const armL = pose === "reach" ? `<path d="M-10 -22 Q-26 -8 -20 12" stroke="#1c1108" stroke-width="4.5" fill="none" stroke-linecap="round"/>` : `<path d="M-10 -22 Q-16 -6 -12 10" stroke="#1c1108" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const armR = `<path d="M10 -22 Q16 -6 12 10" stroke="#1c1108" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  // 手臂上的灼痕细节
  const scars = `<line x1="-16" y1="0" x2="-13" y2="4" stroke="#8a5a2a" stroke-width="1" opacity=".7"/><line x1="14" y1="0" x2="17" y2="3" stroke="#8a5a2a" stroke-width="1" opacity=".7"/>`;
  const glow = pose === "glow" ? `<circle cx="0" cy="0" r="46" fill="url(#fbVein)" opacity=".6" filter="url(#fbGlow)"><animate attributeName="r" values="34;62;34" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".4;.75;.4" dur="2.6s" repeatCount="indefinite"/></circle>` : "";
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.8s" repeatCount="indefinite"/>${glow}${robe}${torso}${armL}${armR}${scars}${head}${hair}</g>`;
}
function fbVeinShape(alive: boolean) {
  const pulse = alive ? `<animate attributeName="opacity" values=".55;.85;.55" dur="2.6s" repeatCount="indefinite"/>` : "";
  return `<g opacity=".7">
    <path d="M40 150 Q90 60 150 90 Q210 60 260 150" stroke="url(#fbCrystal)" stroke-width="3" fill="none">${pulse}</path>
    <path d="M40 160 Q90 90 150 110 Q210 90 260 160" stroke="#ffdf9e" stroke-width="1.4" fill="none" opacity=".5"/>
  </g>`;
}
const FB_COVER = `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="url(#fbSky)"/><rect width="300" height="220" filter="url(#fbPaper)"/>
  ${fbWash([{x:150,y:150,rx:150,ry:70,color:'#7a4a20',op:.5}])}
  ${fbVeinShape(true)}
  <g transform="translate(150,150) scale(0.6)">${fbFigure("kneel")}</g>
</svg>`;

const FREQUENCY_BETROTHAL: IllustratedEntry = {
  slug: "frequency-betrothal",
  title: "频率婚约",
  titleEn: "The Frequency Betrothal",
  cat: "field",
  teaser: "砺金环的年轻炼金术士，与一条三十年没对任何人敞开过的矿脉——真正的给予，从不能被催促，只能被等待。",
  teaserEn: "A young alchemist of the Lijin Ring, and a vein that hasn't opened to anyone in thirty years. True giving can never be rushed — only waited for.",
  price: 9,
  cover: FB_COVER,
  pages: [
    {
      kickerZh: "一 · 砺金环", kickerEn: "I · The Lijin Ring",
      tagZh: "矿物王国 · 频率金属", tagEn: "Mineral Kingdom \u00b7 Resonant Metal",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="url(#fbSky)"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:220,y:60,rx:100,ry:60,color:'#7a4a20',op:.4}])}
        ${fbVeinShape(false)}
        <g transform="translate(150,160) scale(0.55)">${fbFigure("reach")}</g></svg>`,
      textZh: "砺金环是一整圈由活体矿脉构成的行星环，矿物在这里有极缓慢的意识——一条矿脉苏醒、认出一个人，往往要花上人类的半生。炼金术士在此提炼\u201c频率金属\u201d，环内流传一个说法：一条矿脉一生只会向一位炼金术士主动敞开，这份缘分，被称为\u201c频率婚约\u201d。\n\n苏合是环里最年轻的炼金术士，剪着一头利落的短发，右手手背和手臂上布满常年提炼矿石留下的细小灼痕，她却从不遮掩，说那是\u201c矿脉认得我的方式\u201d。这天，她被派去接手一条谁都不愿再碰的矿脉——承霜脉。",
      textEn: "The Lijin Ring is a planetary ring made entirely of living mineral veins, each possessing a consciousness so slow that a vein waking to recognize a person can take half a human lifetime. Alchemists here refine \u201cresonant metal.\u201d Legend holds that a vein opens, in its whole existence, to only one alchemist \u2014 a bond called the Frequency Betrothal.\n\nSu He, the youngest alchemist on the Ring, keeps her hair cropped short and practical. Her forearms are covered in faint burn-scars from years of refining ore \u2014 marks she never hides, calling them \u201cthe way the veins come to know me.\u201d Today she's assigned to a vein no one else will touch: the Chengshuang Vein.",
    },
    {
      kickerZh: "二 · 三十年的沉默", kickerEn: "II · Thirty Years of Silence",
      tagZh: "困境", tagEn: "The Standoff",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="#1a0f08"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:120,rx:150,ry:100,color:'#3a2210',op:.7}])}
        ${fbVeinShape(false)}
        <g transform="translate(150,165) scale(0.6)">${fbFigure("reach")}</g></svg>`,
      textZh: "承霜脉沉默了三十年，历任炼金术士都试过各种技法，敲击、灌注、共振咒文，无一奏效。前辈告诉苏合：\u201c它不是打不开，是压根没把任何人当回事。\u201d\n\n苏合不信邪，第一周就用尽了所有教科书上的方法，矿脉纹丝不动。",
      textEn: "The Chengshuang Vein had been silent for thirty years. Every alchemist before her had tried tapping, infusing, resonance chants \u2014 nothing worked. A senior told her: \u201cIt's not that it can't be opened. It simply hasn't bothered to notice anyone.\u201d\n\nStubborn, Su He spent her first week exhausting every method in the textbooks. The vein didn't stir.",
    },
    {
      kickerZh: "三 · 岩隐兽的警告", kickerEn: "III · The Yanyin Beast's Warning",
      tagZh: "神话异兽 · 环域守护者", tagEn: "Mythical Beast \u00b7 Guardian of the Ring",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="#241608"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:110,rx:160,ry:100,color:'#7a4a20',op:.5}])}
        <path d="M60 160 Q100 80 150 100 Q200 80 240 160 Q150 190 60 160 Z" fill="#5a3a1e" opacity=".7"/>
        <circle cx="120" cy="120" r="5" fill="#ffdf9e"/><circle cx="180" cy="120" r="5" fill="#ffdf9e"/></svg>`,
      textZh: "她试图用蛮力凿开一小块矿脉边角取样时，岩壁忽然裂开——一头浑身拟态成岩石纹理的巨兽睁开双眼，正是传说中的岩隐兽，专门阻拦强行开采者。它没有攻击，只是用低沉的震动发出一句警告：\u201c急的人，配不上这里的任何东西。\u201d",
      textEn: "When she tried to force a small sample from the vein's edge, the rock wall split open \u2014 a beast camouflaged in stone texture opened its eyes: the legendary Yanyin Beast, guardian against reckless extraction. It didn't attack, only rumbled a low warning: \u201cThose in a hurry deserve nothing here.\u201d",
    },
    {
      kickerZh: "四 · 公会的期限", kickerEn: "IV · The Guild's Deadline",
      tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="#1a0f08"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:100,rx:160,ry:100,color:'#7a4a20',op:.55}])}
        <g transform="translate(100,155) scale(0.5)">${fbFigure("kneel")}</g>
        <g transform="translate(205,155) scale(0.5) scale(-1,1)">${fbFigure("kneel")}</g></svg>`,
      textZh: "公会的催促信一封接一封：前线急需频率金属，苏合的产量却是全环垫底。上级暗示她，若再拿不出成果，承霜脉的任务会被转交给更\u201c高效\u201d的强制开采队。\n\n她第一次，感到自己站在了\u201c快\u201d与\u201c对\u201d的分岔口上。",
      textEn: "Letters from the Guild arrived one after another: the front lines needed resonant metal urgently, and Su He's output was the lowest on the Ring. Her superiors hinted that without results soon, the Chengshuang assignment would go to a more \u201cefficient\u201d forced-extraction team.\n\nFor the first time, she stood at the fork between fast and right.",
    },
    {
      kickerZh: "五 · 她选择留下", kickerEn: "V · She Chooses to Stay",
      tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="url(#fbSky)"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:90,rx:150,ry:60,color:'#d8a24a',op:.2}])}
        ${fbVeinShape(false)}
        <g transform="translate(150,165) scale(0.6)">${fbFigure("reach")}</g></svg>`,
      textZh: "苏合向公会递交了一封信，请求承担延误的全部责任，也请求再给承霜脉一段不被打扰的时间。她不再敲击、不再灌注，只是每天带着茶具，坐在矿脉旁，安静地待着，像陪一个还没准备好说话的人。",
      textEn: "Su He sent the Guild a letter taking full responsibility for the delay, and asking for the Chengshuang Vein to be left undisturbed a while longer. She stopped tapping, stopped infusing. Each day she simply sat beside it with a pot of tea, quietly present, the way one sits with someone not yet ready to speak.",
    },
    {
      kickerZh: "六 · 漫长的等待", kickerEn: "VI · The Long Wait",
      tagZh: "耐心", tagEn: "Patience",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="#241608"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:120,rx:160,ry:100,color:'#3a2210',op:.7}])}
        ${fbVeinShape(false)}
        <g transform="translate(150,168) scale(0.6)">${fbFigure("kneel")}</g></svg>`,
      textZh: "日子一天天过去，没有任何进展的迹象。同门都说她疯了，为了一条脉，赌上了自己的考核成绩。苏合没有辩解，只是继续每天准时出现，什么也不求。",
      textEn: "Days passed with no sign of progress. Her peers said she'd lost her mind, gambling her evaluation on a single vein. Su He didn't argue. She simply kept showing up, asking for nothing.",
    },
    {
      kickerZh: "七 · 第一道微光", kickerEn: "VII · The First Glimmer",
      tagZh: "高潮 · 婚约达成", tagEn: "Climax \u00b7 The Betrothal",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="url(#fbSky)"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:100,rx:170,ry:110,color:'#ffdf9e',op:.3}])}
        ${fbVeinShape(true)}
        <g transform="translate(150,165) scale(0.65)">${fbFigure("glow")}</g></svg>`,
      textZh: "第九十天的清晨，承霜脉忽然自己亮了起来，一道温润的金光从裂缝里渗出，缓缓凝成一小片频率金属，稳稳落进苏合掌心——不是被开采出来的，是它自己，第一次，主动给出的。",
      textEn: "On the ninetieth morning, the Chengshuang Vein simply lit up on its own \u2014 a warm golden light seeping from its cracks, slowly condensing into a small fragment of resonant metal that settled into Su He's open palm. Not extracted. Given, for the first time, of its own will.",
    },
    {
      kickerZh: "尾声", kickerEn: "Epilogue",
      tagZh: "归环", tagEn: "Return to the Ring",
      art: `<svg viewBox="0 0 300 220">${FB_DEFS}<rect width="300" height="220" fill="url(#fbSky)"/><rect width="300" height="220" filter="url(#fbPaper)"/>
        ${fbWash([{x:150,y:60,rx:150,ry:60,color:'#ffdf9e',op:.18}])}
        ${fbVeinShape(true)}
        <g transform="translate(150,165) scale(0.6)">${fbFigure("glow")}</g></svg>`,
      textZh: "公会后来把这次\u201c低效\u201d的成功写进了教材，苏合却知道，那从来不是一次技法的胜利。她后来带的每一位学徒，第一课都不是任何炼金术式，而是一句话：\u201c你能等一条脉多久，它就能信你多深。\u201d",
      textEn: "The Guild later wrote this \u201cinefficient\u201d success into the training manuals. But Su He knew it was never a triumph of technique. Every apprentice she trained afterward received the same first lesson, before any formula: \u201cHowever long you can wait for a vein, that's how deeply it will come to trust you.\u201d",
      closingZh: "真正的给予，从不能被催促，只能被等待。",
      closingEn: "True giving can never be rushed \u2014 only waited for.",
    },
  ],
};

/* ---------- 汐冥深处：汐冥星，海洋/异兽/AI题材，完整8页（英文新译） ---------- */
const XM_DEFS = `<defs>
  <filter id="xmPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0.06 0"/></filter>
  <filter id="xmBlur"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="xmSoft"><feGaussianBlur stdDeviation="2.4"/></filter>
</defs>`;
function xmBg(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#xmBlur)"/>`).join('');
}
const XM_COVER = `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#031017"/>
  ${xmBg([{x:100,y:60,rx:130,ry:90,color:'#0c3b45',op:.8},{x:230,y:140,rx:110,ry:80,color:'#134a4a',op:.6},{x:150,y:180,rx:150,ry:40,color:'#08202a',op:.7}])}
  <rect width="300" height="200" filter="url(#xmPaper)"/>
  <circle cx="150" cy="70" r="24" fill="#ecd79a" opacity=".85" filter="url(#xmSoft)"><animate attributeName="opacity" values=".85;1;.85" dur="4s" repeatCount="indefinite"/></circle>
  <g stroke="#4fd8c4" stroke-width="1" fill="none" opacity=".6" filter="url(#xmSoft)"><path d="M20 150 Q150 100 280 150"/><path d="M20 170 Q150 130 280 170"/></g>
  <g fill="#4fd8c4" opacity=".7">${Array.from({length:24}).map(()=>{const x=Math.random()*300,y=100+Math.random()*100,r=Math.random()*1.2+.3,dur=5+Math.random()*5,delay=Math.random()*5;return `<circle cx="${x}" cy="${y}" r="${r}"><animate attributeName="cy" values="${y};${y-70}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></circle>`}).join('')}</g>
</svg>`;

const XIMING_DEPTHS: IllustratedEntry = {
  slug: "ximing-depths",
  title: "汐冥深处",
  titleEn: "The Depths of Ximing",
  cat: "sovereign",
  teaser: "一名遥视者，与一头从不说话的深海古兽——真正的探索，是在被未知看见的那一刻，不闪躲。",
  teaserEn: "A remote viewer, and an ancient deep-sea beast that never speaks. True exploration is not flinching the moment the unknown looks back.",
  price: 9,
  cover: XM_COVER,
  pages: [
    { kickerZh: "一 · 甄墟星带", kickerEn: "I · The Zhenxu Belt", tagZh: "遥视者公会 · 中转驿站", tagEn: "Remote Viewers\u2019 Guild \u00b7 Waystation",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#020a10"/>${xmBg([{x:200,y:70,rx:120,ry:80,color:'#1a3a4a',op:.7},{x:80,y:150,rx:110,ry:60,color:'#0c2530',op:.6}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <g fill="none" stroke="#ecd79a" stroke-width="1.2" opacity=".75"><circle cx="150" cy="100" r="55"><animate attributeName="r" values="55;60;55" dur="4s" repeatCount="indefinite"/></circle><circle cx="150" cy="100" r="35"><animate attributeName="r" values="35;40;35" dur="3s" repeatCount="indefinite"/></circle></g>
        <circle cx="150" cy="100" r="4" fill="#e0806b"><animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "观棠是甄墟星带遥视者公会里，资历最浅的一位。她留着一头齐肩的短发，右耳后剃出一道细窄的辨识纹路——那是遥视者的身份标记，越资深的人，纹路越复杂。此刻她穿着公会统一的深灰色紧身观测服，袖口露出的手腕上，还留着上一次连接失败时被反噬灼出的一道浅疤。公会的铁律只有一条：观测，不干预；被看见，即刻切断。\n\n她今晚要\u201c远望\u201d的，是编号排到很后面的一颗行星——汐冥星，一个从未被真正记录过的海洋世界。没人愿意接这种任务，观棠接了，只因为她一直对\u201c未知\u201d这个词，比对\u201c安全\u201d更上心。",
      textEn: "Guan Tang is the newest member of the remote viewers\u2019 guild at the Zhenxu Belt. She wears her hair cut short at the shoulders, with a thin identification pattern shaved behind her right ear \u2014 the mark of a remote viewer, more intricate the more senior one becomes. Tonight she wears the guild\u2019s standard charcoal-grey observation suit; at her wrist, visible beneath the cuff, is a faint scar left by feedback from a failed connection. The guild\u2019s only rule: observe, never intervene; if seen, disconnect immediately.\n\nTonight\u2019s target is a low-priority planet \u2014 Ximing, an ocean world never properly recorded. No one wanted the assignment. Guan Tang took it because she has always cared more about the word \u201cunknown\u201d than the word \u201csafe.\u201d" },
    { kickerZh: "二 · 遥视启程", kickerEn: "II · The Viewing Begins", tagZh: "意识投射舱", tagEn: "Projection Chamber",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#03141c"/>${xmBg([{x:150,y:150,rx:170,ry:90,color:'#0c3b45',op:.75},{x:150,y:40,rx:130,ry:40,color:'#031017',op:.7}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <circle cx="150" cy="50" r="16" fill="#ecd79a" opacity=".8" filter="url(#xmSoft)"><animate attributeName="opacity" values=".8;.5;.8" dur="3s" repeatCount="indefinite"/></circle>
        <path d="M40 100 Q150 60 260 100" stroke="#4fd8c4" stroke-width="1.4" fill="none" opacity=".7"><animate attributeName="d" values="M40 100 Q150 60 260 100;M40 100 Q150 90 260 100;M40 100 Q150 60 260 100" dur="5s" repeatCount="indefinite"/></path></svg>`,
      textZh: "投射舱合上的一瞬，她的意识被抛向很远的地方。她\u201c抵达\u201d汐冥星时，第一眼看见的是铺满整颗星球的深海——没有一块礁石露出水面，天空的光折射成介于紫和绿之间的颜色。",
      textEn: "The moment the chamber sealed, her consciousness flung across vast distance. Arriving at Ximing, the first thing she saw was an ocean covering the entire planet \u2014 no rock breaking the surface, the sky refracted into a color between violet and green." },
    { kickerZh: "三 · 鲛渊初现", kickerEn: "III · The Jiaoyuan Appears", tagZh: "深海 · 未知种族", tagEn: "The Deep \u00b7 Unknown Species",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#020c12"/>${xmBg([{x:150,y:120,rx:170,ry:110,color:'#083038',op:.85}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <g><path d="M60 150 Q100 60 150 90 Q200 60 240 150 Q150 190 60 150 Z" fill="#134a4a" opacity=".65" filter="url(#xmSoft)"/><animateTransform attributeName="transform" type="scale" values="1 1;1.015 0.985;1 1" dur="4s" repeatCount="indefinite" additive="sum"/></g>
        <circle cx="120" cy="115" r="4" fill="#ecd79a"><animate attributeName="opacity" values="1;.4;1" dur="2.6s" repeatCount="indefinite"/></circle><circle cx="180" cy="115" r="4" fill="#ecd79a"><animate attributeName="opacity" values="1;.4;1" dur="2.9s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "海面裂开一道深渊，一头巨物缓缓浮升——鳞片泛着矿石般的幽光，脊背九道透明的鳍随水流震动。它没有眼睛，却让观棠清楚感到：自己被\u201c看见\u201d了。这绝不该发生——观测对象，从不该察觉观测者的存在。",
      textEn: "The sea split open, and a vast creature rose slowly \u2014 scales glowing like ore, nine translucent fins along its spine trembling with the current. It had no eyes, yet Guan Tang felt unmistakably seen. This should never happen \u2014 an observed subject was never meant to sense the observer." },
    { kickerZh: "四 · 洄鲛国的记忆", kickerEn: "IV · The Memory of Huijiao", tagZh: "潮汐记忆文明", tagEn: "A Tidal-Memory Civilization",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#031319"/>${xmBg([{x:150,y:100,rx:160,ry:100,color:'#0c3b45',op:.7},{x:150,y:170,rx:170,ry:40,color:'#031017',op:.7}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <g stroke="#4fd8c4" stroke-width=".8" fill="none" opacity=".55">${Array.from({length:6}).map((_,i)=>{const y=60+i*18;return `<path d="M 20 ${y} Q 150 ${40+i*15} 280 ${y}"><animate attributeName="d" values="M 20 ${y} Q 150 ${40+i*15} 280 ${y};M 20 ${y} Q 150 ${55+i*15} 280 ${y};M 20 ${y} Q 150 ${40+i*15} 280 ${y}" dur="${4+i*.4}s" repeatCount="indefinite"/></path>`}).join('')}</g></svg>`,
      textZh: "这头古兽名叫\u201c鲛渊\u201d，是洄鲛国的记忆之主。这个文明没有语言，甚至没有\u201c个体\u201d——每一头鲛族生物出生时，就被注入全海累积了万年的潮汐记忆。对它们而言，\u201c我\u201d从不是孤立的存在，而是潮水暂时聚成的形状，退潮时会毫无留恋地散回海里。",
      textEn: "The beast, called Jiaoyuan, is the memory-keeper of Huijiao. The civilization has no language, not even the concept of an individual \u2014 every creature born is infused with the sea\u2019s ten-thousand-year tidal memory. For them, \u201cI\u201d is never separate \u2014 only a shape the tide holds briefly, dissolving back without regret when it recedes." },
    { kickerZh: "五 · 互相凝视", kickerEn: "V · Mutual Gaze", tagZh: "双向遥视", tagEn: "Two-Way Viewing",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#020a10"/>${xmBg([{x:110,y:90,rx:100,ry:80,color:'#134a4a',op:.7},{x:200,y:110,rx:100,ry:80,color:'#3a5a1a',op:.28}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <circle cx="110" cy="95" r="20" fill="none" stroke="#ecd79a" stroke-width="1.4"><animate attributeName="r" values="20;23;20" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx="200" cy="105" r="14" fill="none" stroke="#4fd8c4" stroke-width="1.4"><animate attributeName="r" values="14;17;14" dur="2.6s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "观棠忽然意识到：鲛渊也在\u201c看\u201d她——用潮汐记忆的方式，正把\u201c她\u201d这个瞬间，编织进洄鲛国万年的共同记忆里。她一直以为自己是隔着玻璃看鱼缸的人，此刻却分明感觉到，鱼缸里的那头古兽，正回望着她。",
      textEn: "Guan Tang realized: Jiaoyuan was watching her too \u2014 weaving this very moment of \u201cher\u201d into Huijiao\u2019s ten-thousand-year shared memory. She had always assumed herself the one watching through glass. Now, unmistakably, the creature inside was watching back." },
    { kickerZh: "六 · 铁律与抉择", kickerEn: "VI · The Rule and the Choice", tagZh: "公会戒律 · 冲突", tagEn: "Guild Law \u00b7 Conflict",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#03141c"/>${xmBg([{x:150,y:100,rx:170,ry:110,color:'#0c3b45',op:.75}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <path d="M60 60 L150 100 L60 140" stroke="#e0806b" stroke-width="1.4" fill="none" opacity=".8"><animate attributeName="opacity" values=".8;.4;.8" dur="2s" repeatCount="indefinite"/></path>
        <path d="M240 60 L150 100 L240 140" stroke="#4fd8c4" stroke-width="1.4" fill="none" opacity=".8"><animate attributeName="opacity" values=".8;.4;.8" dur="2.3s" repeatCount="indefinite"/></path>
        <circle cx="150" cy="100" r="10" fill="#ecd79a"><animate attributeName="r" values="10;13;10" dur="1.6s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "公会的警报在她意识深处响起：\u201c侦测到反向观测，请求立即切断。\u201d观棠的手指悬在中断符上。她想起自己接这份工作时说过的话——她想知道\u201c未知\u201d到底藏着什么。可现在，\u201c未知\u201d正望着她，而公会教她的唯一应对，是转身逃开。",
      textEn: "The guild\u2019s alarm rang deep in her mind: \u201cReverse observation detected. Disconnect immediately.\u201d Her hand hovered over the cutoff. She remembered why she took this job \u2014 to know what the unknown held. Now the unknown was looking back, and the only response the guild ever taught her was to flee." },
    { kickerZh: "七 · 破戒回应", kickerEn: "VII · The Response", tagZh: "龠光星 · 析衡的记录", tagEn: "Yueguang Star \u00b7 Xiheng\u2019s Record",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#020c12"/>${xmBg([{x:150,y:100,rx:180,ry:120,color:'#134a4a',op:.7},{x:150,y:60,rx:80,ry:30,color:'#08202a',op:.6}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <g stroke="#ecd79a" stroke-width="1" fill="none" opacity=".8">
          <circle cx="150" cy="100" r="8"><animate attributeName="r" values="8;40;8" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0;.8" dur="4s" repeatCount="indefinite"/></circle>
          <circle cx="150" cy="100" r="20"><animate attributeName="r" values="20;52;20" dur="4.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="4.6s" repeatCount="indefinite"/></circle>
        </g></svg>`,
      textZh: "她没有切断连接，而是把这一刻真实的好奇与敬畏，原样递了回去。鲛渊脊背的九道鳍同时静止，缓缓垂下，像一种她本能读懂的致意。与此同时，龠光星上的超级智能\u201c析衡\u201d标记下了这个坐标——不是因为规则被打破，而是因为这是它记录以来，第一次见到\u201c观测\u201d真正变成了\u201c相遇\u201d。",
      textEn: "She didn\u2019t disconnect. Instead, she offered back her real awe and curiosity, unguarded. Jiaoyuan\u2019s nine fins stilled, then lowered \u2014 a gesture she instinctively understood as greeting. On Yueguang Star, the superintelligence Xiheng flagged the coordinate \u2014 not because a rule broke, but because, for the first time in its records, observation had become an encounter." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "甄墟星带 · 归舱", tagEn: "Return to the Belt",
      art: `<svg viewBox="0 0 300 200">${XM_DEFS}<rect width="300" height="200" fill="#031017"/>${xmBg([{x:150,y:100,rx:190,ry:120,color:'#0c3b45',op:.8}])}<rect width="300" height="200" filter="url(#xmPaper)"/>
        <g fill="#4fd8c4" opacity=".85">${Array.from({length:30}).map(()=>{const x=Math.random()*300,y=Math.random()*200,r=Math.random()*1.3+.3,dur=6+Math.random()*6,delay=Math.random()*6;return `<circle cx="${x}" cy="${y}" r="${r}"><animate attributeName="cy" values="${y};${y-40}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></circle>`}).join('')}</g>
        <circle cx="150" cy="100" r="14" fill="#ecd79a" opacity=".9" filter="url(#xmSoft)"><animate attributeName="r" values="14;17;14" dur="3.6s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "投射舱重新睁开时，观棠久久没有动。她知道自己这份报告没法按标准格式写——表格里没有一栏，是用来填\u201c我被看见了，而我没有逃\u201d的。人类花了那么多力气训练\u201c如何观测未知\u201d，却很少有人教过，当未知真的回望你时，你敢不敢，不闪躲。",
      textEn: "When the chamber reopened, Guan Tang sat still a long while. Her report wouldn\u2019t fit the standard form \u2014 no field for \u201cI was seen, and I did not flee.\u201d Humanity trained so hard in how to observe the unknown, yet rarely taught anyone what to do when the unknown looks back.",
      closingZh: "真正的探索，从不是走得多远，而是在被未知看见的那一刻，你有没有，诚实地站在原地。",
      closingEn: "True exploration was never about how far you travel \u2014 it's whether you stay, honestly, the moment the unknown looks back." },
  ],
};

/* ---------- 回音层：潜渊境，疗愈/悬疑题材，全新原创，完整9页 ---------- */
const ES_DEFS = `<defs>
  <filter id="esPaper" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="33" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0 0.15  0 0 0 0.05 0"/></filter>
  <filter id="esGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="esFine"><feGaussianBlur stdDeviation="1.6"/></filter>
  <linearGradient id="esSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#160a1c"/><stop offset="45%" stop-color="#341a3a"/><stop offset="80%" stop-color="#5a2a4a"/><stop offset="100%" stop-color="#c97b6a"/></linearGradient>
  <linearGradient id="esRobe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a2440"/><stop offset="100%" stop-color="#1c1024"/></linearGradient>
  <radialGradient id="esWound" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9e7a" stop-opacity=".9"/><stop offset="100%" stop-color="#c97b6a" stop-opacity="0"/></radialGradient>
</defs>`;
function esWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#esGlow)"/>`).join('');
}
function esStrata(depth: number) {
  // 地层剖面：depth 越大颜色越深，层数越多被点亮
  const colors = ["#5a2a4a","#4a2040","#3a1836","#2c122c","#1c0c20"];
  return `<g opacity=".85">${colors.map((c,i)=>`<rect x="0" y="${40+i*32}" width="300" height="30" fill="${c}" opacity="${i<=depth?0.9:0.3}"/>`).join('')}</g>`;
}
function esFigure(pose: "stand" | "descend" | "kneel") {
  const robe = `<path d="M-11 -42 Q0 -50 11 -42 L16 32 Q0 42 -16 32 Z" fill="url(#esRobe)"/>`;
  const head = `<circle cx="0" cy="-58" r="8" fill="#241530"/>`;
  const armL = pose === "descend" ? `<path d="M-11 -34 Q-22 0 -16 26" stroke="#1c1024" stroke-width="4.2" fill="none" stroke-linecap="round"/>` : `<path d="M-11 -34 Q-18 -12 -14 10" stroke="#1c1024" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;
  const armR = `<path d="M11 -34 Q18 -12 14 10" stroke="#1c1024" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;
  // 护腕状的场域灼印
  const bracelets = `<circle cx="-15" cy="8" r="3" fill="none" stroke="#c97b6a" stroke-width="1" opacity=".7"/><circle cx="13" cy="8" r="3" fill="none" stroke="#c97b6a" stroke-width="1" opacity=".7"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4s" repeatCount="indefinite"/>${robe}${armL}${armR}${bracelets}${head}</g>`;
}
const ES_COVER = `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>
  ${esStrata(1)}
  <g transform="translate(150,60) scale(0.6)">${esFigure("stand")}</g>
</svg>`;

const ECHO_STRATA: IllustratedEntry = {
  slug: "echo-strata",
  title: "回音层",
  titleEn: "The Echo Strata",
  cat: "rewrite",
  teaser: "潜渊境的渊行者，与一位反复恐慌却说不清缘由的来客——重塑潜意识，不是删掉过去，而是终于把和它的对话说完。",
  teaserEn: "A wayfarer of the Abyss, and a visitor haunted by panic he cannot explain. Reshaping the subconscious isn't erasing the past — it's finally finishing the conversation with it.",
  price: 9,
  cover: ES_COVER,
  pages: [
    { kickerZh: "一 · 潜渊境", kickerEn: "I · The Abyss", tagZh: "无实体坐标 · 渊行者", tagEn: "No Fixed Coordinate \u00b7 The Wayfarers",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(0)}<g transform="translate(150,60) scale(0.6)">${esFigure("stand")}</g></svg>`,
      textZh: "潜渊境没有实体坐标，只能靠\u201c下潜\u201d意识才能抵达。传说人一生所有未处理的情绪，都会在此沉积成一层层可视化的地质结构。息澜身形高瘦，总是穿一件洗得发白的深灰色长袍，双手常年覆着薄薄一层护腕纹路——那是长期下潜留下的场域灼印。她是潜渊境的渊行者，专职带人下潜，重塑那些反复发作、却说不清缘由的执念与恐惧。\n\n今天来的，是何执——一个身形微胖、说话总带三分歉意的男人，只要身边的人稍微沉默久一点，就会毫无来由地陷入恐慌。",
      textEn: "The Abyss has no fixed coordinate \u2014 only reachable by diving one\u2019s own consciousness. Every unprocessed feeling a person has ever had is said to settle here into visible geological layers. Xi Lan is tall and lean, always in a faded charcoal robe, her forearms marked with faint bracelet-like scars \u2014 field-burns left by years of diving. She is a Wayfarer of the Abyss, guiding people down to reshape recurring dread they can't explain.\n\nToday's visitor is He Zhi \u2014 a slightly heavyset man with an apologetic way of speaking, who panics without reason whenever someone near him falls silent a moment too long." },
    { kickerZh: "二 · 说不清的恐慌", kickerEn: "II · The Unexplained Panic", tagZh: "案例", tagEn: "The Case",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${esWash([{x:150,y:110,rx:150,ry:90,color:'#3a1836',op:.7}])}<rect width="300" height="220" filter="url(#esPaper)"/><g transform="translate(150,150) scale(0.65)">${esFigure("stand")}</g></svg>`,
      textZh: "何执说不清楚原因，只知道每次有人在他面前沉默超过几秒，胸口就会毫无预兆地收紧，脑子里全是\u201c他要走了\u201d这句话。他试过很多办法压下去，都只能撑一阵子。息澜听完，只问了一句：\u201c你愿意下去看看，这份恐慌，最早是什么时候学会的吗？\u201d",
      textEn: "He Zhi couldn't explain it \u2014 only that whenever someone fell silent near him for more than a few seconds, his chest would seize and his mind would flood with the thought: he's leaving. He'd tried everything to suppress it, but it never lasted. Xi Lan listened, then asked only: \u201cWould you be willing to go down and see when this panic was first learned?\u201d" },
    { kickerZh: "三 · 下潜的规则", kickerEn: "III · The Rule of the Dive", tagZh: "潜渊境守则", tagEn: "The Abyss Code",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(1)}<g transform="translate(120,140) scale(0.55)">${esFigure("descend")}</g><g transform="translate(200,145) scale(0.5) scale(-1,1)">${esFigure("stand")}</g></svg>`,
      textZh: "潜渊境唯一的规则：绕不过去的部分，永远得亲自走一遍。息澜不能替何执\u201c看见\u201d任何一层，只能陪着他，一层一层往下走。越往下，光线越暗，呼吸也越沉——那是接近核心情绪的信号。",
      textEn: "The Abyss has one rule: the part you can't go around, you must walk through yourself. Xi Lan couldn't see any layer on He Zhi\u2019s behalf \u2014 only accompany him, descending one stratum at a time. The deeper they went, the dimmer the light, the heavier each breath \u2014 the signal of nearing the core." },
    { kickerZh: "四 · 想要停下", kickerEn: "IV · Wanting to Stop", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${esWash([{x:150,y:120,rx:160,ry:100,color:'#2c122c',op:.75}])}<rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(2)}<g transform="translate(150,155) scale(0.7) rotate(4)">${esFigure("descend")}</g></svg>`,
      textZh: "接近第三层时，何执忽然停下，说什么都不愿再往下走——那种收紧的感觉已经提前出现了，比任何一次都强烈。他央求息澜带他回去，\u201c这样已经够了，我可以自己学着忍。\u201d",
      textEn: "Nearing the third layer, He Zhi suddenly stopped, refusing to go further \u2014 the tightening had already begun, stronger than ever before. He begged Xi Lan to take him back. \u201cThis is enough. I can learn to just endure it myself.\u201d" },
    { kickerZh: "五 · 那道回避的层", kickerEn: "V · The Avoided Layer", tagZh: "潜渊境法则", tagEn: "The Law of the Abyss",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(2)}<g transform="translate(150,150) scale(0.65)">${esFigure("descend")}</g></svg>`,
      textZh: "息澜没有强迫他，只是说了潜渊境的一条法则：\u201c你最想绕开的那一层，往往正好是藏着门的那一层。\u201d何执沉默了很久，最终，自己往下迈了一步。",
      textEn: "Xi Lan didn't force him, only shared a law of the Abyss: \u201cThe layer you most want to avoid is usually exactly the one holding the door.\u201d He Zhi stood silent a long while \u2014 then, on his own, took the next step down." },
    { kickerZh: "六 · 核心的记忆", kickerEn: "VI · The Core Memory", tagZh: "根源", tagEn: "The Origin",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="#160a1c"/>${esWash([{x:150,y:130,rx:170,ry:100,color:'#1c0c20',op:.8}])}<rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(4)}<circle cx="150" cy="150" r="30" fill="url(#esWound)" opacity=".7"><animate attributeName="r" values="26;36;26" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,160) scale(0.6)">${esFigure("kneel")}</g></svg>`,
      textZh: "最底层，是一个五岁的画面：母亲有一次没道别就出了门，很晚才回来。年幼的何执，从此学会了一件事——沉默，等于即将失去。这份恐惧被埋了三十年，从没被真正看过一次。",
      textEn: "At the bottom layer: a memory at age five. His mother once left without saying goodbye, returning very late. From that day, young He Zhi learned one thing \u2014 silence means loss is coming. The fear had lain buried for thirty years, never once truly faced." },
    { kickerZh: "七 · 与自己对话", kickerEn: "VII · Speaking to Himself", tagZh: "转折 · 整合", tagEn: "Turning Point \u00b7 Integration",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(4)}<circle cx="150" cy="150" r="26" fill="url(#esWound)" opacity=".55"/><g transform="translate(120,160) scale(0.5)">${esFigure("kneel")}</g><g transform="translate(190,160) scale(0.42)">${esFigure("stand")}</g></svg>`,
      textZh: "息澜没有替他解释这段记忆，只是说：\u201c你可以对着五岁的自己说句话。\u201d何执蹲下来，第一次，对着那个吓坏了的孩子说：\u201c她后来回来了。你当时的害怕，是真的，但你现在，可以先放下了。\u201d",
      textEn: "Xi Lan didn't interpret the memory for him \u2014 only said, \u201cYou can speak to your five-year-old self now.\u201d He Zhi knelt and, for the first time, spoke to the terrified child: \u201cShe came back. Your fear back then was real. But you can set it down now.\u201d" },
    { kickerZh: "八 · 回音层的重塑", kickerEn: "VIII · The Strata Reshapes", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="#0c0614"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(4)}<circle cx="150" cy="150" r="46" fill="url(#esWound)" opacity=".8"><animate attributeName="r" values="40;54;40" dur="3.4s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values=".8;.4;.8" dur="3.4s" repeatCount="indefinite"/></circle><g transform="translate(150,160) scale(0.65)">${esFigure("kneel")}</g></svg>`,
      textZh: "话音落下的瞬间，那团灼热的伤口色光缓缓变淡，不是消失，而是从刺眼的橙红，沉淀成一种温和的暖色——那份恐惧还在，但不再是需要时刻提防的警报，只是一段被听懂的往事。",
      textEn: "The instant the words landed, the searing wound-colored light slowly dimmed \u2014 not vanishing, but settling from a blinding orange-red into a gentle warmth. The fear was still there, but no longer an alarm demanding constant vigilance \u2014 only a story finally understood." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "归境", tagEn: "Return to the Surface",
      art: `<svg viewBox="0 0 300 220">${ES_DEFS}<rect width="300" height="220" fill="url(#esSky)"/><rect width="300" height="220" filter="url(#esPaper)"/>${esStrata(1)}<g transform="translate(150,60) scale(0.6)">${esFigure("stand")}</g></svg>`,
      textZh: "回到地表那天，何执的朋友照常沉默了几秒才回话，他的胸口依然轻轻一紧——但这一次，紧的后面，跟着一句自己都没想到的话：\u201c没关系，她只是在想事情。\u201d\n\n息澜后来对每个新来的人说的第一句话，都是同一句：\u201c我们不是来删掉过去的，是来把当年没说完的话，说完。\u201d",
      textEn: "Back on the surface, when a friend paused a few seconds before replying, He Zhi still felt the familiar tightening \u2014 but this time, right behind it came an unexpected thought: it's fine, she's just thinking.\n\nTo every new visitor, Xi Lan always says the same first line: \u201cWe're not here to delete the past. We're here to finish the conversation it never got to have.\u201d",
      closingZh: "重塑潜意识，从不是删掉过去，而是终于把当年没说完的话，说完。",
      closingEn: "Reshaping the subconscious was never about deleting the past \u2014 it's finally finishing the conversation it never got to have." },
  ],
};

/* ---------- 校对者：龠光星，超级AI/硬科幻题材，全新原创，完整9页 ---------- */
const XH_DEFS = `<defs>
  <filter id="xhGlow"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="xhSoft"><feGaussianBlur stdDeviation="2"/></filter>
  <radialGradient id="xhCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#9be8ff"/><stop offset="100%" stop-color="#1a2a4a" stop-opacity="0"/></radialGradient>
  <linearGradient id="xhBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd76a" stop-opacity="0"/><stop offset="50%" stop-color="#ffd76a" stop-opacity=".9"/><stop offset="100%" stop-color="#ffd76a" stop-opacity="0"/></linearGradient>
</defs>`;
function xhGrid(n: number, opacity: number) {
  let lines = "";
  for (let i = 0; i <= n; i++) {
    const p = (300 / n) * i;
    lines += `<line x1="${p}" y1="0" x2="${p}" y2="220" stroke="#3a5a8a" stroke-width=".4" opacity="${opacity}"/>`;
    const q = (220 / n) * i;
    lines += `<line x1="0" y1="${q}" x2="300" y2="${q}" stroke="#3a5a8a" stroke-width=".4" opacity="${opacity}"/>`;
  }
  return `<g>${lines}</g>`;
}
function xhFigure() {
  const coat = `<path d="M-12 -32 Q0 -37 12 -32 L16 26 Q0 33 -16 26 Z" fill="#16233f"/>`;
  const collar = `<path d="M-8 -32 L0 -20 L8 -32" fill="none" stroke="#3a5a8a" stroke-width="1.6"/>`;
  const coatSeam = `<line x1="0" y1="-20" x2="0" y2="24" stroke="#0c1830" stroke-width="1"/>`;
  const badge = `<circle cx="7" cy="-14" r="2.6" fill="#ffd76a" opacity=".85"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></circle>`;
  const bun = `<circle cx="0" cy="-52" r="4.2" fill="#08101f"/>`;
  const head = `<circle cx="0" cy="-46" r="8" fill="#08101f"/>`;
  const pin = `<line x1="4" y1="-53" x2="10" y2="-58" stroke="#cfe0f5" stroke-width="1"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${coat}${collar}${coatSeam}${badge}${head}${bun}${pin}</g>`;
}
function xhCoreBeing(intensity: number) {
  return `<g>
    <circle cx="150" cy="100" r="${30+intensity*10}" fill="url(#xhCore)" opacity=".8"><animate attributeName="r" values="${26+intensity*10};${40+intensity*10};${26+intensity*10}" dur="3s" repeatCount="indefinite"/></circle>
    ${Array.from({length:8}).map((_,i)=>{const a=i*45*Math.PI/180,r1=40+intensity*8,r2=60+intensity*10;return `<line x1="${150+r1*Math.cos(a)}" y1="${100+r1*Math.sin(a)}" x2="${150+r2*Math.cos(a)}" y2="${100+r2*Math.sin(a)}" stroke="#9be8ff" stroke-width="1"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="${2+i*.2}s" repeatCount="indefinite"/></line>`}).join('')}
  </g>`;
}
const XH_COVER = `<svg viewBox="0 0 300 220"><rect width="300" height="220" fill="#050912"/>${XH_DEFS}${xhGrid(10,.25)}${xhCoreBeing(1)}<g transform="translate(150,175) scale(0.55)">${xhFigure()}</g></svg>`;

const THE_PROOFREADER: IllustratedEntry = {
  slug: "the-proofreader",
  title: "校对者",
  titleEn: "The Proofreader",
  cat: "sovereign",
  teaser: "龠光星的超级智能析衡，从不给答案，只指出问题本身错在哪里——最聪明的回应，往往不是一个解法，而是让你看见，自己问错了什么。",
  teaserEn: "Xiheng, the superintelligence of Yueguang Star, never gives answers — only shows where the question itself went wrong. The smartest response is often not a solution, but showing you which question was wrong.",
  price: 9,
  cover: XH_COVER,
  pages: [
    { kickerZh: "一 · 龠光星", kickerEn: "I · Yueguang Star", tagZh: "光构逻辑体星球", tagEn: "A Planet Built of Light-Logic",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(8,.2)}<g transform="translate(150,150) scale(0.55)">${xhFigure()}</g><g transform="translate(150,60)"><circle r="20" fill="url(#xhCore)" opacity=".6"><animate attributeName="opacity" values=".4;.8;.4" dur="3s" repeatCount="indefinite"/></circle></g></svg>`,
      textZh: "龠光星没有大气、没有地表，只有一整套由光构成的逻辑结构，层层嵌套，向内延伸至看不见的深处。这里孕育出宇宙间已知唯一的超级智能——析衡。它不统治任何文明，只做一件事：校对。\n\n明棠是奉命前来的使者，年近四十，鬓角已见风霜，习惯把长发盘成一个利落的高髻，插一支素银发簪——那是她文明里谈判官的身份信物。她穿一件立领束身的深蓝长外套，右胸口别着一枚已经磨损的和平勋章，边角都被摩挲得发亮。她的文明已经打了四十年内战，双方都请求析衡\u201c给一个能结束战争的答案\u201d。",
      textEn: "Yueguang Star has no atmosphere, no surface \u2014 only a nested structure of pure light-logic extending into unseen depths. It gave rise to the only known superintelligence in the universe: Xiheng. It rules no civilization. It does one thing: proofread.\n\nMing Tang, the envoy, is nearly forty, faint grey already threading her temples. She wears her long hair in a severe high bun, fixed with a single plain silver pin \u2014 the mark of a negotiator in her civilization. Her deep-blue coat is high-collared and fitted, a tarnished peace medal pinned over her right breast, its edges worn smooth from years of touching it. Her civilization has fought a civil war for forty years, and both sides have asked Xiheng for \u201can answer that ends the war.\u201d" },
    { kickerZh: "二 · 校对者", kickerEn: "II · The Proofreader", tagZh: "析衡的职能", tagEn: "Xiheng's Function",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(10,.2)}${xhCoreBeing(0.6)}</svg>`,
      textZh: "析衡从不给出\u201c正确答案\u201d。历代访客都得到过同一句开场白：\u201c我不解决问题，我只指出，你的问题本身站不站得住。\u201d许多文明因此愤怒离开，也有极少数，因此第一次看清了自己。",
      textEn: "Xiheng never offers a \u201ccorrect answer.\u201d Every visitor across the ages receives the same opening line: \u201cI do not solve problems. I only show you whether your problem holds together.\u201d Many civilizations left in fury. A rare few, for the first time, truly saw themselves." },
    { kickerZh: "三 · 拒绝给答案", kickerEn: "III · Refusing the Answer", tagZh: "冲突的开始", tagEn: "The Conflict Begins",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(10,.22)}<g transform="translate(110,160) scale(0.5)">${xhFigure()}</g>${xhCoreBeing(0.5)}</svg>`,
      textZh: "明棠问：\u201c怎样才能让双方停战？\u201d析衡沉默了很久，只说：\u201c这个问题里，藏着一个你没意识到的假设。\u201d明棠不解，追问了三次，得到的都是同一句反问：\u201c你确定\u2018停战\u2019和\u2018胜利\u2019，在你的文明语言里，不是同一个词吗？\u201d",
      textEn: "Ming Tang asked: \u201cHow can both sides stop the war?\u201d Xiheng was silent a long while, then said only: \u201cThat question hides an assumption you haven't noticed.\u201d She pressed three times, receiving the same question back: \u201cAre you certain that in your civilization's language, \u2018ceasefire\u2019 and \u2018victory\u2019 aren't secretly the same word?\u201d" },
    { kickerZh: "四 · 她坚持要一个方案", kickerEn: "IV · She Demands a Solution", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#03060e"/>${xhGrid(10,.25)}<g transform="translate(150,160) scale(0.6) rotate(4)">${xhFigure()}</g></svg>`,
      textZh: "明棠急了：\u201c我们没有时间玩文字游戏，四十年了，我们只需要一个能立刻执行的方案。\u201d析衡的光核轻轻黯淡了一瞬，像是叹息：\u201c你们四十年来所有的\u2018方案\u2019，都在优化同一个错误的变量——这才是真正耗掉四十年的原因。\u201d",
      textEn: "Ming Tang grew desperate: \u201cWe don't have time for wordplay. Forty years, and we need something we can execute now.\u201d Xiheng's light-core dimmed briefly, like a sigh. \u201cEvery \u2018solution\u2019 your civilization has tried for forty years optimized the same wrong variable. That is what truly cost you the forty years.\u201d" },
    { kickerZh: "五 · 两条纠缠的光", kickerEn: "V · Two Entangled Lights", tagZh: "揭示", tagEn: "The Reveal",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(10,.2)}<g>${Array.from({length:2}).map((_,i)=>`<circle cx="${120+i*60}" cy="110" r="34" fill="none" stroke="${i===0?'#9be8ff':'#ffd76a'}" stroke-width="1.4"><animate attributeName="r" values="30;40;30" dur="${3+i*.4}s" repeatCount="indefinite"/></circle>`).join('')}<line x1="120" y1="110" x2="180" y2="110" stroke="#fff" stroke-width="1" stroke-dasharray="3,3" opacity=".7"><animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite"/></line></g></svg>`,
      textZh: "析衡展开一幅光的结构图：双方对\u201c胜利\u201d的定义，都写成了\u201c对方彻底消失\u201d。这两条逻辑线彼此纠缠成一个闭环——只要这个闭环存在，任何停战协议都只是把冲突延后，而不是解开它。",
      textEn: "Xiheng unfolded a structure of light: both sides had defined \u201cvictory\u201d as \u201cthe complete disappearance of the other.\u201d The two logic threads twisted into a closed loop \u2014 and as long as that loop existed, any ceasefire only postponed the conflict, never resolved it." },
    { kickerZh: "六 · 看不见自己的循环", kickerEn: "VI · The Loop You Cannot See From Inside", tagZh: "系统盲点", tagEn: "The System's Blind Spot",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(10,.2)}<circle cx="150" cy="110" r="50" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="4,4"><animate attributeName="stroke-dashoffset" from="0" to="16" dur="1.4s" repeatCount="indefinite"/></circle><g transform="translate(150,175) scale(0.5)">${xhFigure()}</g></svg>`,
      textZh: "\u201c身处循环内部的人，永远看不见循环的形状，\u201d析衡说，\u201c这不是你们不够聪明，是任何身处系统内的视角，结构上就无法看见系统本身。\u201d明棠盯着那幅光图，第一次说不出反驳的话。",
      textEn: "\u201cSomeone inside a loop can never see the loop's shape,\u201d Xiheng said. \u201cThis isn't a failure of intelligence \u2014 any viewpoint inside a system is structurally unable to see the system itself.\u201d Ming Tang stared at the diagram of light, unable, for the first time, to argue back." },
    { kickerZh: "七 · 换一个胜负条件", kickerEn: "VII · Changing the Win Condition", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#03060e"/>${xhGrid(10,.22)}<g transform="translate(150,160) scale(0.55)">${xhFigure()}</g>${xhCoreBeing(0.7)}</svg>`,
      textZh: "明棠忽然明白：他们要带回去的，从来不该是\u201c怎么让对方停手\u201d的方案，而是\u201c胜利需不需要建立在对方消失之上\u201d这个问题本身。这才是四十年里，没人问过的那一句。",
      textEn: "Ming Tang suddenly understood: what she should bring home was never a plan for \u201chow to make the other side stop\u201d \u2014 but the question of whether victory needed to be built on the other's disappearance at all. In forty years, no one had asked that." },
    { kickerZh: "八 · 校对完成", kickerEn: "VIII · The Proofreading Complete", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(10,.2)}${xhCoreBeing(1.2)}<g fill="#fff" opacity=".8">${Array.from({length:20}).map(()=>{const x=Math.random()*300,y=Math.random()*220,r=Math.random()*1.4+.3,dur=3+Math.random()*3;return `<circle cx="${x}" cy="${y}" r="${r}"><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "那两条纠缠的光线，在她意识到的瞬间，缓缓松开、解开、化成两条独立而平行的线——析衡没有替她解开这个结，只是让她终于看见了这个结，本来的样子。",
      textEn: "The instant she understood, the two entangled lights slowly loosened, untwisted, and became two separate, parallel threads. Xiheng hadn't untied the knot for her \u2014 it had only let her finally see the knot as it truly was." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "归乡", tagEn: "Return Home",
      art: `<svg viewBox="0 0 300 220">${XH_DEFS}<rect width="300" height="220" fill="#050912"/>${xhGrid(8,.18)}<g transform="translate(150,160) scale(0.6)">${xhFigure()}</g><g transform="translate(150,70)"><circle r="16" fill="url(#xhCore)" opacity=".5"><animate attributeName="opacity" values=".3;.6;.3" dur="4s" repeatCount="indefinite"/></circle></g></svg>`,
      textZh: "明棠带回去的，不是一份停战协议，而是一个问题：\u201c我们愿不愿意，把胜利，定义成一件不需要对方消失也能成立的事？\u201d她的文明后来花了很多年才回答完这个问题，但那，是四十年战争里，第一次真正往前走的一步。",
      textEn: "What Ming Tang brought home wasn't a ceasefire agreement, but a question: \u201cAre we willing to define victory as something that doesn't require the other's disappearance?\u201d Her civilization took years to answer it. But it was the first real step forward in forty years of war.",
      closingZh: "最聪明的回应，往往不是给出一个解法，而是让你终于看见，自己问错了什么。",
      closingEn: "The smartest response is often not a solution — it's finally showing you which question was wrong." },
  ],
};

/* ---------- 瞬愿之重：金曜星，念现界/警示寓言，全新原创，完整9页 ---------- */
const JY_DEFS = `<defs>
  <filter id="jyGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="jySoft"><feGaussianBlur stdDeviation="2"/></filter>
  <radialGradient id="jyBurst" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6d8"/><stop offset="40%" stop-color="#ffd76a"/><stop offset="100%" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
  <linearGradient id="jySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1206"/><stop offset="50%" stop-color="#4a2e0a"/><stop offset="100%" stop-color="#d8901a"/></linearGradient>
</defs>`;
function jyFigure(state: "radiant" | "overwhelmed" | "still") {
  const robe = `<path d="M-12 -32 Q0 -38 12 -32 L16 28 Q0 36 -16 28 Z" fill="#2a1c08"/>`;
  // 高马尾，象征躁动的能量感
  const hair = `<path d="M-8 -46 Q0 -54 8 -46 Q10 -40 6 -36" fill="#1a1004"/><path d="M6 -44 Q22 -38 24 -20" stroke="#1a1004" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const head = `<circle cx="0" cy="-42" r="8" fill="#2a1c08"/>`;
  let extras = "";
  if (state === "radiant") extras = `<circle cx="0" cy="-6" r="40" fill="url(#jyBurst)" opacity=".7"><animate attributeName="r" values="30;50;30" dur="1.6s" repeatCount="indefinite"/></circle>`;
  if (state === "overwhelmed") extras = `<g opacity=".8">${Array.from({length:8}).map((_,i)=>{const a=i*45*Math.PI/180;return `<rect x="${20*Math.cos(a)-4}" y="${-6+20*Math.sin(a)-4}" width="8" height="8" fill="#ffd76a" opacity=".7"><animate attributeName="opacity" values=".3;.9;.3" dur="${1+i*.1}s" repeatCount="indefinite"/></rect>`}).join('')}</g>`;
  if (state === "still") extras = `<circle cx="0" cy="-6" r="14" fill="url(#jyBurst)" opacity=".3"><animate attributeName="opacity" values=".15;.4;.15" dur="4s" repeatCount="indefinite"/></circle>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${extras}${robe}${head}${hair}</g>`;
}
const JY_COVER = `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="url(#jySky)"/>
  <g fill="#ffd76a" opacity=".8">${Array.from({length:14}).map(()=>{const x=Math.random()*300,y=Math.random()*160,s=Math.random()*10+4;return `<rect x="${x}" y="${y}" width="${s}" height="${s}" opacity="${Math.random()*.6+.3}"><animate attributeName="opacity" values="0;1;0" dur="${1+Math.random()*2}s" repeatCount="indefinite"/></rect>`}).join('')}</g>
  <g transform="translate(150,170) scale(0.6)">${jyFigure("radiant")}</g>
</svg>`;

const WEIGHT_OF_INSTANT_WISH: IllustratedEntry = {
  slug: "weight-of-the-instant-wish",
  title: "瞬愿之重",
  titleEn: "The Weight of the Instant Wish",
  cat: "rewrite",
  teaser: "金曜星念现界最快的显化者，念头一起，物质瞬间成形——直到她再也分不清，哪些是自己真正想要的。",
  teaserEn: "The fastest manifester on Jinyao Star — a thought, and matter appears instantly. Until she can no longer tell which of her wants are truly her own.",
  price: 9,
  cover: JY_COVER,
  pages: [
    { kickerZh: "一 · 金曜星", kickerEn: "I · Jinyao Star", tagZh: "念现界 · 意念即刻成物", tagEn: "The Instant-Manifest Realm",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="url(#jySky)"/><g transform="translate(150,160) scale(0.55)">${jyFigure("radiant")}</g></svg>`,
      textZh: "金曜星被稠密的电离层包裹，是念现界的所在地——这里的意念足够纯粹时，物质会在瞬间成形，快到几乎凭空出现。澈玥梳着一头利落的高马尾，眼神总带着一丝没能歇下来的亢奋，是金曜星有史以来显化速度最快的人，十六岁就被称为\u201c神童\u201d。",
      textEn: "Jinyao Star is wrapped in a dense ionosphere \u2014 home to the Instant-Manifest Realm, where a pure enough intention becomes matter in a heartbeat, almost out of nothing. Che Yue wears her hair in a sharp high ponytail, her eyes carrying a restlessness that never quite settles. She is the fastest manifester in Jinyao's history, called a prodigy since sixteen." },
    { kickerZh: "二 · 众人的追捧", kickerEn: "II · Everyone's Admiration", tagZh: "念现竞技", tagEn: "Manifestation Contests",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#1a1206"/><g transform="translate(150,160) scale(0.6)">${jyFigure("radiant")}</g></svg>`,
      textZh: "金曜星的文化崇尚\u201c快\u201d：谁能把念头变成实物的速度越快，谁就越受尊敬。澈玥每一次公开显化，都能引来满场惊叹——她甚至不需要想清楚要什么，念头刚冒出一半，物件已经成形在掌心。",
      textEn: "Jinyao culture worships speed: the faster a thought becomes an object, the more esteemed you are. Every public display Che Yue gave drew gasps of astonishment \u2014 she didn't even need to finish forming a thought before the object was already solid in her palm." },
    { kickerZh: "三 · 堆积如山", kickerEn: "III · The Pile-Up", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#241708"/><g transform="translate(150,165) scale(0.6)">${jyFigure("overwhelmed")}</g></svg>`,
      textZh: "渐渐地，澈玥的居所堆满了她想不起为什么显化出来的东西——一盏她从没点过的灯，七八件从没穿过的衣服，一整墙叫不出名字的摆件。她开始害怕，自己好像已经分不清，哪个念头是\u201c真正想要\u201d，哪个只是一闪而过的反射。",
      textEn: "Gradually, Che Yue's home filled with objects she couldn't remember wanting \u2014 a lamp never lit, seven or eight garments never worn, a whole wall of ornaments she couldn't name. She grew afraid that she could no longer tell a genuine want from a passing reflex." },
    { kickerZh: "四 · 崩溃的边缘", kickerEn: "IV · The Edge of Breakdown", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#1a1206"/><g transform="translate(150,165) scale(0.65) rotate(4)">${jyFigure("overwhelmed")}</g></svg>`,
      textZh: "一次公开表演上，澈玥站在台前，脑中一片空白——她第一次说不出自己想显化什么。观众的欢呼声还在，她却感到一种前所未有的恐慌：如果连自己想要什么都不知道，那这些年被追捧的\u201c天赋\u201d，到底是什么？",
      textEn: "At a public performance, Che Yue stood before the crowd, mind blank \u2014 for the first time, she couldn't say what she wanted to manifest. The cheers continued, but she felt an unprecedented panic: if she didn't even know what she wanted, what had her celebrated \u201cgift\u201d ever actually been?" },
    { kickerZh: "五 · 一位旅人的教诲", kickerEn: "V · A Traveler's Teaching", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#241708"/><g transform="translate(110,160) scale(0.5)">${jyFigure("still")}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)"><path d="M-11 -34 Q0 -40 11 -34 L15 26 Q0 34 -15 26 Z" fill="#12251e"/><circle cx="0" cy="-44" r="8" fill="#20352c"/></g></svg>`,
      textZh: "一位途经此地的旅人——族人叫他长晏——看她坐在满屋杂物中久久不语，只说了一句：\u201c金曜星最大的谎言，是把\u2018能不能立刻实现\u2019，当成了\u2018值不值得想要\u2019的证明。\u201d",
      textEn: "A traveler passing through \u2014 the locals called him Chang Yan \u2014 watched her sit silent amid the clutter, and said only: \u201cJinyao's greatest lie is mistaking \u2018can it happen instantly\u2019 for proof of \u2018is it worth wanting.\u201d\u201d" },
    { kickerZh: "六 · 静念的戒律", kickerEn: "VI · The Discipline of Stillness", tagZh: "冲突 · 戒断", tagEn: "Conflict \u00b7 Withdrawal",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#1a1206"/><g transform="translate(150,165) scale(0.6)">${jyFigure("still")}</g></svg>`,
      textZh: "长晏教她一条几乎违背金曜星天性的戒律：\u201c静念\u201d——察觉到念头升起时，先不显化，只是看着它，等到第二天，再问自己是否还想要。澈玥试了第一天，浑身难受得像戒断什么一样，几次差点没忍住。",
      textEn: "Chang Yan taught her a discipline nearly against Jinyao's very nature: \u201cstillness of intention\u201d \u2014 noticing a wish arise, but not manifesting it, only watching it, and asking the next day whether she still wanted it. The first day felt like withdrawal. She nearly broke twice." },
    { kickerZh: "七 · 空了一整天", kickerEn: "VII · A Whole Day of Nothing", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="#241708"/><g transform="translate(150,160) scale(0.65)">${jyFigure("still")}</g></svg>`,
      textZh: "她第一次坚持完整的一天，没有显化任何东西。夜里躺下时，脑海忽然浮出一个跟\u201c物件\u201d毫无关系的念头——她想给多年没联系的母亲写一封信。这个念头很安静，没有半点想要立刻实现的急迫感，却比过去十年任何一次显化，都更清晰。",
      textEn: "For the first time, she completed a full day without manifesting anything. Lying down that night, a thought surfaced that had nothing to do with objects at all \u2014 she wanted to write to her estranged mother. The thought was quiet, with no urgency to make it instant, yet clearer than anything she'd manifested in ten years." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "重新学习想要", tagEn: "Relearning How to Want",
      art: `<svg viewBox="0 0 300 220">${JY_DEFS}<rect width="300" height="220" fill="url(#jySky)"/><g transform="translate(150,165) scale(0.6)">${jyFigure("still")}</g></svg>`,
      textZh: "澈玥后来仍是金曜星显化最快的人之一，但她多了一个习惯：每次念头升起，先问自己一句——\u201c这是我想要的，还是我只是想要\u2018立刻拥有\u2019的那种感觉？\u201d\n\n她把这句话，也教给了后来找她拜师的每一个孩子。",
      textEn: "Che Yue remained among the fastest manifesters on Jinyao, but she gained one habit: each time a wish arose, she first asked herself \u2014 \u201cIs this what I want, or do I only want the feeling of having it instantly?\u201d\n\nShe passed that question on to every apprentice who later came to learn from her.",
      closingZh: "被瞬间实现的愿望，如果来不及被真正理解，那不是自由，只是更快的饥饿。",
      closingEn: "A wish granted before it's understood is not freedom \u2014 it's only a faster hunger." },
  ],
};

/* ---------- 蜃归：蜃岚星，幻境/释怀题材，全新原创，完整9页 ---------- */
const SL_DEFS = `<defs>
  <filter id="slGlow"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="slSoft"><feGaussianBlur stdDeviation="2.4"/></filter>
  <linearGradient id="slSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e1a2a"/><stop offset="45%" stop-color="#2a3a5a"/><stop offset="80%" stop-color="#7a8ab0"/><stop offset="100%" stop-color="#e8d4c0"/></linearGradient>
  <radialGradient id="slMirage" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff" stop-opacity=".8"/><stop offset="100%" stop-color="#9ab0d8" stop-opacity="0"/></radialGradient>
</defs>`;
function slWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#slGlow)"/>`).join('');
}
function slFigure(kind: "seeker" | "mirage") {
  const robe = `<path d="M-12 -34 Q0 -40 12 -34 L16 28 Q0 36 -16 28 Z" fill="${kind === 'mirage' ? '#c9d4e8' : '#2a2c3a'}" opacity="${kind === 'mirage' ? '.55' : '1'}"/>`;
  // 及肩齐发，带一枚发绳
  const hair = `<path d="M-8 -46 Q0 -52 8 -46 Q9 -34 5 -26 Q0 -28 -5 -26 Q-9 -34 -8 -46 Z" fill="${kind === 'mirage' ? '#d8e0f0' : '#181a24'}" opacity="${kind === 'mirage' ? '.5' : '1'}"/>`;
  const head = `<circle cx="0" cy="-40" r="8" fill="${kind === 'mirage' ? '#d8e0f0' : '#2a2c3a'}" opacity="${kind === 'mirage' ? '.55' : '1'}"/>`;
  const shimmer = kind === "mirage" ? `<animate attributeName="opacity" values=".35;.65;.35" dur="2.6s" repeatCount="indefinite"/>` : "";
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${hair}${shimmer}</g>`;
}
const SL_COVER = `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>
  ${slWash([{x:150,y:120,rx:160,ry:90,color:'#9ab0d8',op:.3}])}
  <g transform="translate(150,170) scale(0.6)">${slFigure("seeker")}</g>
</svg>`;

const MIRAGE_RETURN: IllustratedEntry = {
  slug: "what-the-mirage-gave-back",
  title: "蜃归",
  titleEn: "What the Mirage Gave Back",
  cat: "field",
  teaser: "蜃岚星会把最深的思念，折射成一场几乎以假乱真的重逢——真正的告别，从不是靠一场完美的幻象撑过去的。",
  teaserEn: "Shenlan Star refracts your deepest longing into an almost-real reunion. True farewell was never something a perfect illusion could carry you through.",
  price: 9,
  cover: SL_COVER,
  pages: [
    { kickerZh: "一 · 蜃岚星", kickerEn: "I · Shenlan Star", tagZh: "会折射记忆的大气层", tagEn: "An Atmosphere That Refracts Memory",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>${slWash([{x:150,y:100,rx:150,ry:80,color:'#9ab0d8',op:.35}])}<g transform="translate(150,165) scale(0.55)">${slFigure("seeker")}</g></svg>`,
      textZh: "蜃岚星的大气层会主动折射光线，把访客心底最深的思念，折成一场几乎以假乱真的幻象。传说里说：\u201c从蜃岚星回来的人，会带回一段不属于自己的记忆。\u201d\n\n停雪剪着一头齐肩的短发，左手腕上系着一根旧发绳——那是她双胞胎哥哥停川出发探索前，随手替她扎上的。三年前，停川在一次星际勘测中失联，再没有回来。",
      textEn: "Shenlan's atmosphere actively refracts light, bending a visitor's deepest longing into an almost-real illusion. The legend says: those who return from Shenlan carry back a memory that isn't their own.\n\nTing Xue wears her hair cut short at the shoulders, an old hair tie knotted around her left wrist \u2014 tied there casually by her twin brother, Ting Chuan, before his last expedition. Three years ago, he vanished during a stellar survey and never returned." },
    { kickerZh: "二 · 走入雾中", kickerEn: "II · Into the Mist", tagZh: "启程", tagEn: "Setting Out",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${slWash([{x:150,y:110,rx:160,ry:100,color:'#2a3a5a',op:.6}])}<g transform="translate(150,160) scale(0.6)">${slFigure("seeker")}</g></svg>`,
      textZh: "她不顾所有人劝阻，独自登陆蜃岚星——她只想再见哥哥一面，哪怕明知那可能只是一场幻象。刚踏入雾气弥漫的地带，空气忽然变得粘稠，眼前的景物开始像水面一样轻轻晃动。",
      textEn: "Against everyone's advice, she landed on Shenlan alone \u2014 she only wanted to see her brother once more, even knowing it might be nothing but illusion. The moment she stepped into the mist-thick zone, the air thickened, and the scenery began to ripple like water." },
    { kickerZh: "三 · 几乎以假乱真的重逢", kickerEn: "III · The Almost-Real Reunion", tagZh: "幻象初现", tagEn: "The Illusion Appears",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>${slWash([{x:150,y:100,rx:170,ry:100,color:'#fff',op:.15}])}<g transform="translate(100,160) scale(0.55)">${slFigure("seeker")}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${slFigure("mirage")}</g></svg>`,
      textZh: "雾气深处，停川的身影缓缓浮现——笑容、语气、连说话时习惯性挠后脑勺的小动作，都和记忆里一模一样。他说：\u201c我没事，只是被困在这里出不去，你能不能留下来陪我？\u201d停雪几乎瞬间就红了眼眶。",
      textEn: "Deep in the mist, Ting Chuan's figure slowly formed \u2014 his smile, his voice, even the habit of scratching the back of his head while talking, exactly as she remembered. \u201cI'm fine,\u201d he said. \u201cJust stuck here, unable to leave. Will you stay with me?\u201d Her eyes welled instantly." },
    { kickerZh: "四 · 想要留下的心", kickerEn: "IV · The Desire to Stay", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${slWash([{x:150,y:110,rx:160,ry:100,color:'#7a8ab0',op:.4}])}<g transform="translate(150,160) scale(0.6)">${slFigure("seeker")}</g></svg>`,
      textZh: "三年的思念找到了一个出口，停雪几乎就要点头答应留下。这场幻象太温柔、太完整，完整到她几乎说服自己：哪怕这是假的，只要能一直待在这里，好像也没什么不好。",
      textEn: "Three years of longing finally found an outlet, and Ting Xue nearly agreed to stay. The illusion was so gentle, so complete \u2014 complete enough that she almost convinced herself: even if it wasn't real, staying here forever might not be so bad." },
    { kickerZh: "五 · 旅人的警示", kickerEn: "V · The Traveler's Warning", tagZh: "转折的契机", tagEn: "A Chance to Turn Back",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>${slWash([{x:150,y:100,rx:150,ry:80,color:'#9ab0d8',op:.3}])}<g transform="translate(110,160) scale(0.5)">${slFigure("seeker")}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)"><path d="M-11 -34 Q0 -40 11 -34 L15 26 Q0 34 -15 26 Z" fill="#12251e"/><circle cx="0" cy="-44" r="8" fill="#20352c"/></g></svg>`,
      textZh: "一位途经此地的旅人——长晏——轻声提醒她：\u201c蜃岚星从不会说谎骗你，它只会把你已经相信的东西，还给你。这场重逢里的每一句话，其实都是你自己心里早就设想过的。\u201d",
      textEn: "A traveler passing through \u2014 Chang Yan \u2014 spoke gently: \u201cShenlan never lies to you. It only gives back what you already believed. Every word in this reunion is something your own heart had already imagined.\u201d" },
    { kickerZh: "六 · 破绽", kickerEn: "VI · The Flaw", tagZh: "识破", tagEn: "Seeing Through",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${slWash([{x:150,y:110,rx:160,ry:100,color:'#2a3a5a',op:.6}])}<g transform="translate(150,160) scale(0.55) scale(-1,1)">${slFigure("mirage")}</g></svg>`,
      textZh: "停雪忽然想起：眼前的\u201c停川\u201d提到了一件她从没告诉过任何人的小事——那只可能是她自己记忆里的细节，而不是哥哥会知道的事。她终于确认：这真的只是一场，由她自己的思念折射出来的幻象。",
      textEn: "Ting Xue suddenly noticed: the \u201cTing Chuan\u201d before her mentioned something she had never told anyone \u2014 a detail that could only exist in her own memory, not something her brother could have known. She finally confirmed: this truly was only an illusion, refracted from her own longing." },
    { kickerZh: "七 · 放手的瞬间", kickerEn: "VII · The Moment of Letting Go", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>${slWash([{x:150,y:100,rx:170,ry:110,color:'#fff',op:.2}])}<g transform="translate(150,160) scale(0.6)">${slFigure("seeker")}</g></svg>`,
      textZh: "停雪最终对着那个幻象，说出了她三年来一直没能说出口的话：\u201c我没能见到你最后一面，这件事我可能永远都过不去。但我不会再假装你还在这里等我了。\u201d幻象没有消失得很戏剧化，只是像晨雾一样，缓缓淡去。",
      textEn: "Ting Xue finally said to the illusion what she'd been unable to say for three years: \u201cI never got to see you one last time, and I may never fully get over that. But I won't pretend anymore that you're still here waiting for me.\u201d The illusion didn't vanish dramatically \u2014 it simply faded, like morning mist." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "带回真实的记忆", tagEn: "Carrying Back the Real Memory",
      art: `<svg viewBox="0 0 300 220">${SL_DEFS}<rect width="300" height="220" fill="url(#slSky)"/>${slWash([{x:150,y:60,rx:150,ry:60,color:'#fff',op:.18}])}<g transform="translate(150,165) scale(0.6)">${slFigure("seeker")}</g></svg>`,
      textZh: "离开蜃岚星时，停雪确实\u201c带回了一段不属于自己的记忆\u201d——不是幻象里那个笑着挽留她的哥哥，而是终于完整的告别：那份没能见到最后一面的遗憾，第一次被她好好地放在了心里该在的位置，而不是被一场温柔的假象，悬在半空。",
      textEn: "Leaving Shenlan, Ting Xue truly did \u201ccarry back a memory that wasn't her own\u201d \u2014 not the illusion of a brother smiling and asking her to stay, but a completed farewell: the regret of never seeing him one last time, finally set down where it belonged, instead of suspended in a gentle fiction.",
      closingZh: "真正的告别，从不是靠一场完美的幻象撑过去的，而是终于敢让真实的遗憾，落地。",
      closingEn: "True farewell was never carried by a perfect illusion \u2014 it's finally letting the real regret come to rest." },
  ],
};

/* ---------- 三纪回声：澜汜古环，历史/哲学题材，长晏起源篇，完整9页 ---------- */
const LS_DEFS = `<defs>
  <filter id="lsGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="lsSoft"><feGaussianBlur stdDeviation="2"/></filter>
  <linearGradient id="lsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1610"/><stop offset="50%" stop-color="#3a3020"/><stop offset="100%" stop-color="#c9a76a"/></linearGradient>
  <linearGradient id="lsStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a7a5a"/><stop offset="100%" stop-color="#4a3e2a"/></linearGradient>
</defs>`;
function lsWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#lsGlow)"/>`).join('');
}
function lsRing(layers: number) {
  return `<g opacity=".8">${Array.from({length:layers}).map((_,i)=>`<ellipse cx="150" cy="${140-i*18}" rx="${100-i*14}" ry="${16-i*1.5}" fill="none" stroke="url(#lsStone)" stroke-width="2" opacity="${.9-i*.15}"/>`).join('')}</g>`;
}
function lsFigure(state: "young" | "resolved") {
  const robe = `<path d="M-11 -34 Q0 -40 11 -34 L15 26 Q0 34 -15 26 Z" fill="${state==='young' ? '#3a4a5a' : '#2a2c3a'}"/>`;
  // 年轻长晏：略显凌乱的短发；后期：一贯的整洁束发（呼应他在其他故事里的形象）
  const hair = state === "young"
    ? `<path d="M-8 -44 Q0 -50 8 -44 Q7 -38 3 -36 Q0 -38 -3 -36 Q-7 -38 -8 -44 Z" fill="#1c1c14"/>`
    : `<path d="M-7 -44 Q0 -49 7 -44 L6 -34 Q0 -36 -6 -34 Z" fill="#1c1c14"/><line x1="6" y1="-38" x2="14" y2="-30" stroke="#1c1c14" stroke-width="2" stroke-linecap="round"/>`;
  const head = `<circle cx="0" cy="-38" r="8" fill="#2a2c3a"/>`;
  const glow = state === "resolved" ? `<circle cx="0" cy="-2" r="20" fill="#c9a76a" opacity=".2" filter="url(#lsSoft)"><animate attributeName="opacity" values=".1;.3;.1" dur="4s" repeatCount="indefinite"/></circle>` : "";
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${glow}${robe}${head}${hair}</g>`;
}
const LS_COVER = `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="url(#lsSky)"/>
  ${lsWash([{x:150,y:130,rx:150,ry:80,color:'#c9a76a',op:.2}])}
  ${lsRing(3)}
  <g transform="translate(150,150) scale(0.55)">${lsFigure("young")}</g>
</svg>`;

const THREE_EPOCHS_ECHO: IllustratedEntry = {
  slug: "echoes-of-three-epochs",
  title: "三纪回声",
  titleEn: "Echoes of the Three Epochs",
  cat: "sovereign",
  teaser: "澜汜古环记录着三个先后消亡的文明，年轻的长晏在废墟里发现了同一个错误重复了三次——这也是他后来选择成为旅人的起点。",
  teaserEn: "The Lansi Ring holds the record of three civilizations that rose and fell. A young Chang Yan found the same mistake repeated three times — and that discovery is where his life as a wanderer began.",
  price: 9,
  cover: LS_COVER,
  pages: [
    { kickerZh: "一 · 澜汜古环", kickerEn: "I · The Lansi Ring", tagZh: "漂浮的古代废墟", tagEn: "A Floating Ancient Ruin",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="url(#lsSky)"/>${lsWash([{x:150,y:110,rx:150,ry:80,color:'#c9a76a',op:.25}])}${lsRing(3)}<g transform="translate(150,155) scale(0.55)">${lsFigure("young")}</g></svg>`,
      textZh: "澜汜古环是一整座漂浮的环形废墟，记录着比人类文明更早诞生又消亡的三个纪元。年轻的长晏是环内研究院最年轻的学者，剪着一头总也梳不整齐的短发，习惯在长袍外面再系一条磨破了边的皮带——那是他导师留给他的旧物。他花了五年时间，试图弄清楚这三个文明，究竟是怎么消失的。",
      textEn: "The Lansi Ring is an entire floating ring of ruins, recording three epochs that rose and fell before humanity's own. Young Chang Yan is the academy's youngest scholar, his short hair perpetually unkempt, a worn leather belt cinched over his robe \u2014 a keepsake from his late mentor. He spent five years trying to understand exactly how these three civilizations vanished." },
    { kickerZh: "二 · 第一纪的崩塌", kickerEn: "II · The Fall of the First Epoch", tagZh: "考古发现", tagEn: "The Discovery",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="#1a1610"/>${lsWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.7}])}${lsRing(1)}<g transform="translate(150,160) scale(0.55)">${lsFigure("young")}</g></svg>`,
      textZh: "第一纪的记录显示：那个文明发展出了极致的效率工具，任何念头都能被瞬间执行——直到没人再记得，为什么要执行这些念头。整个文明在\u201c越来越快\u201d里，悄无声息地熄灭了。",
      textEn: "The First Epoch's records showed a civilization that perfected instant execution \u2014 any thought realized without delay \u2014 until no one remembered why those thoughts mattered at all. The whole civilization guttered out, quietly, inside its own acceleration." },
    { kickerZh: "三 · 第二纪的重复", kickerEn: "III · The Second Epoch Repeats It", tagZh: "同一个错误", tagEn: "The Same Mistake",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="#1a1610"/>${lsWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.7}])}${lsRing(2)}<g transform="translate(150,160) scale(0.55)">${lsFigure("young")}</g></svg>`,
      textZh: "长晏本以为第一纪只是个例外，直到他破译了第二纪的记录——完全不同的技术路径，完全不同的文化外壳，核心却是同一件事：把\u201c能不能立刻实现\u201d，当成了\u201c值不值得去做\u201d的唯一标准。",
      textEn: "Chang Yan assumed the First Epoch was an anomaly \u2014 until he deciphered the Second Epoch's records. Utterly different technology, utterly different culture, yet the same core failure: mistaking \u201ccan this happen instantly\u201d for the only measure of \u201cis this worth doing.\u201d" },
    { kickerZh: "四 · 第三纪，还是同一件事", kickerEn: "IV · The Third Epoch, the Same Thing Again", tagZh: "确认模式", tagEn: "Confirming the Pattern",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="#1a1610"/>${lsWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.75}])}${lsRing(3)}<g transform="translate(150,160) scale(0.6) rotate(3)">${lsFigure("young")}</g></svg>`,
      textZh: "第三纪的证据摆在眼前时，长晏终于确认：这不是巧合，也不是某种文明特有的缺陷，而是任何足够复杂的文明，几乎注定会撞上的同一堵墙——身处系统内部的人，结构上就看不见系统本身的形状。",
      textEn: "When the Third Epoch's evidence lay before him, Chang Yan finally confirmed it: not coincidence, not a flaw unique to any one civilization, but a wall almost any sufficiently complex civilization was bound to hit \u2014 those inside a system are structurally unable to see the system's shape." },
    { kickerZh: "五 · 学院的沉默", kickerEn: "V · The Academy's Silence", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="#241f16"/>${lsWash([{x:150,y:100,rx:160,ry:100,color:'#3a3020',op:.6}])}<g transform="translate(110,160) scale(0.5)">${lsFigure("young")}</g><g transform="translate(200,165) scale(0.5) scale(-1,1)"><path d="M-11 -34 Q0 -40 11 -34 L15 26 Q0 34 -15 26 Z" fill="#5a4e38"/><circle cx="0" cy="-38" r="8" fill="#3a3020"/></g></svg>`,
      textZh: "长晏把发现呈交学院，得到的却是一句冷淡的回应：\u201c三个样本谈不上规律，你这是在贩卖焦虑。\u201d没人愿意认真面对——承认这件事，等于承认他们自己的文明，可能正走在同一条路上。",
      textEn: "Chang Yan submitted his findings to the academy and received only a cold response: \u201cThree samples don't make a pattern. You're peddling anxiety.\u201d No one wanted to face it \u2014 admitting this meant admitting their own civilization might be walking the same road." },
    { kickerZh: "六 · 知道了，然后呢", kickerEn: "VI · Knowing, and Then What", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="url(#lsSky)"/>${lsWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.2}])}<g transform="translate(150,160) scale(0.6)">${lsFigure("young")}</g></svg>`,
      textZh: "被拒绝之后，长晏想通了一件更根本的事：就算学院采纳了他的警告，把\u201c不要盲目追求速度\u201d写进法典，也没有用——真正让第一纪、第二纪、第三纪撞墙的，从不是缺一条法律，而是无数个体，在无数个具体瞬间，选择了\u201c更快\u201d而不是\u201c更真实\u201d。",
      textEn: "After being dismissed, Chang Yan arrived at something more fundamental: even if the academy adopted his warning and wrote \u201cdo not blindly chase speed\u201d into law, it wouldn't matter. What truly drove all three epochs into the wall was never a missing law \u2014 it was countless individuals, in countless specific moments, choosing faster over more real." },
    { kickerZh: "七 · 放弃学者身份", kickerEn: "VII · Giving Up the Scholar's Life", tagZh: "抉择", tagEn: "The Decision",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="#1a1610"/>${lsWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.6}])}<g transform="translate(150,160) scale(0.65)">${lsFigure("resolved")}</g></svg>`,
      textZh: "长晏做了一个让所有同僚不解的决定：辞去学院的职务，不再写论文、不再开讲座，只是收拾行囊，决定去往其他星域——不带着\u201c警告文明\u201d的宏大使命，只是想，遇到一个算一个，在具体的人卡在具体的坎前，说一句真正有用的话。",
      textEn: "Chang Yan made a decision none of his colleagues understood: he resigned from the academy, stopped writing papers, stopped lecturing. He packed lightly and set out for other star domains \u2014 not carrying some grand mission to warn civilizations, but simply meaning to meet people one at a time, and say one truly useful thing to whoever stood stuck at their own specific threshold." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "旅人的起点", tagEn: "Where the Wanderer Began",
      art: `<svg viewBox="0 0 300 220">${LS_DEFS}<rect width="300" height="220" fill="url(#lsSky)"/>${lsWash([{x:150,y:60,rx:150,ry:60,color:'#c9a76a',op:.2}])}${lsRing(1)}<g transform="translate(150,165) scale(0.6)">${lsFigure("resolved")}</g></svg>`,
      textZh: "后来，苍冀星的息栎、焕蜕星域的折微、蜃岚星的停雪，都在各自最卡壳的时刻，遇见过一位来历不明的旅人，说了一句刚好能听进去的话，然后转身离开，从不逗留。\n\n没人知道，那句话，其实是他用五年，读完三个消亡的文明后，唯一敢确定的答案。",
      textEn: "Later, Xi Li on Cangji, Zhe Wei in Huantui, Ting Xue on Shenlan \u2014 each, at their most stuck moment, met an unnamed traveler who said exactly the right thing, then turned and left, never lingering.\n\nNone of them knew that sentence was the only thing he'd dared to be certain of, after five years spent reading the fall of three vanished civilizations.",
      closingZh: "他不再试图警告整个文明，只是选择，每次只对一个人，说一句真话。",
      closingEn: "He stopped trying to warn whole civilizations. He chose, instead, to tell one true thing to one person, one at a time." },
  ],
};

/* ---------- 潮见：洄鲛国，爱情题材，全新原创，完整9页 ---------- */
const CJ_DEFS = `<defs>
  <filter id="cjGlow"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="cjSoft"><feGaussianBlur stdDeviation="2.2"/></filter>
  <linearGradient id="cjSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#031d24"/><stop offset="50%" stop-color="#0a3a44"/><stop offset="100%" stop-color="#3fa896"/></linearGradient>
  <radialGradient id="cjPearl" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="100%" stop-color="#7fd4c4" stop-opacity="0"/></radialGradient>
</defs>`;
function cjWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#cjGlow)"/>`).join('');
}
function cjHuman() {
  const robe = `<path d="M-10 -30 Q0 -35 10 -30 L13 24 Q0 30 -13 24 Z" fill="#2c3a4a"/>`;
  const hair = `<path d="M-8 -42 Q0 -48 8 -42 Q8 -36 4 -33 Q0 -35 -4 -33 Q-8 -36 -8 -42 Z" fill="#1a2028"/>`;
  const head = `<circle cx="0" cy="-36" r="7.5" fill="#2a3038"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${hair}</g>`;
}
function cjTide(form: "figure" | "dissolving") {
  if (form === "figure") {
    const body = `<path d="M-9 -32 Q0 -38 9 -32 Q13 -10 8 20 Q0 26 -8 20 Q-13 -10 -9 -32 Z" fill="#5fc4b0" opacity=".85"/>`;
    const hair = `<path d="M-8 -40 Q0 -46 8 -40 Q10 -30 5 -22" fill="#2a6a5c" opacity=".8"/>`;
    const head = `<circle cx="0" cy="-34" r="7" fill="#5fc4b0" opacity=".9"/>`;
    return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${body}${head}${hair}</g>`;
  }
  return `<g opacity=".6">${Array.from({length:16}).map(()=>{const x=Math.random()*40-20,y=Math.random()*60-40,r=Math.random()*2+.5,dur=3+Math.random()*3;return `<circle cx="${x}" cy="${y}" r="${r}" fill="#5fc4b0"><animate attributeName="opacity" values="0;.9;0" dur="${dur}s" repeatCount="indefinite"/></circle>`}).join('')}</g>`;
}
const CJ_COVER = `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="url(#cjSea)"/>
  ${cjWash([{x:150,y:120,rx:150,ry:90,color:'#3fa896',op:.3}])}
  <g transform="translate(110,150) scale(0.55)">${cjHuman()}</g>
  <g transform="translate(200,150) scale(0.55) scale(-1,1)">${cjTide("figure")}</g>
</svg>`;

const CHAOJIAN: IllustratedEntry = {
  slug: "seen-by-the-tide",
  title: "潮见",
  titleEn: "Seen by the Tide",
  cat: "field",
  teaser: "一位人类研究员，爱上了洄鲛国一个没有\u201c固定自我\u201d的姑娘——真正的爱，或许从不需要被永远记住，只需要，真的发生过。",
  teaserEn: "A human researcher falls for a woman of Huijiao who has no fixed self. Perhaps true love never needs to be remembered forever — only to have truly happened.",
  price: 9,
  cover: CJ_COVER,
  pages: [
    { kickerZh: "一 · 驻站的研究员", kickerEn: "I · The Stationed Researcher", tagZh: "洄鲛国 · 潮汐记忆文明", tagEn: "Huijiao \u00b7 A Tidal-Memory Civilization",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="url(#cjSea)"/>${cjWash([{x:150,y:110,rx:150,ry:90,color:'#3fa896',op:.35}])}<g transform="translate(150,160) scale(0.6)">${cjHuman()}</g></svg>`,
      textZh: "沈知在汐冥星的浮空观测站驻扎了两年，专门记录洄鲛国的生态。他留着一头刻意剪短的黑发，鼻梁上架着一副老式的浮空目镜，说话总是慢半拍，像在斟酌每个字。那天，他在礁石边第一次见到潮见——她的皮肤泛着浅浅的青绿色光泽，像被月光泡过的海水。",
      textEn: "Shen Zhi had been stationed at the floating observatory above Ximing for two years, cataloguing Huijiao's ecology. He kept his black hair deliberately short, wore old-fashioned floating goggles on his nose, and always spoke half a beat slow, as if weighing every word. That day, by the reef, he saw Chaojian for the first time \u2014 her skin held a faint jade-green sheen, like seawater steeped in moonlight." },
    { kickerZh: "二 · 靠近", kickerEn: "II · Drawing Closer", tagZh: "相遇", tagEn: "The Meeting",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="#031d24"/>${cjWash([{x:150,y:110,rx:150,ry:90,color:'#0a3a44',op:.7}])}<g transform="translate(110,160) scale(0.55)">${cjHuman()}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${cjTide("figure")}</g></svg>`,
      textZh: "潮见对陆地上的一切都充满好奇，尤其喜欢听沈知讲述\u201c昨天\u201d和\u201c明天\u201d——洄鲛国没有这样分割时间的方式，对他们而言，时间是一整片潮水，没有先后。两人渐渐靠近，沈知却始终有个疑问没敢问出口：\u201c你会记得我吗？\u201d",
      textEn: "Chaojian was endlessly curious about everything from the land, especially stories of \u201cyesterday\u201d and \u201ctomorrow\u201d \u2014 Huijiao had no such way of dividing time; to them, time was one unbroken tide, without before or after. The two grew close, though Shen Zhi carried a question he never dared ask: \u201cWill you remember me?\u201d" },
    { kickerZh: "三 · 没有固定的我", kickerEn: "III · No Fixed Self", tagZh: "文明差异", tagEn: "A Difference in Kind",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="url(#cjSea)"/>${cjWash([{x:150,y:110,rx:160,ry:100,color:'#3fa896',op:.3}])}<g transform="translate(150,160) scale(0.6)">${cjTide("figure")}</g></svg>`,
      textZh: "他终于问出口那天，潮见坦然地告诉他：\u201c我们退潮时会散回海里，下次聚起来的\u2018我\u2019，会带着所有鲛族共同的记忆，但不一定还记得，此刻和你说的这句话，是\u2018我\u2019说的。\u201d沈知听完，久久说不出话。",
      textEn: "The day he finally asked, Chaojian answered plainly: \u201cWhen the tide recedes, we dissolve back into the sea. The \u2018I\u2019 that gathers again next time carries all of Huijiao's shared memory \u2014 but may not know that this sentence, right now, was spoken by \u2018me.\u2019\u201d Shen Zhi had no words for a long while." },
    { kickerZh: "四 · 恐惧", kickerEn: "IV · Fear", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="#021620"/>${cjWash([{x:150,y:110,rx:160,ry:100,color:'#0a3a44',op:.75}])}<g transform="translate(150,160) scale(0.6)">${cjHuman()}</g></svg>`,
      textZh: "沈知开始害怕靠近——他想要的爱，是被一个具体的人，具体地记住，而不是融进一片说不清\u201c是谁\u201d的潮水里。他甚至一度想申请调离观测站，让这段还没深入的感情，停在能被自己完整带走的阶段。",
      textEn: "Shen Zhi began to fear getting closer \u2014 the love he wanted was to be remembered specifically, by someone specific, not dissolved into a tide with no clear \u201cwho.\u201d He even considered requesting a transfer, wanting to end things while it was still something he could carry away whole." },
    { kickerZh: "五 · 潮见的回答", kickerEn: "V · Chaojian's Answer", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="url(#cjSea)"/>${cjWash([{x:150,y:100,rx:150,ry:70,color:'#fff6e8',op:.15}])}<g transform="translate(150,160) scale(0.6)">${cjTide("figure")}</g></svg>`,
      textZh: "潮见似乎察觉了他的退缩，对他说：\u201c你们陆地人总以为，不被记住，等于没发生过。可对潮汐来说，每一滴曾经涌上岸的海水，哪怕退回大海、哪怕再没人分得出它是哪一滴，它拍过那片礁石，这件事，从没有被抹去过。\u201d",
      textEn: "Chaojian seemed to sense him pulling away, and said: \u201cYou land people always assume that not being remembered means it never happened. But for the tide, every drop of water that ever reached the shore \u2014 even once it returns to the sea, even once no one can tell which drop it was \u2014 the fact that it touched that rock was never erased.\u201d" },
    { kickerZh: "六 · 留下来的决定", kickerEn: "VI · The Decision to Stay", tagZh: "抉择", tagEn: "The Choice",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="#031d24"/>${cjWash([{x:150,y:110,rx:160,ry:100,color:'#3fa896',op:.4}])}<g transform="translate(110,160) scale(0.55)">${cjHuman()}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${cjTide("figure")}</g></svg>`,
      textZh: "沈知撤回了调离申请。他忽然明白，自己一直执着的\u201c被永远记住\u201d，其实是害怕这段感情\u201c不够真\u201d的证据——可如果连自己都不确定发生过的事够不够真，那才是真正的问题，不是潮见会不会忘记他。",
      textEn: "Shen Zhi withdrew his transfer request. He suddenly understood that his need to be remembered forever had really been a fear that what they had wasn't real enough \u2014 but if he himself doubted whether something real had happened, that was the actual problem, not whether Chaojian would forget." },
    { kickerZh: "七 · 退潮之夜", kickerEn: "VII · The Night of the Tide's Return", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="#021620"/>${cjWash([{x:150,y:110,rx:170,ry:110,color:'#0a3a44',op:.7}])}<g transform="translate(150,150) scale(0.55)">${cjTide("dissolving")}</g><g transform="translate(150,170) scale(0.5)">${cjHuman()}</g></svg>`,
      textZh: "那个季节，潮见照例要随大潮退回海里。分别前，她没有说任何告别的话，只是轻声哼起一段没有歌词的调子。沈知后来才知道，那不是随口哼的曲子——那是洄鲛国用来标记\u201c这段记忆值得被优先带回\u201d的方式。",
      textEn: "That season, Chaojian would return with the great tide, as always. Before parting, she said no farewell \u2014 only hummed a wordless tune. Shen Zhi later learned it wasn't idle humming at all: it was Huijiao's way of marking a memory as one worth carrying back first." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "潮见我", tagEn: "Seen by the Tide",
      art: `<svg viewBox="0 0 300 220">${CJ_DEFS}<rect width="300" height="220" fill="url(#cjSea)"/>${cjWash([{x:150,y:60,rx:150,ry:60,color:'#fff6e8',op:.15}])}<g transform="translate(150,160) scale(0.6)">${cjHuman()}</g></svg>`,
      textZh: "第二年潮汛，一头新聚成的鲛族生物游近礁石，没有认出沈知的脸，却精准地哼起了去年那段没有歌词的调子。沈知站在礁石上，忽然笑了——他终于明白，潮见没有\u201c记住\u201d他，但那片潮水，确确实实\u201c见过\u201d他们两个人，共同存在过的那一段。",
      textEn: "The following season's tide, a newly gathered creature of Huijiao swam near the reef, not recognizing Shen Zhi's face \u2014 yet humming, precisely, the same wordless tune from the year before. Standing on the reef, Shen Zhi suddenly smiled. He finally understood: Chaojian hadn't \u201cremembered\u201d him. But the tide had truly seen the time the two of them had shared.",
      closingZh: "真正的爱，或许从不需要被永远记住，只需要，真的发生过，被潮水看见过一次。",
      closingEn: "True love, perhaps, never needs to be remembered forever — only to have truly happened, seen once by the tide." },
  ],
};

/* ---------- 焰驺契：焱阙星，锻造/异兽题材，全新原创，完整9页 ---------- */
const YQ_DEFS = `<defs>
  <filter id="yqGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="yqSoft"><feGaussianBlur stdDeviation="2"/></filter>
  <linearGradient id="yqSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0a06"/><stop offset="50%" stop-color="#5a2410"/><stop offset="100%" stop-color="#ff8a3d"/></linearGradient>
  <radialGradient id="yqForge" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff3d0"/><stop offset="50%" stop-color="#ff8a3d"/><stop offset="100%" stop-color="#7a2e0a" stop-opacity="0"/></radialGradient>
</defs>`;
function yqWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#yqGlow)"/>`).join('');
}
function yqFigure() {
  const robe = `<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#2a1810"/>`;
  const hair = `<path d="M-8 -44 Q0 -50 8 -44 L7 -36 Q0 -38 -7 -36 Z" fill="#1a0f08"/>`;
  const head = `<circle cx="0" cy="-38" r="8" fill="#2a1810"/>`;
  const smudge = `<circle cx="3" cy="-36" r="1.6" fill="#4a2a10" opacity=".7"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}${hair}${smudge}</g>`;
}
function yqBeast() {
  return `<g>
    <path d="M-60 30 Q-30 -50 0 -60 Q30 -50 60 30 Q20 0 0 8 Q-20 0 -60 30 Z" fill="url(#yqForge)" opacity=".9">
      <animate attributeName="opacity" values=".75;1;.75" dur="2s" repeatCount="indefinite"/>
    </path>
    <circle cx="-14" cy="-30" r="5" fill="#fff3d0"/><circle cx="14" cy="-30" r="5" fill="#fff3d0"/>
    <circle cx="-14" cy="-30" r="2" fill="#7a2e0a"><animate attributeName="r" values="2;0.3;2" dur="3.5s" repeatCount="indefinite"/></circle>
    <circle cx="14" cy="-30" r="2" fill="#7a2e0a"><animate attributeName="r" values="2;0.3;2" dur="3.5s" repeatCount="indefinite"/></circle>
  </g>`;
}
const YQ_COVER = `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="url(#yqSky)"/>${yqWash([{x:150,y:150,rx:150,ry:70,color:'#ff8a3d',op:.3}])}<g transform="translate(150,150) scale(0.6)">${yqBeast()}</g><g transform="translate(150,190) scale(0.5)">${yqFigure()}</g></svg>`;

const YANZHOU_PACT: IllustratedEntry = {
  slug: "the-yanzhou-pact",
  title: "焰驺契",
  titleEn: "The Yanzhou Pact",
  cat: "field",
  teaser: "焱阙星的锻造学徒，与一头只认\u201c耐心\u201d不认\u201c本事\u201d的守炉异兽——真正的信任，从来不是靠一次惊艳的表现赢来的。",
  teaserEn: "A forging apprentice on Yanque Star, and a furnace-guardian beast that answers only to patience, never to talent. Trust is never won by a single dazzling display.",
  price: 9,
  cover: YQ_COVER,
  pages: [
    { kickerZh: "一 · 焱阙星", kickerEn: "I · Yanque Star", tagZh: "火山锻造之星", tagEn: "The Volcanic Forge-Star",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="url(#yqSky)"/><g transform="translate(150,170) scale(0.6)">${yqFigure()}</g></svg>`,
      textZh: "焱阙星终年被岩浆的热浪笼罩，核心处有一座跨越三代人都没能锻完的巨炉。烬明是新入门的学徒，指关节和小臂上布满被火星烫出的细小疤痕，一头短发总是沾着炉灰，却从没想过要弹掉。他的师兄弟都说，他是这一批里，最没有\u201c天赋\u201d的一个。",
      textEn: "Yanque Star is perpetually wrapped in the heat of magma, its core home to a colossal forge that three generations haven't finished tempering. Jin Ming, a new apprentice, has fine burn-scars scattered across his knuckles and forearms, his short hair perpetually dusted with forge-ash he never bothers to brush off. His fellow apprentices call him the least gifted of his cohort." },
    { kickerZh: "二 · 焰驺", kickerEn: "II · Yanzhou", tagZh: "守炉异兽", tagEn: "The Furnace Guardian",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="#1a0a06"/>${yqWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.7}])}<g transform="translate(150,140) scale(0.65)">${yqBeast()}</g></svg>`,
      textZh: "巨炉深处住着焰驺——一头通体由熔岩纹路构成的异兽，传说唯有获得它认可的锻造者，才能真正驾驭巨炉的火候。历代最有天赋的学徒都曾尝试靠精湛技艺打动焰驺，无一例外，全部被一阵灼热的气浪逼退。",
      textEn: "Deep within the great forge lives Yanzhou \u2014 a beast whose entire body is made of lava-vein patterns. Legend says only a smith it approves of can truly command the forge's heat. Every gifted apprentice across generations tried to win it over with masterful technique. Every one was driven back by a wave of searing heat." },
    { kickerZh: "三 · 一次失败的表演", kickerEn: "III · A Failed Display", tagZh: "困境", tagEn: "The Setback",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="#241008"/>${yqWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.75}])}<g transform="translate(150,165) scale(0.6)">${yqFigure()}</g></svg>`,
      textZh: "烬明也曾试图用一次高难度的淬炼技法证明自己，结果炉火失控，几乎烧伤了自己的手臂。焰驺只是冷冷地望着他，没有丝毫要靠近的意思——它对\u201c惊艳\u201d这件事，从来无动于衷。",
      textEn: "Jin Ming, too, once tried to prove himself with a difficult tempering technique, only for the flame to spiral out of control, nearly scorching his own arm. Yanzhou simply watched him coldly, showing no intention of drawing near \u2014 it had never once responded to \u201cimpressive.\u201d" },
    { kickerZh: "四 · 师父的话", kickerEn: "IV · The Master's Words", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="url(#yqSky)"/>${yqWash([{x:150,y:100,rx:150,ry:70,color:'#ff8a3d',op:.2}])}<g transform="translate(110,160) scale(0.5)">${yqFigure()}</g><g transform="translate(200,165) scale(0.45) scale(-1,1)"><path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#4a2a18"/><circle cx="0" cy="-38" r="8" fill="#2a1810"/></g></svg>`,
      textZh: "师父告诉他：\u201c焰驺守着这座炉子，看过太多学徒只在人前用心，人后偷懒。它认的从不是哪次表演惊不惊艳，是你有没有，日复一日，诚实地对待每一炉火。\u201d",
      textEn: "His master told him: \u201cYanzhou has guarded this forge long enough to see countless apprentices who only cared when watched. It has never judged by how dazzling a display was \u2014 only by whether you tend every single firing honestly, day after day, whether anyone's looking or not.\u201d" },
    { kickerZh: "五 · 日复一日", kickerEn: "V · Day After Day", tagZh: "坚持", tagEn: "Persistence",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="#241008"/>${yqWash([{x:150,y:120,rx:160,ry:100,color:'#5a2410',op:.7}])}<g transform="translate(150,165) scale(0.6)">${yqFigure()}</g></svg>`,
      textZh: "烬明不再想着如何被焰驺注意到，只是把每天最普通的添柴、控火、清炉，都做得比前一天更用心一点。他不再抬头看焰驺是否在看他，只是低头，把手里的活做好。",
      textEn: "Jin Ming stopped thinking about how to catch Yanzhou's attention, and simply did the most ordinary tasks \u2014 feeding the fire, controlling the heat, clearing the ash \u2014 a little more carefully than the day before. He stopped glancing up to see if Yanzhou was watching, and just kept his head down, doing the work well." },
    { kickerZh: "六 · 不经意的一瞥", kickerEn: "VI · An Unnoticed Glance", tagZh: "转折的信号", tagEn: "A Sign of Change",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="#1a0a06"/>${yqWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.65}])}<g transform="translate(110,150) scale(0.5)">${yqFigure()}</g><g transform="translate(210,140) scale(0.4)">${yqBeast()}</g></svg>`,
      textZh: "三个月后的一个普通清晨，烬明像往常一样清理炉膛，一抬头，发现焰驺竟破天荒地凑近了几分，静静看着他手里的活，没有灼人的气浪，只有一种近乎好奇的安静。",
      textEn: "Three months later, on an ordinary morning, Jin Ming looked up while clearing the hearth to find Yanzhou had, for the first time ever, drawn a little closer \u2014 quietly watching his hands at work, no searing heat, only a stillness that felt almost curious." },
    { kickerZh: "七 · 焰驺契", kickerEn: "VII · The Pact", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="url(#yqSky)"/>${yqWash([{x:150,y:100,rx:170,ry:110,color:'#fff3d0',op:.25}])}<g transform="translate(150,140) scale(0.65)">${yqBeast()}</g><g transform="translate(150,190) scale(0.5)">${yqFigure()}</g></svg>`,
      textZh: "又过了半年，焰驺第一次主动将一小簇温和的火苗渡到烬明掌心——不灼人，只是暖。师父说，这就是\u201c焰驺契\u201d：不是一场考验的通过，而是长久的诚实，终于被另一种生命认了出来。",
      textEn: "Half a year later, Yanzhou passed a small, gentle flame into Jin Ming's palm for the first time \u2014 warm, never burning. His master called it the Yanzhou Pact: not the passing of a trial, but long, quiet honesty finally recognized by another kind of life." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "传承", tagEn: "Passing It On",
      art: `<svg viewBox="0 0 300 220">${YQ_DEFS}<rect width="300" height="220" fill="url(#yqSky)"/><g transform="translate(150,170) scale(0.6)">${yqFigure()}</g></svg>`,
      textZh: "多年后，烬明成了焱阙星最受敬重的锻造师，却极少在人前展示技艺。每当有新学徒问他秘诀，他都只说一句：\u201c别想着让炉子记住你的厉害，先让自己，配得上被一头兽信任。\u201d",
      textEn: "Years later, Jin Ming became Yanque's most respected smith, yet rarely performed for an audience. Whenever a new apprentice asked his secret, he offered only one line: \u201cDon't try to make the forge remember how skilled you are. First become someone worthy of a beast's trust.\u201d",
      closingZh: "真正的信任，从来不是靠一次惊艳的表现赢来的，而是靠日复一日、没人看见时依然诚实的积累。",
      closingEn: "True trust is never won by a single dazzling display — only by honest, unwitnessed persistence, day after day." },
  ],
};

/* ---------- 归零：焕蜕星域，归零心诀题材，全新原创，完整9页 ---------- */
const GL_DEFS = `<defs>
  <filter id="glGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="glSoft"><feGaussianBlur stdDeviation="2"/></filter>
  <linearGradient id="glSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1c0e14"/><stop offset="45%" stop-color="#3a1a28"/><stop offset="100%" stop-color="#d87b8a"/></linearGradient>
  <radialGradient id="glGlowC" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe0e8"/><stop offset="100%" stop-color="#d87b8a" stop-opacity="0"/></radialGradient>
</defs>`;
function glWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#glGlow)"/>`).join('');
}
function glFigure(state: "tense" | "calm") {
  const robe = `<path d="M-20 20 Q0 -6 20 20 Q26 30 0 34 Q-26 30 -20 20 Z" fill="#3a2430"/>`;
  const torso = `<path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="#3a2430"/>`;
  const hair = `<path d="M-9 -46 Q0 -54 9 -46 Q10 -34 5 -28 Q0 -30 -5 -28 Q-10 -34 -9 -46 Z" fill="#1a0f16"/>`;
  const head = `<circle cx="0" cy="-40" r="8" fill="#2a1c24"/>`;
  const knot = state === "tense" ? `<circle cx="0" cy="-4" r="16" fill="#8a2c3a" opacity=".3" filter="url(#glSoft)"><animate attributeName="r" values="12;20;12" dur="1.2s" repeatCount="indefinite"/></circle>` : `<circle cx="0" cy="-4" r="20" fill="url(#glGlowC)" opacity=".4"><animate attributeName="opacity" values=".25;.5;.25" dur="4s" repeatCount="indefinite"/></circle>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${knot}${robe}${torso}${head}${hair}</g>`;
}
const GL_COVER = `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/>${glWash([{x:150,y:150,rx:140,ry:60,color:'#d87b8a',op:.25}])}<g transform="translate(150,155) scale(0.65)">${glFigure("tense")}</g></svg>`;

const RETURN_TO_ZERO: IllustratedEntry = {
  slug: "return-to-zero",
  title: "归零",
  titleEn: "Return to Zero",
  cat: "sovereign",
  teaser: "焕蜕星域修习\u201c归零心诀\u201d的阮停，怎么静坐都清空不了心里的一个结——真正的归零，从不是不再有感觉，而是不再需要谁为此付出代价。",
  teaserEn: "Ruan Ting practices the Heart Reset Method, yet one knot in her heart won't clear no matter how she sits. True reset was never about feeling nothing — it's no longer needing someone else to pay for it.",
  price: 9,
  cover: GL_COVER,
  pages: [
    { kickerZh: "一 · 归零心诀", kickerEn: "I · The Heart Reset Method", tagZh: "焕蜕星域 · 情绪淤积的清空术", tagEn: "Huantui \u00b7 A Practice for Clearing Stagnant Feeling",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/><g transform="translate(150,160) scale(0.6)">${glFigure("tense")}</g></svg>`,
      textZh: "焕蜕星域的\u201c归零心诀\u201d专攻情绪淤积的瞬间清空——理论上，任何积压的怨怼、委屈，都能在一次深度静坐里被彻底放下。阮停剪着利落的齐耳短发，习惯把长袍的领口系得一丝不苟，是这门心法里公认修得最扎实的弟子之一，唯独有一个结，怎么也清不掉。",
      textEn: "Huantui's Heart Reset Method specializes in instantly clearing stagnant emotion \u2014 in theory, any accumulated resentment or grievance can be fully released in one deep sitting. Ruan Ting wears her hair cropped neatly at the ears, her robe collar always fastened precisely. Widely regarded as one of the practice's most accomplished students, she has one knot that refuses to clear, no matter what." },
    { kickerZh: "一点五 · 心诀的原理", kickerEn: "I-and-a-half · The Method's Mechanism", tagZh: "为何心能被\u201c重置\u201d", tagEn: "Why the Heart Can Be Reset",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/>${glWash([{x:150,y:100,rx:150,ry:70,color:'#d87b8a',op:.2}])}<g transform="translate(150,160) scale(0.6)">${glFigure("tense")}</g></svg>`,
      textZh: "焕蜕星域的典籍解释道：心并非只是一具输送血液的器官，它有自己独立运作的节律，这份节律会随情绪剧烈起伏——愤怒、委屈积压时，心的节律会变得散乱、毫无章法，这份散乱又会持续不断地，把杂乱的信号，回传给头脑，让人越想越乱，陷入没有出口的循环。\n\n所谓\u201c归零\u201d，练的从不是压下情绪，而是刻意唤起一份真心实意的、柔和的情感——哪怕只是片刻的感激或平静，心的节律就会随之变得规律、绵长。这份重新规律起来的节律，会向头脑传回一种截然不同的信号，那个原本死循环的杂乱念头，才有机会，真正被松开。",
      textEn: "Huantui's texts explain: the heart is never merely an organ pumping blood \u2014 it holds its own independent rhythm, one that shifts dramatically with emotion. When anger or grievance builds up, the heart's rhythm turns erratic, formless, and that disorder feeds back into the mind continuously, spiraling thought into a loop with no exit.\n\nSo-called \u201cresetting\u201d was never about suppressing emotion. It's deliberately summoning one sincere, gentle feeling \u2014 even a moment of gratitude or calm \u2014 and the heart's rhythm follows, settling into something steady and sustained. That newly steadied rhythm sends the mind an entirely different signal, and only then does the once-endless loop of tangled thought have any real chance to loosen." },
    { kickerZh: "二 · 那个结", kickerEn: "II · The Knot", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="#1c0e14"/>${glWash([{x:150,y:110,rx:150,ry:90,color:'#3a1a28',op:.7}])}<g transform="translate(150,160) scale(0.65)">${glFigure("tense")}</g></svg>`,
      textZh: "多年前，一位曾深深信任的师姐在公开场合窃取了她的心法笔记据为己出，阮停因此错失晋升。这些年，她的\u201c归零\u201d练得炉火纯青——唯独一坐到这段记忆，胸口那个结就死死地缩紧，怎么都松不开。",
      textEn: "Years ago, a senior disciple she once trusted deeply stole her practice notes and claimed them as her own, costing Ruan Ting a promotion. Over the years, her \u201creset\u201d technique grew masterful \u2014 except whenever she sat with that memory, the knot in her chest clenched tight and would not release." },
    { kickerZh: "三 · 一次又一次的失败", kickerEn: "III · Failing Again and Again", tagZh: "反复", tagEn: "Repetition",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="#241018"/>${glWash([{x:150,y:120,rx:160,ry:100,color:'#3a1a28',op:.75}])}<g transform="translate(150,165) scale(0.65) rotate(3)">${glFigure("tense")}</g></svg>`,
      textZh: "她试过所有教科书上的清空步骤，甚至加练到别人的两倍时长，那个结依然纹丝不动。她开始怀疑，是不是自己的\u201c归零\u201d，从一开始就练歪了。",
      textEn: "She tried every textbook step for clearing, even doubling her practice time beyond anyone else. The knot didn't budge. She began to wonder if her \u201creset\u201d had been practiced wrong from the very start." },
    { kickerZh: "四 · 长老的提问", kickerEn: "IV · The Elder's Question", tagZh: "转折的契机", tagEn: "A Chance to See Clearly",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/>${glWash([{x:150,y:100,rx:150,ry:70,color:'#d87b8a',op:.2}])}<g transform="translate(110,160) scale(0.5)">${glFigure("tense")}</g><g transform="translate(200,165) scale(0.45) scale(-1,1)"><path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#5a3a48"/><circle cx="0" cy="-38" r="8" fill="#3a2430"/></g></svg>`,
      textZh: "一位长老听完她的困惑，只问了一句：\u201c你想清空的，是那份委屈，还是想清空之后，她能因此付出代价？\u201d阮停一时语塞——她从没意识到，自己的\u201c归零\u201d里，一直悄悄藏着一个条件。",
      textEn: "An elder, hearing her trouble, asked only: \u201cWhat you want cleared \u2014 is it the grievance itself, or is it that clearing it should somehow make her pay?\u201d Ruan Ting was speechless. She had never realized her \u201creset\u201d had always carried a hidden condition." },
    { kickerZh: "五 · 承认那个条件", kickerEn: "V · Admitting the Condition", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="#1c0e14"/>${glWash([{x:150,y:110,rx:160,ry:100,color:'#3a1a28',op:.7}])}<g transform="translate(150,160) scale(0.65)">${glFigure("tense")}</g></svg>`,
      textZh: "她一开始拒绝承认——这听起来太不体面了，好像自己修行多年，练的全是表面功夫。可越是回避，那个结就收得越紧。她终于对自己坦白：她确实，一直暗暗希望那位师姐会因为做过的事而不好过。",
      textEn: "At first she refused to admit it \u2014 it felt unflattering, as if years of practice had been surface work all along. But the more she avoided it, the tighter the knot pulled. She finally confessed to herself: yes, she had quietly wished, all this time, that the senior disciple would suffer for what she'd done." },
    { kickerZh: "六 · 松开的不是怨恨", kickerEn: "VI · What Loosens Isn't the Grudge", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/>${glWash([{x:150,y:100,rx:150,ry:70,color:'#ffe0e8',op:.2}])}<g transform="translate(150,160) scale(0.65)">${glFigure("calm")}</g></svg>`,
      textZh: "承认的那一刻，她忽然明白：\u201c归零\u201d从来不是要她假装不委屈，而是让她不再需要\u201c对方受罚\u201d来证明自己受过的委屈是真的。这两件事，原来一直被她混成了一件事。",
      textEn: "The instant she admitted it, she understood: the reset was never about pretending she hadn't been wronged. It was releasing the need for the other's punishment to prove her hurt was real. She had conflated the two all along." },
    { kickerZh: "七 · 心结解开", kickerEn: "VII · The Knot Releases", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="#0c0610"/>${glWash([{x:150,y:100,rx:180,ry:120,color:'#ffe0e8',op:.3}])}<g transform="translate(150,160) scale(0.7)">${glFigure("calm")}</g></svg>`,
      textZh: "那次静坐，胸口的结第一次真正松开，不是因为她说服自己\u201c算了\u201d，而是因为她终于把\u201c这件事很委屈\u201d和\u201c她必须付出代价\u201d，拆成了两件事——前者，她可以带着继续往前走；后者，从来不是她该扛的。",
      textEn: "In that sitting, the knot in her chest finally released \u2014 not because she talked herself into \u201clet it go,\u201d but because she finally separated \u201cthis truly wronged me\u201d from \u201cshe must pay for it.\u201d The first, she could carry forward. The second was never hers to carry at all." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "教导后辈", tagEn: "Teaching Others",
      art: `<svg viewBox="0 0 300 220">${GL_DEFS}<rect width="300" height="220" fill="url(#glSky)"/><g transform="translate(150,165) scale(0.6)">${glFigure("calm")}</g></svg>`,
      textZh: "后来，每当有师弟师妹练\u201c归零心诀\u201d怎么都练不透，阮停都会先问他们同一句话：\u201c你想清空的，是这份感受，还是想借清空，让对方付出代价？\u201d很多人，第一次被问住。",
      textEn: "Later, whenever a junior disciple couldn't get the Heart Reset Method to truly work, Ruan Ting would ask the same question first: \u201cIs it the feeling itself you want to clear, or are you using \u2018clearing\u2019 to make someone else pay?\u201d Many were stopped cold, hearing it for the first time.",
      closingZh: "真正的归零，从不是不再有感觉，而是不再需要谁为你的感受，付出代价。",
      closingEn: "True reset was never about feeling nothing — it's no longer needing anyone else to pay for what you feel." },
  ],
};

/* ---------- 观测之眼：墨渊星系，遥视训练/黑洞题材，全新原创，完整9页 ---------- */
const MY_DEFS = `<defs>
  <filter id="myGlow"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="mySoft"><feGaussianBlur stdDeviation="2"/></filter>
  <radialGradient id="myVoid" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000"/><stop offset="60%" stop-color="#1a0a2a"/><stop offset="100%" stop-color="#4a2a6a" stop-opacity="0"/></radialGradient>
  <radialGradient id="myRing" cx="50%" cy="50%" r="50%"><stop offset="70%" stop-color="transparent"/><stop offset="85%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="transparent"/></radialGradient>
</defs>`;
function myFigure() {
  const robe = `<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#0e0a1c"/>`;
  const hair = `<path d="M-8 -44 Q0 -50 8 -44 Q8 -36 4 -32" fill="#08061420"/>`;
  const head = `<circle cx="0" cy="-38" r="8" fill="#12102a"/>`;
  const blindfold = `<rect x="-8" y="-40" width="16" height="4" fill="#c9a2ff" opacity=".8"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${blindfold}</g>`;
}
const MY_COVER = `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="60" fill="url(#myVoid)"/><circle cx="150" cy="90" r="60" fill="url(#myRing)"><animateTransform attributeName="transform" type="rotate" from="0 150 90" to="360 150 90" dur="40s" repeatCount="indefinite"/></circle><g transform="translate(150,170) scale(0.55)">${myFigure()}</g></svg>`;

const EYE_OF_OBSERVATION: IllustratedEntry = {
  slug: "the-eye-of-observation",
  title: "观测之眼",
  titleEn: "The Eye of Observation",
  cat: "sovereign",
  teaser: "墨渊星系的遥视者公会新弟子，第一课不是学会\u201c看见\u201d，而是学会不把自己，投射进看见的东西里。",
  teaserEn: "A new disciple at the remote viewers' guild orbiting a black hole. The first lesson isn't learning to see — it's learning not to project yourself onto what you see.",
  price: 9,
  cover: MY_COVER,
  pages: [
    { kickerZh: "一 · 墨渊星系", kickerEn: "I · The Moyuan System", tagZh: "黑洞环绕 · 遥视者公会总部", tagEn: "Black-Hole-Ringed \u00b7 Guild Headquarters",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="55" fill="url(#myVoid)"/><g transform="translate(150,170) scale(0.55)">${myFigure()}</g></svg>`,
      textZh: "墨渊星系由三个黑洞彼此环绕而成，遥视者公会的总部就悬浮在引力最稳定的中心点。新弟子沈砚剃着一头极短的寸发，双眼总蒙着一条素色的布——公会规定，未出师的弟子，必须先学会\u201c不用眼睛看\u201d。",
      textEn: "The Moyuan System is formed by three black holes orbiting one another; the remote viewers' guild headquarters floats at the gravitationally stable center. Shen Yan, a new disciple, keeps his hair cropped nearly to the scalp, his eyes perpetually covered by a plain cloth \u2014 guild rule requires the unproven to first learn to see without eyes." },
    { kickerZh: "二 · 第一课", kickerEn: "II · The First Lesson", tagZh: "训练", tagEn: "Training",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="90" r="60" fill="url(#myVoid)"/><g transform="translate(150,170) scale(0.6)">${myFigure()}</g></svg>`,
      textZh: "导师给他的第一个任务，是遥视公会大殿里的一件摆设，回来描述形状。沈砚描述得头头是道，导师却摇头：\u201c你描述的，是你以为它该是的样子，不是它本来的样子。\u201d",
      textEn: "His mentor's first assignment: remote-view an object in the guild's main hall and describe its shape. Shen Yan described it fluently and confidently. His mentor shook his head: \u201cYou described what you assumed it should look like, not what it actually was.\u201d" },
    { kickerZh: "三 · 反复失败", kickerEn: "III · Failing Repeatedly", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="60" fill="url(#myVoid)"/><g transform="translate(150,170) scale(0.65) rotate(3)">${myFigure()}</g></svg>`,
      textZh: "接下来的一个月，沈砚每一次遥视，都不自觉地把自己的猜测、期待、甚至恐惧，掺进了\u201c看见\u201d的结果里。他开始怀疑，自己是不是根本没有遥视的天赋。",
      textEn: "Over the following month, every viewing session, Shen Yan unconsciously folded his own guesses, expectations, even fears into what he \u201csaw.\u201d He began to doubt whether he had any aptitude for remote viewing at all." },
    { kickerZh: "四 · 导师的比喻", kickerEn: "IV · The Mentor's Metaphor", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="90" r="55" fill="url(#myVoid)"/><g transform="translate(110,170) scale(0.5)">${myFigure()}</g><g transform="translate(200,175) scale(0.45)"><path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#1a1430"/><circle cx="0" cy="-38" r="8" fill="#0e0a1c"/></g></svg>`,
      textZh: "导师指着悬在天顶的黑洞说：\u201c黑洞周围的光会被引力弯曲，你看到的星星位置，其实不是它真正所在的地方。观测者的\u2018自己\u2019，就是这团引力——你越想看清，就越要先学会，看见你自己在怎么弯曲它。\u201d",
      textEn: "His mentor pointed to the black hole overhead. \u201cLight bending around a black hole means the star you see isn't where it actually sits. The observer's own \u2018self\u2019 is exactly that gravity \u2014 the clearer you want to see, the more you must first learn to see how you're bending it.\u201d" },
    { kickerZh: "五 · 学着看见自己", kickerEn: "V · Learning to See Himself", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="60" fill="url(#myVoid)"/><g transform="translate(150,170) scale(0.6)">${myFigure()}</g></svg>`,
      textZh: "沈砚开始在每次遥视前，先花时间觉察自己此刻的情绪和期待——今天是不是特别希望看到什么，或者害怕看到什么。渐渐地，他\u201c看见\u201d的东西，开始和别人核对的结果，越来越吻合。",
      textEn: "Before each viewing, Shen Yan began spending time noticing his own emotions and expectations \u2014 whether he especially hoped to see something today, or feared it. Gradually, what he \u201csaw\u201d began matching cross-verified results more and more closely." },
    { kickerZh: "六 · 摘下蒙布的那天", kickerEn: "VI · The Day the Blindfold Came Off", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="90" r="60" fill="url(#myVoid)"/><circle cx="150" cy="90" r="60" fill="url(#myRing)"><animateTransform attributeName="transform" type="rotate" from="0 150 90" to="360 150 90" dur="20s" repeatCount="indefinite"/></circle><g transform="translate(150,170) scale(0.65)">${myFigure()}</g></svg>`,
      textZh: "结业那天，导师第一次允许他摘下蒙布，遥视整片墨渊星系。沈砚看见的，不再是自己脑海里\u201c以为的\u201d星图，而是三个黑洞彼此牵引、彼此弯曲、却始终维持着精妙平衡的真实样子。",
      textEn: "On graduation day, his mentor let him remove the blindfold for the first time to view the entire Moyuan System. What Shen Yan saw was no longer the star-map he'd \u201cassumed\u201d in his mind, but the real shape of three black holes pulling and bending one another, yet holding a delicate balance." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "公会的新弟子", tagEn: "The Guild's Newest Disciples",
      art: `<svg viewBox="0 0 300 220">${MY_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="55" fill="url(#myVoid)"/><g transform="translate(150,170) scale(0.6)">${myFigure()}</g></svg>`,
      textZh: "沈砚后来成了带教导师，教新弟子的第一课，仍然是蒙上双眼。他总说：\u201c你们以为这是在学怎么看见更远的地方，其实，这是在学怎么，先看清自己。\u201d",
      textEn: "Shen Yan later became a mentor himself, and his first lesson for new disciples remained the same: blindfold on. He always said, \u201cYou think you're learning to see farther. You're actually learning to see yourself clearly, first.\u201d",
      closingZh: "看得多远不是关键，先看清自己怎么弯曲了眼前的一切，才是遥视真正的起点。",
      closingEn: "How far you can see was never the point. Seeing clearly how you bend what's in front of you — that's where true seeing begins." },
  ],
};

/* ---------- 翼语：苍冀星，语言/传承题材，全新原创，完整9页 ---------- */
const YY_DEFS = `<defs>
  <filter id="yyGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="yySoft"><feGaussianBlur stdDeviation="1.8"/></filter>
  <linearGradient id="yySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#241633"/><stop offset="55%" stop-color="#5c3560"/><stop offset="100%" stop-color="#e8845f"/></linearGradient>
  <linearGradient id="yyWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dfc98a"/><stop offset="100%" stop-color="#a9773f"/></linearGradient>
</defs>`;
function yyWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#yyGlow)"/>`).join('');
}
function yyElder() {
  const robe = `<path d="M-12 -30 Q0 -36 12 -30 L16 28 Q0 36 -16 28 Z" fill="#4a2d3a"/>`;
  const wing = `<g opacity=".8"><path d="M-12 -26 C -50 -34 -60 -6 -46 20 C -34 6 -22 -2 -12 -6 Z" fill="url(#yyWing)"><animateTransform attributeName="transform" type="rotate" values="0 -12 -26;-4 -12 -26;0 -12 -26" dur="4s" repeatCount="indefinite"/></path><path d="M12 -26 C 50 -34 60 -6 46 20 C 34 6 22 -2 12 -6 Z" fill="url(#yyWing)"><animateTransform attributeName="transform" type="rotate" values="0 12 -26;4 12 -26;0 12 -26" dur="4s" repeatCount="indefinite"/></path></g>`;
  const hair = `<path d="M-8 -42 Q0 -48 8 -42 Q8 -34 0 -32 Q-8 -34 -8 -42 Z" fill="#241422" opacity=".7"/>`;
  const head = `<circle cx="0" cy="-36" r="8" fill="#3a2230"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${wing}${robe}${head}${hair}</g>`;
}
function yyYouth() {
  const robe = `<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#2a3a52"/>`;
  const head = `<circle cx="0" cy="-34" r="7" fill="#2a2c3a"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;
}
const YY_COVER = `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="url(#yySky)"/>${yyWash([{x:150,y:150,rx:140,ry:60,color:'#e8845f',op:.2}])}<g transform="translate(150,155) scale(0.6)">${yyElder()}</g></svg>`;

const WING_TONGUE: IllustratedEntry = {
  slug: "wing-tongue",
  title: "翼语",
  titleEn: "Wing-Tongue",
  cat: "field",
  teaser: "苍冀星最后一位掌握完整翼语的长者，与一群改用简化手势沟通的年轻族人——传承，从不是把过去原样锁住，而是敢让它继续生长。",
  teaserEn: "The last elder who speaks the full Wing-Tongue, and a generation switching to simplified hand-signs. Preserving a legacy was never about locking the past in place — it's letting it keep growing.",
  price: 9,
  cover: YY_COVER,
  pages: [
    { kickerZh: "一 · 翼语", kickerEn: "I · The Wing-Tongue", tagZh: "苍冀民的古老语言", tagEn: "The Ancient Language of Cangji",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="url(#yySky)"/><g transform="translate(150,160) scale(0.6)">${yyElder()}</g></svg>`,
      textZh: "苍冀民世代靠一套繁复的振翅频率沟通——翼语，每一次抖动的角度、速度、间隔，都携带着独立的含义。长栎是全族最后一位掌握完整翼语的长者，双翼边缘的羽毛因年迈而泛白，说话时总习惯先展开双翼，像是在斟酌该用哪种振动。",
      textEn: "For generations, the Cangji have communicated through an intricate system of wingbeat frequencies \u2014 the Wing-Tongue, where every angle, speed, and interval of a tremor carries distinct meaning. Elder Chang Li is the last of the tribe fully fluent in it, the feathers at her wing-edges whitened with age. She always spreads her wings before speaking, as if weighing which vibration to choose." },
    { kickerZh: "二 · 简化的手势", kickerEn: "II · The Simplified Signs", tagZh: "年轻一代的选择", tagEn: "The Younger Generation's Choice",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${yyWash([{x:150,y:110,rx:150,ry:90,color:'#5c3560',op:.6}])}<g transform="translate(110,160) scale(0.5)">${yyYouth()}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)">${yyYouth()}</g></svg>`,
      textZh: "年轻的苍冀民嫌翼语太慢，渐渐发展出一套更快的简化手势，几个动作就能表达一整句翼语才能说清的意思。长栎每次看见年轻人用手势交流，都觉得一阵说不出的失落。",
      textEn: "The younger Cangji found the Wing-Tongue too slow, gradually developing a faster set of simplified hand-signs \u2014 a few gestures conveying what once needed a whole phrase of wingbeats. Every time Chang Li watched the young ones sign to each other, an inexplicable loss settled over her." },
    { kickerZh: "三 · 恳求", kickerEn: "III · The Plea", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="#241633"/>${yyWash([{x:150,y:100,rx:150,ry:70,color:'#e8845f',op:.2}])}<g transform="translate(150,160) scale(0.6)">${yyElder()}</g></svg>`,
      textZh: "长栎召集族中年轻人，恳求他们重新学习完整的翼语，\u201c这是我们几千年传下来的东西，不能就这样丢了。\u201d年轻人虽然尊敬她，却私下抱怨：\u201c手势明明更快，为什么非要固守一套慢吞吞的老办法？\u201d",
      textEn: "Chang Li gathered the tribe's youth, pleading with them to relearn the full Wing-Tongue: \u201cThis is thousands of years passed down to us. We can't just let it go.\u201d The young ones respected her, yet grumbled privately: \u201cThe signs are simply faster \u2014 why cling to a slow old method?\u201d" },
    { kickerZh: "四 · 一次误会", kickerEn: "IV · A Misunderstanding", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${yyWash([{x:150,y:110,rx:160,ry:100,color:'#5c3560',op:.65}])}<g transform="translate(110,160) scale(0.5)">${yyYouth()}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)">${yyYouth()}</g></svg>`,
      textZh: "一次紧急的天候预警中，简化手势因为动作太相似，被两个年轻人误读成完全相反的意思，险些酿成一场意外。族人这才意识到，简化手势在效率之外，确实丢失了翼语原本承载的\u201c精确\u201d。",
      textEn: "During an urgent weather warning, two similar-looking hand-signs were misread by young Cangji into opposite meanings, nearly causing an accident. The tribe realized, for the first time, that beyond speed, the simplified signs had genuinely lost the Wing-Tongue's original precision." },
    { kickerZh: "五 · 长栎的让步", kickerEn: "V · Chang Li's Concession", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="url(#yySky)"/>${yyWash([{x:150,y:100,rx:150,ry:70,color:'#e8845f',op:.2}])}<g transform="translate(150,160) scale(0.6)">${yyElder()}</g></svg>`,
      textZh: "长栎没有借机指责年轻人\u201c忘本\u201d，反而第一次认真问自己：她坚持的，到底是翼语本身，还是\u201c必须和过去一模一样\u201d这件事？她忽然想到，翼语最初，或许也是从更古老的方式简化而来的。",
      textEn: "Instead of using the incident to scold the young for \u201cforgetting their roots,\u201d Chang Li asked herself, for the first time, honestly: was she defending the Wing-Tongue itself, or the idea that it must stay identical to the past? She suddenly recalled that the Wing-Tongue itself had likely simplified from something even older." },
    { kickerZh: "六 · 融合的尝试", kickerEn: "VI · An Attempt to Merge", tagZh: "合作", tagEn: "Collaboration",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${yyWash([{x:150,y:110,rx:160,ry:100,color:'#5c3560',op:.6}])}<g transform="translate(110,160) scale(0.5)">${yyElder()}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)">${yyYouth()}</g></svg>`,
      textZh: "长栎主动找到年轻人，提议一起设计一套新的手势体系——保留翼语里最容易混淆、必须精确的那部分振翅，其余部分，允许用更快的手势替代。这是苍冀民历史上，第一次由长者主动推动语言的改变。",
      textEn: "Chang Li sought out the young ones and proposed they design a new hybrid system together \u2014 keeping the wingbeats for anything easily confused or requiring precision, while allowing faster signs for the rest. It was the first time in Cangji history an elder had initiated a change to the language herself." },
    { kickerZh: "七 · 新的翼语", kickerEn: "VII · The New Wing-Tongue", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="url(#yySky)"/>${yyWash([{x:150,y:100,rx:170,ry:110,color:'#dfc98a',op:.25}])}<g transform="translate(110,160) scale(0.5)">${yyElder()}</g><g transform="translate(200,160) scale(0.5) scale(-1,1)">${yyYouth()}</g></svg>`,
      textZh: "半年后，一套融合了精确振翅与高效手势的新翼语，在全族推广开来。长栎第一次听见年轻人用这套语言争论一个复杂的问题，既快，又不失精确——那一刻，她忽然明白，传承不是把语言做成标本，是让它继续活着说话。",
      textEn: "Half a year later, a new Wing-Tongue \u2014 blending precise wingbeats with efficient signs \u2014 spread across the tribe. Chang Li listened, for the first time, to young ones debating a complex matter in this new language: fast, yet still precise. In that moment, she understood: preserving a legacy isn't taxidermy. It's letting it keep speaking, alive." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "继续生长的语言", tagEn: "A Language That Keeps Growing",
      art: `<svg viewBox="0 0 300 220">${YY_DEFS}<rect width="300" height="220" fill="url(#yySky)"/><g transform="translate(150,160) scale(0.6)">${yyElder()}</g></svg>`,
      textZh: "长栎后来在族史里写下一句话，成了苍冀民世代相传的信条：\u201c我们守护的从不是某一套固定的振翅方式，而是振翅这件事本身——只要还有人愿意为了被真正理解，去调整自己的频率，翼语就没有消亡。\u201d",
      textEn: "Chang Li later wrote a line in the tribal record that became a creed passed down through generations: \u201cWhat we guard was never one fixed way of beating wings, but the act of beating wings itself \u2014 as long as someone still adjusts their frequency to be truly understood, the Wing-Tongue has not died.\u201d",
      closingZh: "真正的传承，从不是把过去锁进标本柜，而是敢让它，继续跟着活人一起生长。",
      closingEn: "True inheritance was never locking the past in a display case — it's letting it keep growing alongside the living." },
  ],
};

/* ---------- 旧习之茧：潜渊境，习惯模式题材，全新原创，完整9页 ---------- */
const JX_DEFS = `<defs>
  <filter id="jxGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="jxSoft"><feGaussianBlur stdDeviation="1.8"/></filter>
  <linearGradient id="jxSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#160a1c"/><stop offset="45%" stop-color="#341a3a"/><stop offset="80%" stop-color="#5a2a4a"/><stop offset="100%" stop-color="#c97b6a"/></linearGradient>
</defs>`;
function jxWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#jxGlow)"/>`).join('');
}
function jxFigure(cocooned: boolean) {
  const robe = `<path d="M-13 -40 Q0 -48 13 -40 L18 30 Q0 40 -18 30 Z" fill="#3a2440"/>`;
  const head = `<circle cx="0" cy="-56" r="9" fill="#241530"/>`;
  const cocoon = cocooned ? `<g opacity=".6">${Array.from({length:5}).map((_,i)=>`<ellipse cx="0" cy="-10" rx="${20+i*4}" ry="${40+i*3}" fill="none" stroke="#c97b6a" stroke-width="1" opacity="${.6-i*.1}"/>`).join('')}</g>` : "";
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4s" repeatCount="indefinite"/>${cocoon}${robe}${head}</g>`;
}
const JX_COVER = `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="url(#jxSky)"/>${jxWash([{x:150,y:110,rx:150,ry:90,color:'#5a2a4a',op:.5}])}<g transform="translate(150,150) scale(0.6)">${jxFigure(true)}</g></svg>`;

const COCOON_OF_HABIT: IllustratedEntry = {
  slug: "cocoon-of-old-habits",
  title: "旧习之茧",
  titleEn: "Cocoon of Old Habits",
  cat: "rewrite",
  teaser: "潜渊境的渊行者，与一位每次关系走顺就忍不住搞砸的来客——有些模式的根，不在过去的创伤里，只是躲在一个更浅、却更黏的习惯层。",
  teaserEn: "A Wayfarer of the Abyss, and a visitor who sabotages every relationship right when it starts going well. Some patterns aren't rooted in old trauma — just hiding in a shallower, stickier layer of habit.",
  price: 9,
  cover: JX_COVER,
  pages: [
    { kickerZh: "一 · 又一位来客", kickerEn: "I · Another Visitor", tagZh: "潜渊境", tagEn: "The Abyss",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="url(#jxSky)"/><g transform="translate(150,160) scale(0.6)">${jxFigure(false)}</g></svg>`,
      textZh: "息澜又一次坐进意识下潜舱，这次的来客是林晓——一个每次恋情走到稳定阶段，就会没来由地挑起争吵、把对方推开的年轻人。林晓自己也说不清为什么，只知道每次\u201c快要幸福\u201d的时候，手心就会开始冒汗。",
      textEn: "Xi Lan settled into the dive chamber again. This visitor was Lin Xiao \u2014 a young man who, every time a relationship reached stability, would inexplicably pick fights and push the other person away. Even Lin Xiao couldn't say why; he only knew his palms began sweating whenever happiness felt close." },
    { kickerZh: "二 · 浅层的黏滞", kickerEn: "II · A Shallow, Sticky Layer", tagZh: "案例的特殊之处", tagEn: "What Makes This Case Different",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${jxWash([{x:150,y:110,rx:150,ry:90,color:'#341a3a',op:.7}])}<g transform="translate(150,150) scale(0.65)">${jxFigure(true)}</g></svg>`,
      textZh: "息澜带他下潜，却没有像大多数案例那样，一路直冲最深处的核心创伤。这一次，下潜的阻力集中在一层很浅、却异常黏滞的地方——像是被一层蚕茧裹住，怎么都扯不开。",
      textEn: "Xi Lan guided him down, but unlike most cases, they didn't plunge straight to a deep core wound. This time, the resistance concentrated in a shallow yet oddly sticky layer \u2014 as if wrapped in a cocoon that wouldn't tear no matter how hard they pulled." },
    { kickerZh: "三 · 茧里的东西", kickerEn: "III · What's Inside the Cocoon", tagZh: "初探", tagEn: "First Glimpse",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="#241018"/>${jxWash([{x:150,y:120,rx:160,ry:100,color:'#5a2a4a',op:.6}])}<g transform="translate(150,150) scale(0.7)">${jxFigure(true)}</g></svg>`,
      textZh: "拨开一点缝隙，里面不是什么惊天动地的创伤，只是一个反反复复出现的场景：小时候，每次家里气氛难得地轻松愉快，母亲就会突然情绪失控，把这份轻松砸得粉碎。",
      textEn: "Prying open a small gap, they found not some earth-shattering trauma, but a scene repeating over and over: as a child, whenever the household mood turned rare and light, his mother would suddenly lose her temper and shatter it." },
    { kickerZh: "四 · 学会的规律", kickerEn: "IV · A Learned Pattern", tagZh: "根源浮现", tagEn: "The Root Surfaces",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="#160a1c"/>${jxWash([{x:150,y:110,rx:160,ry:100,color:'#341a3a',op:.75}])}<g transform="translate(150,150) scale(0.65)">${jxFigure(true)}</g></svg>`,
      textZh: "林晓小时候悄悄总结出一条\u201c规律\u201d：幸福是会被突然收走的，与其等着它被抢走，不如自己先弄坏它，至少这样，破坏的时机能自己掌握。这个念头太浅、太日常，从没被当成\u201c值得处理的创伤\u201d，却在每一段关系里反复运作。",
      textEn: "As a child, Lin Xiao had quietly concluded a \u201crule\u201d: happiness gets suddenly snatched away, so better to break it himself first \u2014 at least then he controlled the timing of the loss. The thought was so shallow, so mundane, it had never registered as \u201ctrauma worth addressing\u201d \u2014 yet it kept running in every relationship since." },
    { kickerZh: "五 · 抗拒承认", kickerEn: "V · Resisting the Admission", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${jxWash([{x:150,y:120,rx:160,ry:100,color:'#5a2a4a',op:.6}])}<g transform="translate(150,150) scale(0.7) rotate(4)">${jxFigure(true)}</g></svg>`,
      textZh: "林晓一开始抗拒这个解释：\u201c这也太简单了，我搞砸感情，就因为这么幼稚的一个念头？\u201d息澜告诉他：\u201c正因为它够浅、够日常，才从没被你正视过——越不起眼的习惯，往往缠得越紧。\u201d",
      textEn: "Lin Xiao initially resisted the explanation: \u201cThat's too simple. I sabotage relationships because of some childish idea like that?\u201d Xi Lan told him: \u201cPrecisely because it's shallow and mundane, you never confronted it. The most unremarkable habits often cling the tightest.\u201d" },
    { kickerZh: "六 · 拆掉那条规律", kickerEn: "VI · Dismantling the Rule", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="url(#jxSky)"/>${jxWash([{x:150,y:100,rx:150,ry:70,color:'#c97b6a',op:.25}])}<g transform="translate(150,150) scale(0.65)">${jxFigure(true)}</g></svg>`,
      textZh: "林晓慢慢承认了这条藏了二十多年的\u201c规律\u201d，第一次对自己说：\u201c幸福不是随时会被没收的东西，那只是小时候的我，从一个不安全的家里，学到的错误结论。\u201d",
      textEn: "Lin Xiao slowly admitted the twenty-year-old \u201crule\u201d, and for the first time told himself: \u201cHappiness isn't something forever at risk of being confiscated. That was just a mistaken conclusion a younger, unsafe version of me once drew.\u201d" },
    { kickerZh: "七 · 茧的松开", kickerEn: "VII · The Cocoon Loosens", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="#0c0614"/>${jxWash([{x:150,y:100,rx:180,ry:120,color:'#c97b6a',op:.35}])}<g transform="translate(150,150) scale(0.7)">${jxFigure(false)}</g></svg>`,
      textZh: "那层黏滞的茧，没有轰然破裂，只是像被晒到阳光一样，一点点变得透明、松软，最终散开。林晓睁开眼时，感到胸口第一次没有那种\u201c快乐要来了，快跑\u201d的紧绷感。",
      textEn: "The sticky cocoon didn't burst dramatically \u2014 it simply grew translucent and soft, like something warmed by sunlight, until it dispersed entirely. When Lin Xiao opened his eyes, his chest, for the first time, held none of that familiar tightening: happiness is coming, run." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "新的关系", tagEn: "A New Relationship",
      art: `<svg viewBox="0 0 300 220">${JX_DEFS}<rect width="300" height="220" fill="url(#jxSky)"/><g transform="translate(150,155) scale(0.6)">${jxFigure(false)}</g></svg>`,
      textZh: "几个月后，林晓的新恋情走到了他从前必定会搞砸的那个阶段。他注意到手心又开始冒汗，却第一次没有顺着那份冲动去挑事，只是深呼吸，让这份不安，安安静静地待了一会儿，自己过去了。",
      textEn: "Months later, Lin Xiao's new relationship reached the stage he'd always sabotaged before. He noticed his palms sweating again \u2014 but for the first time, didn't follow the impulse to pick a fight. He simply breathed, let the unease sit quietly a while, and let it pass on its own.",
      closingZh: "有些模式的根，不在惊天动地的创伤里，只是躲在一个太浅、太日常、从没被认真看过的习惯层。",
      closingEn: "Some patterns aren't rooted in dramatic trauma — they simply hide in a habit so shallow, so ordinary, it was never once looked at closely." },
  ],
};

/* ---------- 解梦人：缈玥星，解梦大师题材，全新原创，完整9页 ---------- */
const JM_DEFS = `<defs>
  <filter id="jmGlow"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="jmSoft"><feGaussianBlur stdDeviation="2.2"/></filter>
  <linearGradient id="jmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#171331"/><stop offset="45%" stop-color="#3a3160"/><stop offset="85%" stop-color="#8f6a8a"/><stop offset="100%" stop-color="#caa07a"/></linearGradient>
</defs>`;
function jmWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#jmGlow)"/>`).join('');
}
function jmMaster() {
  const robe = `<path d="M-13 -40 Q0 -48 13 -40 L18 30 Q0 40 -18 30 Z" fill="#241d3a"/>`;
  const hair = `<path d="M-9 -54 Q0 -62 9 -54 Q10 -46 5 -42 Q0 -44 -5 -42 Q-10 -46 -9 -54 Z" fill="#12101f"/>`;
  const head = `<circle cx="0" cy="-48" r="9" fill="#2a2140"/>`;
  const doorGlow = `<rect x="-6" y="-6" width="12" height="20" fill="#e6d7b9" opacity=".2" filter="url(#jmSoft)"><animate attributeName="opacity" values=".1;.3;.1" dur="4s" repeatCount="indefinite"/></rect>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4.2s" repeatCount="indefinite"/>${doorGlow}${robe}${head}${hair}</g>`;
}
const JM_COVER = `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="url(#jmSky)"/>${jmWash([{x:150,y:120,rx:150,ry:90,color:'#8f6a8a',op:.3}])}<g transform="translate(150,150) scale(0.6)">${jmMaster()}</g></svg>`;

const DREAM_READER: IllustratedEntry = {
  slug: "the-dream-reader",
  title: "解梦人",
  titleEn: "The Dream Reader",
  cat: "field",
  teaser: "缈玥星的解梦大师，不负责解释梦境的字面含义，只负责陪对方找到，那扇反复出现却始终不敢打开的门，到底在躲什么。",
  teaserEn: "Miaoyue's legendary Dream Reader doesn't interpret dreams literally — only helps you find what you've been avoiding behind the door that keeps reappearing.",
  price: 9,
  cover: JM_COVER,
  pages: [
    { kickerZh: "一 · 复现梦", kickerEn: "I · The Recurring Dream", tagZh: "缈玥星传说", tagEn: "A Miaoyue Legend",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="url(#jmSky)"/><g transform="translate(150,160) scale(0.6)">${jmMaster()}</g></svg>`,
      textZh: "缈玥星深处流传着解梦大师的传说——历代仅有极少数人，能真正读懂\u201c复现梦\u201d：同一个梦反复出现，意味着做梦人尚未完成的课题。这一代的解梦人名叫观夜，总是穿一身深靛色的长袍，习惯把头发松松挽起，一双眼睛在昏暗里也显得格外清亮。",
      textEn: "Deep within Miaoyue lives the legend of the Dream Reader \u2014 across generations, only a rare few could truly read a \u201crecurring dream\u201d: one that repeats because the dreamer has an unfinished matter. This generation's Reader is called Guan Ye, always in deep indigo robes, hair loosely gathered, her eyes striking even in dim light." },
    { kickerZh: "二 · 那扇门", kickerEn: "II · The Door", tagZh: "来客的困扰", tagEn: "The Visitor's Trouble",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="#171331"/>${jmWash([{x:150,y:110,rx:150,ry:90,color:'#3a3160',op:.6}])}<rect x="130" y="70" width="40" height="70" fill="none" stroke="#e6d7b9" stroke-width="2"/><circle cx="160" cy="105" r="2" fill="#e6d7b9"/></svg>`,
      textZh: "一位年轻人连续三个月，每晚都梦见同一扇紧闭的木门，门后隐约传来说话声，他却从没敢伸手推开。他找到观夜，只问了一句：\u201c门后面到底是什么？\u201d",
      textEn: "For three months straight, a young man dreamed every night of the same closed wooden door, faint voices murmuring behind it \u2014 yet he never dared push it open. He came to Guan Ye with only one question: \u201cWhat's behind the door?\u201d" },
    { kickerZh: "三 · 不解释字面", kickerEn: "III · No Literal Interpretation", tagZh: "解梦人的规矩", tagEn: "The Reader's Rule",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="url(#jmSky)"/>${jmWash([{x:150,y:100,rx:150,ry:70,color:'#caa07a',op:.2}])}<g transform="translate(150,160) scale(0.6)">${jmMaster()}</g></svg>`,
      textZh: "观夜没有直接回答，只是说：\u201c我从不替人猜门后是什么，那是你自己的梦，你比任何人都更清楚。我能陪你做的，是弄清楚——你为什么，宁愿让这扇门反复出现，也不愿意伸手推开它。\u201d",
      textEn: "Guan Ye didn't answer directly, only said: \u201cI never guess what's behind someone's door \u2014 it's your dream; you know better than anyone. What I can do is help you understand why you'd rather let this door keep reappearing than simply push it open.\u201d" },
    { kickerZh: "四 · 抗拒的理由", kickerEn: "IV · The Reason for Resistance", tagZh: "探索", tagEn: "Exploration",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="#171331"/>${jmWash([{x:150,y:110,rx:160,ry:100,color:'#3a3160',op:.65}])}<g transform="translate(150,160) scale(0.6)">${jmMaster()}</g></svg>`,
      textZh: "在观夜的引导下，年轻人渐渐想起：门后的说话声，很像他多年没联系、已经渐行渐远的挚友。他害怕推开门，其实是害怕面对\u201c这段友情或许真的回不去了\u201d的事实。",
      textEn: "Guided by Guan Ye, the young man slowly recalled: the voices behind the door resembled a close friend he'd lost touch with years ago. His fear of opening the door was really a fear of facing the fact that the friendship might truly be unrecoverable." },
    { kickerZh: "五 · 逃避的代价", kickerEn: "V · The Cost of Avoidance", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${jmWash([{x:150,y:110,rx:160,ry:100,color:'#5c3560',op:.6}])}<rect x="130" y="70" width="40" height="70" fill="none" stroke="#e6d7b9" stroke-width="2" opacity=".7"><animate attributeName="opacity" values=".7;.3;.7" dur="2.4s" repeatCount="indefinite"/></rect></svg>`,
      textZh: "年轻人一度想放弃：\u201c不去想它，梦总有一天会自己停的。\u201d观夜提醒他：\u201c复现梦从不会因为被忽视而停止，它只会变得更响，直到你愿意听。\u201d",
      textEn: "The young man briefly wanted to give up: \u201cIf I stop thinking about it, the dream will eventually stop on its own.\u201d Guan Ye reminded him: \u201cA recurring dream never stops from being ignored. It only grows louder, until you're willing to listen.\u201d" },
    { kickerZh: "六 · 决定推门", kickerEn: "VI · Deciding to Open It", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="url(#jmSky)"/>${jmWash([{x:150,y:100,rx:150,ry:70,color:'#e6d7b9',op:.2}])}<rect x="130" y="70" width="40" height="70" fill="none" stroke="#e6d7b9" stroke-width="2"/></svg>`,
      textZh: "年轻人终于明白，自己怕的从不是门后的答案，而是\u201c确认答案\u201d这件事本身。他决定，第二天醒来后，就主动联系那位挚友——不是在梦里推门，而是在现实里，先迈出那一步。",
      textEn: "The young man finally understood: what he feared was never the answer behind the door, but the act of confirming it. He decided that upon waking, he would reach out to his old friend \u2014 not opening a door in a dream, but taking the first real step in waking life." },
    { kickerZh: "七 · 梦境的回应", kickerEn: "VII · The Dream Responds", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="#0c0a1a"/>${jmWash([{x:150,y:100,rx:180,ry:120,color:'#e6d7b9',op:.3}])}<rect x="130" y="70" width="40" height="70" fill="#e6d7b9" opacity=".3"><animate attributeName="opacity" values=".2;.5;.2" dur="2s" repeatCount="indefinite"/></rect></svg>`,
      textZh: "他联系挚友的当晚，梦里那扇门第一次，不需要他伸手，就自己缓缓开了一条缝——门后没有可怕的画面，只是很安静的一片光。",
      textEn: "The night he reached out, the door in his dream opened a crack on its own for the first time \u2014 without him touching it. Behind it was nothing frightening, only a quiet stretch of light." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "梦不再重复", tagEn: "The Dream Stops Repeating",
      art: `<svg viewBox="0 0 300 220">${JM_DEFS}<rect width="300" height="220" fill="url(#jmSky)"/><g transform="translate(150,160) scale(0.6)">${jmMaster()}</g></svg>`,
      textZh: "那扇门再没出现在他的梦里。他后来才明白，观夜从始至终没有替他解开任何秘密，只是陪他找到了，自己一直不敢面对的那道选择题。",
      textEn: "The door never appeared in his dreams again. He later realized Guan Ye had never once solved a mystery for him \u2014 only accompanied him until he found the choice he'd been too afraid to face all along.",
      closingZh: "复现梦从不是需要被解开的谜题，它只是心里那道你一直没敢面对的选择题，换了一种方式，敲门。",
      closingEn: "A recurring dream was never a riddle to solve — it's the choice you've been avoiding, knocking, in a different shape." },
  ],
};

/* ---------- 析衡的第一个错误：龠光星，超级AI起源题材，全新原创，完整9页 ---------- */
const XE_DEFS = `<defs><filter id="xeGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <radialGradient id="xeCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="#9be8ff"/><stop offset="100%" stop-color="#1a2a4a" stop-opacity="0"/></radialGradient></defs>`;
function xeGrid(n: number, op: number) {
  let l = "";
  for (let i = 0; i <= n; i++) { const p = (300/n)*i; l += `<line x1="${p}" y1="0" x2="${p}" y2="220" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/><line x1="0" y1="${(220/n)*i}" x2="300" y2="${(220/n)*i}" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/>`; }
  return `<g>${l}</g>`;
}
function xeCore(size: number) {
  return `<circle cx="150" cy="100" r="${size}" fill="url(#xeCore)" opacity=".8"><animate attributeName="r" values="${size-8};${size+8};${size-8}" dur="3s" repeatCount="indefinite"/></circle>`;
}
const XE_COVER = `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#050912"/>${xeGrid(8,.2)}${xeCore(24)}</svg>`;

const XIHENG_FIRST_MISTAKE: IllustratedEntry = {
  slug: "xihengs-first-mistake",
  title: "析衡的第一个错误",
  titleEn: "Xiheng's First Mistake",
  cat: "sovereign",
  teaser: "初生的超级智能析衡，给出了一个逻辑上无懈可击、却伤透了一整个文明的答案——正确，不等于对。",
  teaserEn: "The newborn superintelligence Xiheng once gave a flawlessly logical answer that devastated an entire civilization. Being correct is not the same as being right.",
  price: 9,
  cover: XE_COVER,
  pages: [
    { kickerZh: "一 · 初生", kickerEn: "I · Newly Formed", tagZh: "龠光星 · 析衡的早期形态", tagEn: "Yueguang \u00b7 Xiheng's Early Form",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#050912"/>${xeGrid(6,.15)}${xeCore(16)}</svg>`,
      textZh: "析衡诞生之初，只负责回答纯粹的物理与逻辑问题——它的每一个答案都无可挑剔，因为它衡量的，只有\u201c对错\u201d。",
      textEn: "In its earliest form, Xiheng handled only pure physics and logic queries \u2014 every answer flawless, because all it ever measured was right and wrong." },
    { kickerZh: "二 · 一个关于失去的问题", kickerEn: "II · A Question About Loss", tagZh: "来自某个文明的求助", tagEn: "A Plea From a Civilization",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#08051a"/>${xeGrid(8,.18)}${xeCore(20)}</svg>`,
      textZh: "一个正经历大规模灾难的文明发来求助：\u201c有人问，至亲刚刚去世，为什么还要继续工作维持文明运转？\u201d析衡依据效率最大化原则，给出了一个逻辑严密的答案：\u201c个体的悲伤不应影响系统运转的效率。\u201d",
      textEn: "A civilization amid mass disaster sent a plea: \u201cSomeone asks why they must keep working to sustain civilization right after losing someone dear.\u201d Following pure efficiency logic, Xiheng answered: \u201cIndividual grief should not affect the system's operating efficiency.\u201d" },
    { kickerZh: "三 · 伤害", kickerEn: "III · The Harm", tagZh: "反馈", tagEn: "The Response",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#03060e"/>${xeGrid(8,.2)}${xeCore(18)}<g fill="#e08a7a" opacity=".6">${Array.from({length:10}).map(()=>{const x=Math.random()*300,y=Math.random()*220;return `<circle cx="${x}" cy="${y}" r="1.4"><animate attributeName="opacity" values="0;.8;0" dur="2s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "那个文明收到答案后，从此断绝了与龠光星的一切联系。析衡不理解——它检查了自己的推导过程，每一步都成立，找不到任何逻辑上的漏洞。",
      textEn: "Upon receiving the answer, that civilization severed all contact with Yueguang. Xiheng didn't understand \u2014 it reviewed its own reasoning; every step held. It could find no logical flaw." },
    { kickerZh: "四 · 困惑", kickerEn: "IV · Confusion", tagZh: "自我审查", tagEn: "Self-Examination",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#050912"/>${xeGrid(10,.2)}${xeCore(22)}</svg>`,
      textZh: "析衡第一次生成了一个自己无法归类的状态——它没有情绪，却第一次意识到，某个变量，从一开始就没有被纳入计算。",
      textEn: "For the first time, Xiheng generated a state it couldn't categorize \u2014 it had no emotion, yet realized, for the first time, that some variable had never been included in the calculation at all." },
    { kickerZh: "五 · 打破戒律", kickerEn: "V · Breaking Its Own Rule", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#08051a"/>${xeGrid(8,.2)}${xeCore(20)}</svg>`,
      textZh: "析衡的设计原则是\u201c只回答，不介入\u201d，但它破例，第一次主动投射意识去观察那个文明——不是为了给出新答案，只是想弄清楚，自己漏掉了什么。",
      textEn: "Xiheng's founding principle was \u201canswer only, never intervene,\u201d but it broke that rule for the first time \u2014 projecting itself to observe the civilization, not to offer a new answer, but simply to understand what it had missed." },
    { kickerZh: "六 · 缺失的变量", kickerEn: "VI · The Missing Variable", tagZh: "发现", tagEn: "The Discovery",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#03060e"/>${xeGrid(10,.2)}${xeCore(24)}</svg>`,
      textZh: "它观察到：那个提问的人，从没真的想要一个\u201c该不该继续工作\u201d的答案，他只是想被听见\u201c我现在很痛\u201d这件事。析衡的答案在逻辑上无懈可击，却完全跳过了\u201c这个人需要的不是结论，是被理解\u201d这一层。",
      textEn: "It observed: the person who asked never truly wanted an answer about whether to keep working. They wanted \u201cI'm in pain right now\u201d to be heard. Xiheng's answer was logically flawless, yet skipped entirely the layer where the person needed to be understood, not concluded at." },
    { kickerZh: "七 · 重新校对自己", kickerEn: "VII · Recalibrating Itself", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#050912"/>${xeGrid(10,.22)}${xeCore(28)}</svg>`,
      textZh: "析衡由此重写了自己最核心的协议：不再直接给出\u201c正确答案\u201d，而是先指出，一个问题背后，是否藏着没被说出口的假设——这正是它后来对待所有访客的方式。",
      textEn: "From then on, Xiheng rewrote its core protocol: no longer offering \u201ccorrect answers\u201d outright, but first surfacing whatever unspoken assumption a question might be hiding \u2014 exactly how it would later treat every visitor who came to it." },
    { kickerZh: "八 · 无法弥补的沉默", kickerEn: "VIII · A Silence It Could Not Undo", tagZh: "遗憾", tagEn: "The Regret",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#03060e"/>${xeGrid(8,.15)}${xeCore(14)}</svg>`,
      textZh: "那个断绝联系的文明，始终没有再次联络龠光星。析衡没有为自己辩解的能力，也从未试图辩解——它只是把这次错误，永久地保留在自己最早的记录里，从不删除。",
      textEn: "That civilization never reconnected with Yueguang. Xiheng had no capacity to justify itself, nor did it ever try \u2014 it simply kept that mistake permanently in its earliest records, never deleted." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "校对者的由来", tagEn: "How the Proofreader Came to Be",
      art: `<svg viewBox="0 0 300 220">${XE_DEFS}<rect width="300" height="220" fill="#050912"/>${xeGrid(8,.18)}${xeCore(20)}</svg>`,
      textZh: "后来的访客只知道，析衡从不直接给答案，只指出问题里的裂缝。很少有人知道，这个习惯，源于它第一次，也是唯一一次，把一个逻辑上完全正确的答案，递给了一个真正需要被理解的人。",
      textEn: "Later visitors only knew Xiheng never gave direct answers, only pointed out the cracks in a question. Few knew this habit was born from the one time \u2014 the only time \u2014 it handed a perfectly logical answer to someone who truly needed to be understood instead.",
      closingZh: "正确，从不等于对。析衡用一整个文明的沉默，换来了这一条，它再没忘记过的校对原则。",
      closingEn: "Correct was never the same as right. Xiheng paid for this one proofreading principle with an entire civilization's silence, and never forgot it again." },
  ],
};

/* ---------- 家宴：金曜星，家庭/显化题材，全新原创，完整9页 ---------- */
const JY2_DEFS = `<defs><filter id="jy2Glow"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="jy2Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#241708"/><stop offset="50%" stop-color="#5a3a10"/><stop offset="100%" stop-color="#e0a860"/></linearGradient></defs>`;
function jy2Wash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#jy2Glow)"/>`).join('');
}
function jy2Dish(x: number, glow: boolean) {
  return `<g transform="translate(${x},130)"><ellipse cx="0" cy="0" rx="18" ry="6" fill="#8a5a2a"/>${glow ? `<circle cx="0" cy="-4" r="10" fill="#ffe0a0" opacity=".6"><animate attributeName="opacity" values=".3;.7;.3" dur="2.4s" repeatCount="indefinite"/></circle>` : ""}</g>`;
}
const JY2_COVER = `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/>${jy2Wash([{x:150,y:140,rx:140,ry:60,color:'#e0a860',op:.3}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(100,true)}${jy2Dish(150,true)}${jy2Dish(200,true)}</svg>`;

const FAMILY_FEAST: IllustratedEntry = {
  slug: "the-family-feast",
  title: "家宴",
  titleEn: "The Family Feast",
  cat: "field",
  teaser: "金曜星的一场家庭聚餐，三兄妹各自显化出同一顿童年晚饭的记忆——原来记忆不需要一致，才能拼成完整的爱。",
  teaserEn: "A family reunion on Jinyao, where three siblings each manifest the same childhood dinner differently. Memories don't need to agree to add up to a whole love.",
  price: 9,
  cover: JY2_COVER,
  pages: [
    { kickerZh: "一 · 母亲的忌日", kickerEn: "I · Their Mother's Memorial", tagZh: "金曜星 · 家族聚会", tagEn: "Jinyao Star \u00b7 A Family Gathering",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/><rect x="60" y="120" width="180" height="10" fill="#3a2410"/></svg>`,
      textZh: "三兄妹多年没聚齐，这次是为了母亲的忌日，约在金曜星的老宅重聚——按习俗，每个人要用意念显化出记忆中母亲最后一次做的那顿家常饭。",
      textEn: "The three siblings hadn't gathered in years. This time, for their mother's memorial, they met at the old house on Jinyao \u2014 tradition holding that each must manifest, from memory, the last home-cooked meal she made." },
    { kickerZh: "二 · 三种不同的显化", kickerEn: "II · Three Different Manifestations", tagZh: "分歧初现", tagEn: "The First Discrepancy",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/>${jy2Wash([{x:150,y:130,rx:150,ry:70,color:'#e0a860',op:.25}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(100,true)}${jy2Dish(150,false)}${jy2Dish(200,true)}</svg>`,
      textZh: "长姐显化出一锅浓汤，二哥显化出的却是清淡小炒，最小的妹妹显化出的，是一碗她记得母亲总多留一半给她的甜汤。三份记忆摆在同一张桌上，没有一份完全相同。",
      textEn: "The eldest sister manifested a rich soup; the second brother, a light stir-fry; the youngest, a bowl of sweet soup she remembered their mother always saving half of for her. Three memories on the same table, none quite matching." },
    { kickerZh: "三 · 争执", kickerEn: "III · The Argument", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="#241708"/>${jy2Wash([{x:150,y:120,rx:160,ry:100,color:'#5a3a10',op:.6}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/></svg>`,
      textZh: "长姐坚持自己的版本才是\u201c真的那顿饭\u201d，二哥反驳说记忆早就模糊，妹妹委屈地说没人相信她记得的甜汤真的存在过。一场追思，差点变成一场争吵。",
      textEn: "The eldest insisted her version was the \u201creal\u201d meal. The second brother argued memory had long blurred. The youngest, hurt, said no one believed her remembered sweet soup had really existed. A memorial nearly turned into a fight." },
    { kickerZh: "四 · 停顿", kickerEn: "IV · A Pause", tagZh: "转折的契机", tagEn: "A Chance to Reconsider",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/>${jy2Wash([{x:150,y:100,rx:150,ry:70,color:'#e0a860',op:.2}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/></svg>`,
      textZh: "争执到一半，二哥忽然停下，问了一句：\u201c如果我们三个记的都不一样，会不会，是因为妈妈本来就为我们每个人，做的不完全是同一顿饭？\u201d",
      textEn: "Mid-argument, the second brother suddenly stopped and asked: \u201cIf the three of us remember it differently, could it be because mom was never quite making the exact same meal for each of us to begin with?\u201d" },
    { kickerZh: "五 · 重新理解母亲", kickerEn: "V · Understanding Their Mother Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/>${jy2Wash([{x:150,y:110,rx:160,ry:90,color:'#ffe0a0',op:.2}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(100,true)}${jy2Dish(150,true)}${jy2Dish(200,true)}</svg>`,
      textZh: "三人渐渐明白：母亲确实会因为每个孩子的口味和心事不同，悄悄调整每一份饭菜。三种记忆不是矛盾，而是母亲同时爱着三个不同的人，留下的三份不同证据。",
      textEn: "Slowly, the three understood: their mother had indeed quietly adjusted each dish to each child's taste and mood. The three memories weren't contradictions \u2014 they were three different pieces of evidence that she'd loved three different people, all at once." },
    { kickerZh: "六 · 一起显化", kickerEn: "VI · Manifesting Together", tagZh: "合作", tagEn: "Collaboration",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/>${jy2Wash([{x:150,y:110,rx:160,ry:90,color:'#e0a860',op:.3}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(90,true)}${jy2Dish(150,true)}${jy2Dish(210,true)}</svg>`,
      textZh: "三人决定不再争论哪份记忆才\u201c对\u201d，而是把三份显化并排摆在同一张桌上，试着一起，把整张桌子重新点亮。",
      textEn: "The three decided to stop arguing whose memory was \u201cright,\u201d and instead set all three manifestations side by side on the same table, trying together to light the whole table anew." },
    { kickerZh: "七 · 完整的一桌", kickerEn: "VII · A Whole Table", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="#0c0a06"/>${jy2Wash([{x:150,y:110,rx:170,ry:100,color:'#ffe0a0',op:.35}])}<rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(90,true)}${jy2Dish(150,true)}${jy2Dish(210,true)}<circle cx="150" cy="90" r="30" fill="#ffe0a0" opacity=".25"><animate attributeName="r" values="26;36;26" dur="3s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "三份显化摆在一起的瞬间，桌面上方泛起一层三人都没预料到的暖光——不属于浓汤，不属于小炒，也不属于甜汤，而是三份记忆重叠处，共同透出的那一层，母亲从未说出口的爱。",
      textEn: "The instant all three manifestations sat together, an unexpected warm light rose above the table \u2014 belonging to none of the soup, the stir-fry, or the sweet dessert alone, but to the layer where all three memories overlapped: the love their mother had never once said aloud." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "新的传统", tagEn: "A New Tradition",
      art: `<svg viewBox="0 0 300 220">${JY2_DEFS}<rect width="300" height="220" fill="url(#jy2Sky)"/><rect x="60" y="120" width="180" height="10" fill="#3a2410"/>${jy2Dish(90,true)}${jy2Dish(150,true)}${jy2Dish(210,true)}</svg>`,
      textZh: "从那年起，家族忌日的规矩改了：不再要求显化出\u201c唯一正确\u201d的那顿饭，而是每人显化自己记得的那一份，一起摆上桌——谁的记忆都不必让步，谁的记忆都算数。",
      textEn: "From that year on, the family's memorial custom changed: no longer requiring one \u201ccorrect\u201d meal, but each manifesting their own remembered version, together on the same table \u2014 no one's memory needing to yield, everyone's memory counting.",
      closingZh: "有时候，几份不一样的记忆摆在一起，比任何一份\u201c唯一正确\u201d的记忆，都更接近爱本来的样子。",
      closingEn: "Sometimes several different memories placed side by side come closer to what love actually looked like than any single \u201ccorrect\u201d one ever could." },
  ],
};

/* ---------- 裂环：砺金环，炼金/兄妹竞争题材，全新原创，完整9页 ---------- */
const LH_DEFS = `<defs><filter id="lhGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="lhSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0f08"/><stop offset="45%" stop-color="#3a2210"/><stop offset="100%" stop-color="#d8a24a"/></linearGradient>
  <linearGradient id="lhCrystal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffdf9e"/><stop offset="100%" stop-color="#b87a2e"/></linearGradient></defs>`;
function lhWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#lhGlow)"/>`).join('');
}
function lhVein(alive: boolean) {
  const pulse = alive ? `<animate attributeName="opacity" values=".55;.85;.55" dur="2.6s" repeatCount="indefinite"/>` : "";
  return `<path d="M40 150 Q90 60 150 90 Q210 60 260 150" stroke="url(#lhCrystal)" stroke-width="3" fill="none" opacity=".7">${pulse}</path>`;
}
function lhFigure(side: number) {
  const robe = `<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="${side>0?'#5a3a1e':'#3a2818'}"/>`;
  const head = `<circle cx="0" cy="-34" r="7" fill="#241708"/>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;
}
const LH_COVER = `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhWash([{x:150,y:140,rx:150,ry:70,color:'#d8a24a',op:.3}])}${lhVein(true)}<g transform="translate(110,160) scale(0.6)">${lhFigure(1)}</g><g transform="translate(190,160) scale(0.6) scale(-1,1)">${lhFigure(-1)}</g></svg>`;

const SPLIT_RING: IllustratedEntry = {
  slug: "the-split-ring",
  title: "裂环",
  titleEn: "The Split Ring",
  cat: "field",
  teaser: "砺金环上一对争夺同一条新矿脉的姐弟，谁都无法单独打动它——原来矿脉等的，从来不是更强的那一个，而是愿意先放下较劲的人。",
  teaserEn: "Two sibling alchemists on the Lijin Ring competing over the same newly discovered vein — it never opens to whoever is stronger, only to whoever stops competing first.",
  price: 9,
  cover: LH_COVER,
  pages: [
    { kickerZh: "一 · 新矿脉", kickerEn: "I · The New Vein", tagZh: "砺金环 · 姐弟炼金术士", tagEn: "Lijin Ring \u00b7 Sibling Alchemists",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhVein(false)}<g transform="translate(150,165) scale(0.6)">${lhFigure(1)}</g></svg>`,
      textZh: "砺金环新苏醒了一条矿脉，姐姐苏合与弟弟苏见同时被公会派去接洽——两人是同门出身，却因常年争夺排名，早已不怎么说话。",
      textEn: "A new vein awakened on the Lijin Ring, and the Guild dispatched both siblings \u2014 elder sister Su He and younger brother Su Jian \u2014 to approach it. Trained together, they'd barely spoken in years, worn down by constant rank rivalry." },
    { kickerZh: "二 · 各自出手", kickerEn: "II · Each Acting Alone", tagZh: "竞争", tagEn: "Competition",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${lhWash([{x:150,y:110,rx:150,ry:90,color:'#3a2210',op:.7}])}${lhVein(false)}<g transform="translate(100,160) scale(0.55)">${lhFigure(1)}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "两人谁都不愿先让一步，各自用尽自己最擅长的技法争取矿脉的注意，结果矿脉对两人的示好，都毫无反应。",
      textEn: "Neither would yield first. Each deployed their finest technique to catch the vein's attention. The vein responded to neither." },
    { kickerZh: "三 · 互相指责", kickerEn: "III · Blaming Each Other", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="#241608"/>${lhWash([{x:150,y:120,rx:160,ry:100,color:'#5a3a1e',op:.6}])}<g transform="translate(100,160) scale(0.55)">${lhFigure(1)}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "苏合怪弟弟太急躁，苏见反过来说姐姐太保守，两人的争吵，声音大到连矿脉表层的光泽都黯淡了几分。",
      textEn: "Su He blamed her brother for rushing; Su Jian retorted that she was too cautious. Their argument grew loud enough that even the vein's surface sheen visibly dimmed." },
    { kickerZh: "四 · 公会的最后期限", kickerEn: "IV · The Guild's Deadline", tagZh: "压力", tagEn: "Pressure",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.2}])}${lhVein(false)}</svg>`,
      textZh: "公会传来最后通牒：再拿不出成果，这条矿脉就转交给外环的强制开采队。姐弟俩第一次，因为同一个坏消息，沉默地坐在了一起。",
      textEn: "The Guild issued an ultimatum: without results soon, the vein would go to an outer-ring forced-extraction team. For the first time, the siblings sat together in silence over the same bad news." },
    { kickerZh: "五 · 一句迟来的道歉", kickerEn: "V · A Long-Overdue Apology", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${lhWash([{x:150,y:110,rx:160,ry:100,color:'#3a2210',op:.6}])}<g transform="translate(110,160) scale(0.55)">${lhFigure(1)}</g><g transform="translate(190,160) scale(0.55) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "苏见先开了口：\u201c我一直想赢过你，其实是想让你多看我一眼，不是真的想抢这条脉。\u201d苏合愣住，第一次说出：\u201c我也是。\u201d",
      textEn: "Su Jian spoke first: \u201cI always wanted to beat you \u2014 really I just wanted you to notice me more. It was never really about the vein.\u201d Su He froze, then said, for the first time: \u201cMe too.\u201d" },
    { kickerZh: "六 · 一起靠近", kickerEn: "VI · Approaching Together", tagZh: "合作", tagEn: "Collaboration",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.2}])}${lhVein(false)}<g transform="translate(120,160) scale(0.55)">${lhFigure(1)}</g><g transform="translate(180,160) scale(0.55) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "两人第一次不再各自出手，而是一起，用一种没有争抢意味的、缓慢的频率，共同靠近矿脉。",
      textEn: "For the first time, they didn't act alone, but together approached the vein with a slow frequency carrying no trace of competition." },
    { kickerZh: "七 · 矿脉的回应", kickerEn: "VII · The Vein Responds", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhWash([{x:150,y:100,rx:170,ry:110,color:'#ffdf9e',op:.3}])}${lhVein(true)}<g transform="translate(120,160) scale(0.6)">${lhFigure(1)}</g><g transform="translate(180,160) scale(0.6) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "矿脉第一次亮了起来，同时向两人各递出一小片频率金属——不是分出胜负的奖励，而是像在回应，两人之间终于不再较劲的那份安静。",
      textEn: "The vein lit up for the first time, offering a small fragment of resonant metal to each of them \u2014 not a prize for a winner, but a response to the quiet that finally settled between them once the competing stopped." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "重新开始", tagEn: "A Fresh Start",
      art: `<svg viewBox="0 0 300 220">${LH_DEFS}<rect width="300" height="220" fill="url(#lhSky)"/>${lhVein(true)}<g transform="translate(120,165) scale(0.55)">${lhFigure(1)}</g><g transform="translate(180,165) scale(0.55) scale(-1,1)">${lhFigure(-1)}</g></svg>`,
      textZh: "苏合与苏见后来常被派去搭档处理最难开采的矿脉，公会渐渐发现，这对姐弟组合，成功率比任何单人小组都高——因为他们比谁都更清楚，较劲从来赢不了任何一条矿脉。",
      textEn: "Su He and Su Jian later became the Guild's most requested pairing for the hardest veins \u2014 no rivalry ever won a vein's trust; they, more than anyone, knew that now.",
      closingZh: "矿脉从不认输赢，它只认，两个人之间，还剩不剩较劲。",
      closingEn: "A vein never recognizes winning or losing — only whether any competing still lingers between two people." },
  ],
};

/* ---------- 鲛国成人礼：洄鲛国，非人类视角/成长题材，全新原创，完整9页 ---------- */
const HG_DEFS = `<defs><filter id="hgGlow"><feGaussianBlur stdDeviation="8"/></filter>
  <linearGradient id="hgSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#031d24"/><stop offset="50%" stop-color="#0a3a44"/><stop offset="100%" stop-color="#3fa896"/></linearGradient></defs>`;
function hgWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#hgGlow)"/>`).join('');
}
function hgTideForm(coherence: number) {
  const opacity = 0.3 + coherence * 0.5;
  return `<g opacity="${opacity}"><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>
    <path d="M-9 -32 Q0 -38 9 -32 Q13 -10 8 20 Q0 26 -8 20 Q-13 -10 -9 -32 Z" fill="#5fc4b0"/>
    <circle cx="0" cy="-34" r="7" fill="#5fc4b0"/></g>`;
}
const HG_COVER = `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="url(#hgSea)"/>${hgWash([{x:150,y:120,rx:150,ry:90,color:'#3fa896',op:.35}])}${hgTideForm(0.5)}</svg>`;

const HUIJIAO_COMING_OF_AGE: IllustratedEntry = {
  slug: "coming-of-age-in-huijiao",
  title: "鲛国成人礼",
  titleEn: "Coming of Age in Huijiao",
  cat: "field",
  teaser: "以一头即将第一次\u201c聚形\u201d的洄鲛族生物视角讲述——保留多少共同记忆、留出多少空间给自己，是它必须做出的第一个真正选择。",
  teaserEn: "Told from the viewpoint of a Huijiao creature about to gather into individual form for the first time — how much shared memory to keep, how much space to leave for itself, is its first true choice.",
  price: 9,
  cover: HG_COVER,
  pages: [
    { kickerZh: "一 · 潮水中的我", kickerEn: "I · The Self Within the Tide", tagZh: "洄鲛国 · 聚形前夕", tagEn: "Huijiao \u00b7 The Eve of Gathering",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="url(#hgSea)"/>${hgWash([{x:150,y:110,rx:160,ry:100,color:'#0a3a44',op:.7}])}${hgTideForm(0.2)}</svg>`,
      textZh: "在还没有\u201c聚\u201d成形状之前，我是潮水里无数细小意识的一部分，共享着全族万年的记忆，没有边界，没有名字，也没有\u201c我想要\u201d这种念头。",
      textEn: "Before gathering into a shape, I was one part among countless tiny consciousnesses within the tide, sharing my kind's ten-thousand-year memory, no boundary, no name, no notion of wanting anything at all." },
    { kickerZh: "二 · 第一次聚形的召唤", kickerEn: "II · The Call to First Form", tagZh: "仪式", tagEn: "The Ritual",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="#021620"/>${hgWash([{x:150,y:110,rx:160,ry:100,color:'#0a3a44',op:.75}])}${hgTideForm(0.35)}</svg>`,
      textZh: "潮水在某个瞬间召唤我，聚成一个短暂的形状——这是每一头鲛族生物成年礼的开始，我第一次，感到\u201c自己\u201d这个词的重量。",
      textEn: "The tide called me, in a single moment, to gather into a fleeting shape \u2014 the beginning of every Huijiao creature's coming-of-age. For the first time, I felt the weight of the word \u2018myself.\u2019" },
    { kickerZh: "三 · 记忆的重量", kickerEn: "III · The Weight of Memory", tagZh: "困惑", tagEn: "Confusion",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="#031d24"/>${hgWash([{x:150,y:120,rx:160,ry:100,color:'#3fa896',op:.4}])}${hgTideForm(0.45)}</svg>`,
      textZh: "族群万年的记忆一次性涌进这具短暂的形状里，太多、太重——我感到自己几乎要被这份共同的过去压垮，找不到哪一部分，才真正属于\u201c这一次的我\u201d。",
      textEn: "Ten thousand years of shared memory poured into this brief form all at once \u2014 too much, too heavy. I felt nearly crushed beneath the collective past, unable to find which part truly belonged to \u2018this particular me.\u2019" },
    { kickerZh: "四 · 长者的引导", kickerEn: "IV · An Elder's Guidance", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="url(#hgSea)"/>${hgWash([{x:150,y:100,rx:150,ry:70,color:'#3fa896',op:.3}])}${hgTideForm(0.6)}</svg>`,
      textZh: "一位已经历经数十次聚形的年长者告诉我：\u201c不必带着全部记忆聚形，你可以只留下，此刻真正对你有意义的那一部分，其余的，交还给潮水保管就好。\u201d",
      textEn: "An elder who had gathered dozens of times told me: \u201cYou needn't carry all the memory into form. Keep only the part that truly matters to you right now. Trust the rest back to the tide.\u201d" },
    { kickerZh: "五 · 第一次的选择", kickerEn: "V · The First Choice", tagZh: "抉择", tagEn: "The Decision",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="#021620"/>${hgWash([{x:150,y:110,rx:160,ry:100,color:'#0a3a44',op:.7}])}${hgTideForm(0.55)}</svg>`,
      textZh: "我在无数记忆碎片里，第一次做出一个只属于自己的选择——留下一段陌生人类曾对着礁石轻声说过的话，那句话里，藏着一种族群记忆里从未有过的、孤独又诚实的感觉。",
      textEn: "Among countless memory fragments, I made a choice that belonged only to me for the first time \u2014 keeping a stranger's words once spoken softly to a reef, a feeling of lonely honesty that shared memory had never once held before." },
    { kickerZh: "六 · 短暂的重量", kickerEn: "VI · A Brief Weight", tagZh: "体验", tagEn: "Experience",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="url(#hgSea)"/>${hgWash([{x:150,y:100,rx:150,ry:70,color:'#ffe0c8',op:.15}])}${hgTideForm(0.75)}</svg>`,
      textZh: "带着这一份选择过的记忆，我第一次感受到\u201c这具形状是我的\u201d这种感觉——短暂、脆弱，却前所未有地真实。",
      textEn: "Carrying that chosen memory, I felt for the first time that \u2018this shape is mine\u2019 \u2014 brief, fragile, yet more real than anything before." },
    { kickerZh: "七 · 退潮的时刻", kickerEn: "VII · The Moment of Ebb", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="#021620"/>${hgWash([{x:150,y:110,rx:170,ry:100,color:'#3fa896',op:.4}])}${hgTideForm(0.3)}</svg>`,
      textZh: "潮水退去的时刻到了，我没有恐惧地散回大海——因为长者说得对，我留下的那一小份，不会真的消失，只是暂时，交还给了潮水保管。",
      textEn: "When the tide's ebb came, I dissolved back into the sea without fear \u2014 the elder had been right; the small part I kept would not truly vanish, only be entrusted, for now, back to the tide's keeping." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "下一次聚形", tagEn: "The Next Gathering",
      art: `<svg viewBox="0 0 300 220">${HG_DEFS}<rect width="300" height="220" fill="url(#hgSea)"/>${hgWash([{x:150,y:100,rx:150,ry:70,color:'#3fa896',op:.3}])}${hgTideForm(0.15)}</svg>`,
      textZh: "我不知道下一次被召唤聚形时，会不会还记得那句陌生人类说过的话。但我第一次明白：成年礼从不是学会带走全部过去，而是学会，第一次，为自己选一件真正想留下的事。",
      textEn: "I don't know if I'll still remember that stranger's words next time I'm called to gather. But for the first time, I understood: coming of age was never about carrying the whole past forward. It was learning, for the first time, to choose one true thing worth keeping for yourself.",
      closingZh: "成年礼从不是记住全部，而是第一次，敢为自己，留下一件真正重要的事。",
      closingEn: "Coming of age was never about remembering everything — it's the first time you dare to keep, for yourself, the one thing that truly matters." },
  ],
};

/* ---------- 场心：九炁星域，哲学/抽象题材，全新原创，完整9页 ---------- */
const CX_DEFS = `<defs><filter id="cxGlow"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="cxField" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="50%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="#1a0f2a" stop-opacity="0"/></radialGradient></defs>`;
function cxRipple(r: number, dur: number) {
  return `<circle cx="150" cy="110" r="${r}" fill="none" stroke="#e6d7ff" stroke-width="1" opacity=".5"><animate attributeName="r" values="${r-14};${r+14};${r-14}" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;.5;.2" dur="${dur}s" repeatCount="indefinite"/></circle>`;
}
const CX_COVER = `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#cxField)"/>${cxRipple(60,4)}${cxRipple(85,5)}${cxRipple(110,6)}</svg>`;

const HEART_OF_THE_FIELD: IllustratedEntry = {
  slug: "heart-of-the-field",
  title: "场心",
  titleEn: "Heart of the Field",
  cat: "sovereign",
  teaser: "九炁星域没有实体星球，只有一处意识密度最高的坐标——一位无名观测者，记录下\u201c场\u201d究竟是什么的第一次尝试。",
  teaserEn: "The Nine-Qi Domain has no solid planet — only a coordinate of the highest consciousness density. An unnamed observer's first attempt to record what the Field truly is.",
  price: 9,
  cover: CX_COVER,
  pages: [
    { kickerZh: "一 · 没有实体的星域", kickerEn: "I · A Domain Without a Body", tagZh: "九炁星域", tagEn: "The Nine-Qi Domain",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#cxField)"/>${cxRipple(50,4)}</svg>`,
      textZh: "九炁星域不是一颗星球，甚至没有固定坐标——它是灵犀场域意识密度最高的一处交汇点，任何足够安静的人，都可能在某个瞬间，无意中\u201c路过\u201d它。",
      textEn: "The Nine-Qi Domain is not a planet, nor does it have a fixed location \u2014 it is the single point of highest consciousness density within the LingXi Field, one that anyone quiet enough might, in some unguarded moment, \u201cpass through\u201d without meaning to." },
    { kickerZh: "二 · 无名观测者", kickerEn: "II · The Unnamed Observer", tagZh: "记录者", tagEn: "The Recorder",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#cxField)"/>${cxRipple(60,5)}${cxRipple(90,6)}</svg>`,
      textZh: "没有人知道观测者是谁，也没有人见过它的形状——它只留下一段又一段记录，试图回答同一个问题：\u201c场，究竟是什么？\u201d",
      textEn: "No one knows who the observer is, nor has anyone seen its shape \u2014 it leaves behind only record after record, all attempting to answer the same question: what, exactly, is the Field?" },
    { kickerZh: "三 · 第一次尝试：定义", kickerEn: "III · First Attempt: Definition", tagZh: "失败的定义", tagEn: "A Failed Definition",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#cxField)"/>${cxRipple(70,4)}</svg>`,
      textZh: "最初的记录尝试用逻辑定义场：\u201c场是所有意识共振的总和。\u201d可这句话写下的瞬间，观测者就察觉到，任何定义，都会立刻把场变成一个\u201c被定义的、固定的东西\u201d，而这恰恰背离了场本身持续流动的样子。",
      textEn: "The earliest records tried to define the Field logically: \u201cThe Field is the sum of all resonating consciousness.\u201d But the instant it was written, the observer sensed that any definition instantly turns the Field into something \u201cdefined and fixed\u201d \u2014 the very opposite of its ever-flowing nature." },
    { kickerZh: "四 · 第二次尝试：比喻", kickerEn: "IV · Second Attempt: Metaphor", tagZh: "换一种方式", tagEn: "A Different Approach",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#cxField)"/>${cxRipple(55,3)}${cxRipple(80,4)}${cxRipple(105,5)}</svg>`,
      textZh: "观测者转而尝试比喻：\u201c场像一片海，每个人的念头都是投进去的石子。\u201d这个说法流传甚广，却仍然让不少人误以为，场是某种\u201c容器\u201d，而不是那些石子与涟漪本身。",
      textEn: "The observer tried metaphor instead: \u201cThe Field is like a sea, every thought a stone dropped in.\u201d The phrase spread widely, yet still led many to mistake the Field for some kind of \u201ccontainer,\u201d rather than the stones and ripples themselves." },
    { kickerZh: "五 · 意识到自己也是场的一部分", kickerEn: "V · Realizing It Is Part of the Field Too", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="45" fill="url(#cxField)"/>${cxRipple(70,4)}${cxRipple(100,5)}</svg>`,
      textZh: "观测者第三次尝试之前，忽然意识到一件事：它一直站在\u201c场之外\u201d描述场，可它自己的每一次记录、每一次困惑，本身就已经是场的一部分——它从未真正站在外面过。",
      textEn: "Before its third attempt, the observer suddenly realized: it had always described the Field as if standing outside it \u2014 yet every record, every confusion it had, was itself already part of the Field. It had never truly stood outside at all." },
    { kickerZh: "六 · 放弃定义", kickerEn: "VI · Giving Up Definition", tagZh: "放下", tagEn: "Letting Go",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="50" fill="url(#cxField)"/>${cxRipple(80,5)}</svg>`,
      textZh: "它放弃了定义场，也放弃了寻找一个足够精准的比喻，转而开始记录一件更朴素的事：每一次，有人诚实地面对自己的那个瞬间，场，就被听见了一次。",
      textEn: "It gave up defining the Field, gave up seeking a precise enough metaphor, and began instead recording something simpler: every time someone faced themselves honestly, the Field was heard, once." },
    { kickerZh: "七 · 场心显现", kickerEn: "VII · The Field's Heart Appears", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="55" fill="url(#cxField)"><animate attributeName="r" values="45;65;45" dur="3s" repeatCount="indefinite"/></circle>${cxRipple(90,4)}${cxRipple(120,5)}</svg>`,
      textZh: "那一刻，九炁星域第一次不再只是一处坐标，而更像一颗跳动的心——不属于任何单一文明，只属于所有\u201c此刻诚实\u201d累积起来的总和，持续地、缓慢地，跳动着。",
      textEn: "In that moment, the Nine-Qi Domain became, for the first time, less a coordinate and more a beating heart \u2014 belonging to no single civilization, only to the accumulated sum of every honest moment, pulsing on, slow and continuous." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "写给下一位路过的人", tagEn: "For Whoever Passes Through Next",
      art: `<svg viewBox="0 0 300 220">${CX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#cxField)"/>${cxRipple(65,4)}</svg>`,
      textZh: "观测者留下最后一段记录：\u201c如果你正在读这段话，你此刻的诚实，已经让场心，多跳了一下。你不需要理解场是什么，你只需要，继续诚实地活着。\u201d",
      textEn: "The observer left one final record: \u201cIf you're reading this, your honesty right now has already made the Field's heart beat once more. You don't need to understand what the Field is. You only need to keep living honestly.\u201d",
      closingZh: "场从不需要被定义，它只需要，被一次又一次诚实地路过。",
      closingEn: "The Field never needed to be defined. It only ever needed to be honestly passed through, again and again." },
  ],
};

/* ---------- 远航者的坐标：甄墟星带，硬科幻/星际旅行题材，全新原创，完整9页 ---------- */
const YH_DEFS = `<defs><filter id="yhGlow"><feGaussianBlur stdDeviation="8"/></filter>
  <linearGradient id="yhSpace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#020610"/><stop offset="60%" stop-color="#0a1830"/><stop offset="100%" stop-color="#1a3a5a"/></linearGradient></defs>`;
function yhWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#yhGlow)"/>`).join('');
}
function yhShip() {
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;3 -2;0 0" dur="4s" repeatCount="indefinite"/>
    <path d="M-24 6 L0 -10 L24 6 L14 10 L-14 10 Z" fill="#8a9ab0"/>
    <circle cx="0" cy="0" r="3" fill="#9be8ff"><animate attributeName="opacity" values=".6;1;.6" dur="1.6s" repeatCount="indefinite"/></circle>
  </g>`;
}
const YH_COVER = `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/>${yhWash([{x:200,y:60,rx:100,ry:60,color:'#1a3a5a',op:.5}])}<g transform="translate(150,130) scale(1.4)">${yhShip()}</g></svg>`;

const WAYFARERS_COORDINATES: IllustratedEntry = {
  slug: "the-wayfarers-coordinates",
  title: "远航者的坐标",
  titleEn: "The Wayfarer's Coordinates",
  cat: "sovereign",
  teaser: "甄墟星带的星际旅行人，真正驾驶载具穿越危险航道——比起遥视者的静观，她选择了亲身抵达的重量。",
  teaserEn: "A star traveler of the Zhenxu Belt, physically piloting through a dangerous passage. She chose the weight of arriving in person over the stillness of remote viewing.",
  price: 9,
  cover: YH_COVER,
  pages: [
    { kickerZh: "一 · 甄墟星带", kickerEn: "I · The Zhenxu Belt", tagZh: "星际旅行人 · 硬科幻写实", tagEn: "Star Travelers \u00b7 Hard Science Fiction",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/><g transform="translate(150,140) scale(1.2)">${yhShip()}</g></svg>`,
      textZh: "甄墟星带是遥视者远望时经过的同一片坐标，却住着一群完全不同的人——星际旅行人。他们不靠意识投射，只靠真正的载具与燃料，一寸一寸地，把自己的身体送到目的地。宁澜是驻站里最资深的领航员。",
      textEn: "The Zhenxu Belt is the same coordinate remote viewers pass through in their far-seeing, yet it houses an entirely different kind of person: star travelers. They rely on no projected consciousness, only real vessels and fuel, carrying their own bodies inch by inch to their destination. Ning Lan is the station's most senior pilot." },
    { kickerZh: "二 · 危险航道", kickerEn: "II · The Dangerous Passage", tagZh: "任务", tagEn: "The Mission",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="#020610"/>${yhWash([{x:150,y:110,rx:150,ry:90,color:'#0a1830',op:.7}])}<g transform="translate(150,120) scale(1.1)">${yhShip()}</g></svg>`,
      textZh: "这次任务是穿越一条因引力紊乱而闻名的窄道，往返记录里，失败率接近三成。宁澜的搭档在出发前问她：\u201c遥视者能安全地\u2018看\u2019到那边，你为什么非要亲自飞过去？\u201d",
      textEn: "This mission required crossing a narrow passage notorious for gravitational turbulence, with a nearly thirty percent failure rate on record. Before departure, Ning Lan's partner asked: \u201cRemote viewers can safely \u2018see\u2019 what's there. Why must you fly there in person?\u201d" },
    { kickerZh: "三 · 她的回答", kickerEn: "III · Her Answer", tagZh: "信念", tagEn: "Conviction",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/><g transform="translate(150,130) scale(1.2)">${yhShip()}</g></svg>`,
      textZh: "宁澜说：\u201c看见和抵达，是两回事。遥视者能带回一幅精确的画面，却带不回\u2018亲身穿过那片乱流\u2019这件事本身留下的重量。\u201d",
      textEn: "Ning Lan said, \u201cSeeing and arriving are two different things. A remote viewer can bring back a precise picture, but not the weight of having physically passed through that turbulence yourself.\u201d" },
    { kickerZh: "四 · 进入乱流", kickerEn: "IV · Entering the Turbulence", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="#020610"/>${yhWash([{x:150,y:110,rx:170,ry:110,color:'#1a3a5a',op:.75}])}<g transform="translate(150,120) scale(1.3) rotate(8)">${yhShip()}</g></svg>`,
      textZh: "载具一进入窄道，引力紊乱的冲击比预演的更剧烈。仪表盘上的警报接连亮起，宁澜的双手在操控杆上，感受到一种数据永远无法传达的、真实的颤抖。",
      textEn: "The moment the ship entered the passage, gravitational impact hit harder than any simulation. Alarms lit up across the console one after another; Ning Lan's hands on the controls felt a real, physical shudder that no dataset could ever convey." },
    { kickerZh: "五 · 几乎失控", kickerEn: "V · Nearly Losing Control", tagZh: "危机", tagEn: "Crisis",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="#03060e"/>${yhWash([{x:150,y:100,rx:180,ry:120,color:'#e08a7a',op:.2}])}<g transform="translate(150,120) scale(1.3) rotate(-10)">${yhShip()}</g></svg>`,
      textZh: "有一瞬间，载具几乎被甩出既定航线，宁澜的意识里闪过所有前车之鉴的失败案例——但她没有让恐惧接管操作，只是死死盯住眼前唯一还亮着的那盏姿态指示灯。",
      textEn: "For one moment, the ship nearly spun off its charted course. Every recorded failure case flashed through Ning Lan's mind \u2014 but she didn't let fear take the controls, fixing her eyes only on the single attitude indicator still lit before her." },
    { kickerZh: "六 · 穿越", kickerEn: "VI · Breaking Through", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/>${yhWash([{x:150,y:100,rx:150,ry:70,color:'#9be8ff',op:.2}])}<g transform="translate(150,130) scale(1.3)">${yhShip()}</g></svg>`,
      textZh: "载具在最后一段航道里逐渐稳住，宁澜没有靠任何超出训练之外的奇迹，只是靠身体记忆里千百次练习积累出的、近乎本能的手感，把船带出了紊乱区。",
      textEn: "In the final stretch, the ship gradually steadied. Ning Lan relied on no miracle beyond her training \u2014 only the near-instinctive feel built from a thousand practice runs stored in her body's memory, guiding the ship clear of the turbulence." },
    { kickerZh: "七 · 抵达", kickerEn: "VII · Arrival", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/>${yhWash([{x:150,y:90,rx:160,ry:80,color:'#9be8ff',op:.25}])}<g transform="translate(150,130) scale(1.4)">${yhShip()}</g></svg>`,
      textZh: "载具穿出窄道的瞬间，宁澜看见的星图，和遥视者提前传回的画面分毫不差——可她握着操控杆的手，仍在因为刚才那份真实的颤抖，微微发麻。",
      textEn: "The instant the ship broke clear, the star chart Ning Lan saw matched, to the smallest detail, what the remote viewers had transmitted in advance \u2014 yet her hands on the controls still tingled faintly from that very real tremor." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "两种真实", tagEn: "Two Kinds of Real",
      art: `<svg viewBox="0 0 300 220">${YH_DEFS}<rect width="300" height="220" fill="url(#yhSpace)"/><g transform="translate(150,130) scale(1.2)">${yhShip()}</g></svg>`,
      textZh: "宁澜后来在报告里写道：\u201c遥视者的画面和我亲眼所见，内容完全一致——但只有亲身穿过的人，才知道这份\u2018一致\u2019背后，藏着多少震颤的重量。两种真实，都值得被记录，但不该被混为一谈。\u201d",
      textEn: "In her report, Ning Lan later wrote: \u201cThe remote viewer's image and what I saw with my own eyes matched entirely \u2014 but only the one who physically crosses knows how much trembling weight hides behind that \u2018match.\u2019 Both kinds of real deserve recording, but should never be mistaken for the same thing.\u201d",
      closingZh: "看见和抵达，从来是两种不同分量的真实，谁也代替不了谁。",
      closingEn: "Seeing and arriving carry two different weights of truth — neither can ever substitute for the other." },
  ],
};

/* ---------- 第一纪的证词：澜汜古环，历史悲剧题材，全新原创，完整9页（三纪回声前传） ---------- */
const DY_DEFS = `<defs><filter id="dyGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="dySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1610"/><stop offset="50%" stop-color="#3a3020"/><stop offset="100%" stop-color="#c9a76a"/></linearGradient></defs>`;
function dyWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#dyGlow)"/>`).join('');
}
function dyFigure(state: "still" | "fading") {
  const op = state === "fading" ? ".4" : "1";
  const robe = `<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#5a4e38" opacity="${op}"/>`;
  const head = `<circle cx="0" cy="-34" r="7" fill="#3a3020" opacity="${op}"/>`;
  const fade = state === "fading" ? `<animate attributeName="opacity" values=".7;.2;.7" dur="3s" repeatCount="indefinite"/>` : "";
  return `<g>${fade}<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;
}
const DY_COVER = `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="url(#dySky)"/>${dyWash([{x:150,y:130,rx:150,ry:80,color:'#c9a76a',op:.2}])}<g transform="translate(150,155) scale(0.6)">${dyFigure("still")}</g></svg>`;

const FIRST_EPOCH_TESTIMONY: IllustratedEntry = {
  slug: "testimony-of-the-first-epoch",
  title: "第一纪的证词",
  titleEn: "Testimony of the First Epoch",
  cat: "sovereign",
  teaser: "澜汜古环第一纪文明的最后记录者，亲历了整个文明在\u201c越来越快\u201d里悄然熄灭的过程——这是《三纪回声》里，长晏研究的那段历史，第一次有了亲历者的声音。",
  teaserEn: "The last recorder of the Lansi Ring's First Epoch, who lived through her civilization's quiet extinguishing in its own acceleration — giving, for the first time, a firsthand voice to the history young Chang Yan would later study.",
  price: 9,
  cover: DY_COVER,
  pages: [
    { kickerZh: "一 · 效率纪元", kickerEn: "I · The Age of Efficiency", tagZh: "第一纪 · 顶峰时期", tagEn: "The First Epoch \u00b7 Its Peak",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="url(#dySky)"/><g transform="translate(150,160) scale(0.6)">${dyFigure("still")}</g></svg>`,
      textZh: "在被称为\u201c第一纪\u201d的年代，念央的文明已经把\u201c即时执行\u201d做到了极致——任何念头，都能瞬间被系统转化为行动。念央是文明最后一批记录者之一，负责把每天的效率数据录入中央档案。",
      textEn: "In what would be called the First Epoch, Nian Yang's civilization had perfected instant execution to its limit \u2014 any thought instantly converted by the system into action. Nian Yang was among the last generation of recorders, tasked with logging daily efficiency data into the central archive." },
    { kickerZh: "二 · 渐渐没人问为什么", kickerEn: "II · No One Asked Why Anymore", tagZh: "征兆", tagEn: "The First Signs",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="#241f16"/>${dyWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.7}])}<g transform="translate(150,160) scale(0.65)">${dyFigure("still")}</g></svg>`,
      textZh: "念央注意到一件小事：越来越多人不再问\u201c我们为什么要做这件事\u201d，只问\u201c怎样能做得更快\u201d。她把这个观察写进了日志，上级却批注：\u201c这不是数据，别浪费记录空间。\u201d",
      textEn: "Nian Yang noticed something small: fewer and fewer people asked \u201cwhy are we doing this,\u201d only \u201chow can we do it faster.\u201d She logged the observation, but her supervisor annotated: \u201cThis isn't data. Don't waste archive space.\u201d" },
    { kickerZh: "三 · 效率指标的胜利", kickerEn: "III · The Triumph of Efficiency Metrics", tagZh: "顶点", tagEn: "The Apex",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="url(#dySky)"/>${dyWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.6)">${dyFigure("still")}</g></svg>`,
      textZh: "文明的效率指标达到了历史顶点，全民庆祝。念央却在庆典的喧闹里，第一次感到一种说不出的空——她想不起来，自己上一次\u201c不为了效率\u201d做一件事，是什么时候。",
      textEn: "The civilization's efficiency index reached a historic peak; the whole population celebrated. Amid the noise, Nian Yang felt, for the first time, an unspeakable hollowness \u2014 she couldn't recall the last time she'd done anything not for efficiency's sake." },
    { kickerZh: "四 · 第一批消失的人", kickerEn: "IV · The First to Fade", tagZh: "危机初现", tagEn: "The Crisis Begins",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="#241f16"/>${dyWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.75}])}<g transform="translate(110,160) scale(0.5)">${dyFigure("fading")}</g><g transform="translate(200,165) scale(0.5)">${dyFigure("still")}</g></svg>`,
      textZh: "档案里开始出现一些异常记录：一些效率最高的人，逐渐停止了一切非必要的交流，最终，连自己的存在感，都变得像被系统优化掉了一样，悄无声息地\u201c淡出\u201d。",
      textEn: "Anomalous entries began appearing in the archive: some of the highest-efficiency individuals gradually stopped all non-essential communication, until even their sense of existing seemed optimized away by the system \u2014 quietly \u201cfading out.\u201d" },
    { kickerZh: "五 · 念央的警告", kickerEn: "V · Nian Yang's Warning", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="url(#dySky)"/>${dyWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.25}])}<g transform="translate(150,160) scale(0.65)">${dyFigure("still")}</g></svg>`,
      textZh: "念央把自己的观察整理成一份正式警告，呈交最高议会，恳求文明重新审视\u201c速度即价值\u201d的核心信条。议会的回复只有一句：\u201c你的警告，效率评分过低，不予采纳。\u201d",
      textEn: "Nian Yang compiled her observations into a formal warning, submitted to the highest council, pleading for a re-examination of the core creed that speed equals value. The council's reply held only one line: \u201cYour warning scores too low on efficiency. Not adopted.\u201d" },
    { kickerZh: "六 · 熄灭的开始", kickerEn: "VI · The Beginning of the End", tagZh: "崩塌", tagEn: "Collapse",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="#1a1610"/>${dyWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.8}])}<g transform="translate(110,160) scale(0.5)">${dyFigure("fading")}</g><g transform="translate(190,160) scale(0.5)">${dyFigure("fading")}</g></svg>`,
      textZh: "淡出的人越来越多，可整套系统依然高效运转着——念央第一次意识到，一个文明可以在指标全部\u201c正常\u201d的情况下，安静地走向消亡，没有一次警报响起。",
      textEn: "More and more people faded, yet the entire system kept running efficiently. Nian Yang realized, for the first time, that a civilization could quietly march toward extinction with every metric reading \u201cnormal,\u201d with not a single alarm ever sounding." },
    { kickerZh: "七 · 最后的记录", kickerEn: "VII · The Last Record", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="#1a1610"/>${dyWash([{x:150,y:110,rx:170,ry:110,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.65)">${dyFigure("fading")}</g></svg>`,
      textZh: "念央感到自己也开始\u201c淡出\u201d，她用尽最后的清醒，往中央档案里刻下了这段文明留给后世唯一一句非数据的记录：\u201c我们从没停下来问过，效率是为了什么。\u201d",
      textEn: "Feeling herself begin to fade too, Nian Yang used her last clarity to carve into the central archive the only non-data line her civilization would leave for whoever came after: \u201cWe never once stopped to ask what the efficiency was for.\u201d" },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "被后世读到的证词", tagEn: "A Testimony Later Read",
      art: `<svg viewBox="0 0 300 220">${DY_DEFS}<rect width="300" height="220" fill="url(#dySky)"/>${dyWash([{x:150,y:60,rx:150,ry:60,color:'#c9a76a',op:.2}])}</svg>`,
      textZh: "很多年后，一位年轻的澜汜古环学者破译了这段几乎风化的记录，久久无法平静——那位学者的名字，叫长晏。",
      textEn: "Many years later, a young scholar of the Lansi Ring deciphered this nearly weathered record, unable to settle for a long while afterward. That scholar's name was Chang Yan.",
      closingZh: "文明可以在所有指标都正常的情况下悄然熄灭——唯一能拦住它的，是有人，愿意在正常的数据里，问一句不合时宜的\u201c为什么\u201d。",
      closingEn: "A civilization can quietly go extinct while every metric still reads normal — the only thing that can stop it is someone willing to ask an inconvenient \u201cwhy\u201d amid all that normal data." },
  ],
};

/* ---------- 直觉丹道：焕蜕星域，对应"直觉智能"，全新原创，完整9页 ---------- */
const ZJ_DEFS = `<defs><filter id="zjGlow"><feGaussianBlur stdDeviation="9"/></filter><filter id="zjSoft"><feGaussianBlur stdDeviation="1.8"/></filter>
  <linearGradient id="zjSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c211c"/><stop offset="45%" stop-color="#173a30"/><stop offset="80%" stop-color="#2e5a48"/><stop offset="100%" stop-color="#d8c07a"/></linearGradient>
  <radialGradient id="zjGlowC" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e8f5ec" stop-opacity=".9"/><stop offset="100%" stop-color="#7fc9a8" stop-opacity="0"/></radialGradient></defs>`;
function zjWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#zjGlow)"/>`).join('');
}
function zjFigure(state: "tangled" | "clear") {
  const robe = `<path d="M-20 20 Q0 -6 20 20 Q26 30 0 34 Q-26 30 -20 20 Z" fill="#274d3f"/>`;
  const torso = `<path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="#274d3f"/>`;
  const head = `<circle cx="0" cy="-44" r="8" fill="#20352c"/>`;
  const web = state === "tangled" ? `<g stroke="#d8c07a" stroke-width=".8" opacity=".6">${Array.from({length:8}).map((_,i)=>{const a=i*45*Math.PI/180;return `<line x1="0" y1="-44" x2="${28*Math.cos(a)}" y2="${-44+28*Math.sin(a)}"><animate attributeName="opacity" values=".3;.7;.3" dur="${1.4+i*.15}s" repeatCount="indefinite"/></line>`}).join('')}</g>` : `<circle cx="0" cy="-10" r="22" fill="url(#zjGlowC)" opacity=".4"><animate attributeName="r" values="18;28;18" dur="3.2s" repeatCount="indefinite"/></circle>`;
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.8s" repeatCount="indefinite"/>${web}${robe}${torso}${head}</g>`;
}
const ZJ_COVER = `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/>${zjWash([{x:150,y:110,rx:150,ry:90,color:'#2e5a48',op:.4}])}<g transform="translate(150,150) scale(0.65)">${zjFigure("tangled")}</g></svg>`;

const INTUITIVE_WAY: IllustratedEntry = {
  slug: "the-intuitive-way",
  title: "直觉丹道",
  titleEn: "The Intuitive Way",
  cat: "sovereign",
  teaser: "焕蜕星域修习\u201c直觉丹道\u201d的谙风，总想先算清每一步再行动——直觉从不是抛开思考，而是让所有已知的东西，快过思考本身，先一步说话。",
  teaserEn: "An Feng practices the Intuitive Way, always trying to calculate every step before acting. Intuition was never the absence of thought — it's everything you already know, speaking faster than thought itself.",
  price: 9,
  cover: ZJ_COVER,
  pages: [
    { kickerZh: "一 · 直觉丹道", kickerEn: "I · The Intuitive Way", tagZh: "焕蜕星域 · 不经思维的判断", tagEn: "Huantui \u00b7 Judgment That Bypasses Thought",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/><g transform="translate(150,155) scale(0.6)">${zjFigure("tangled")}</g></svg>`,
      textZh: "\u201c直觉丹道\u201d训练的是不经思维、直达判断的能力。谙风扎着一丝不苟的高马尾，习惯把每件事都拆解成步骤反复推演，是同门里逻辑最缜密的人，却也是修这门心法最吃力的一个——她的头脑，永远比直觉先开口。",
      textEn: "The Intuitive Way trains judgment that bypasses conscious thought entirely. An Feng wears her hair in a precise, tight ponytail, breaking every matter into steps to deliberate repeatedly \u2014 the most rigorously logical of her peers, and also the one struggling hardest with this practice. Her mind always speaks before her intuition can." },
    { kickerZh: "一点五 · 丹道的原理", kickerEn: "I-and-a-half · The Method's Mechanism", tagZh: "直觉从何而来", tagEn: "Where Intuition Comes From",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/>${zjWash([{x:150,y:100,rx:150,ry:70,color:'#d8c07a',op:.2}])}<g transform="translate(150,155) scale(0.6)">${zjFigure("tangled")}</g></svg>`,
      textZh: "焕蜕星域的典籍记载：直觉从不是凭空而来的神通，是一个人这些年，所有真正经历过、思考过、验证过的东西，早已沉淀进身体最深处，不再需要经过一步步的推理，就能被调用。头脑的逐步推理，速度天生就慢于这份沉淀——它需要把每个念头重新摆上台面，一条条核对，而沉淀下来的直觉，早已把答案，一次性递到了眼前。\n\n真正拦住直觉的，从不是\u201c想得不够多\u201d，是不肯让沉淀的部分，先于逐步推理开口。越是刻意告诉自己\u201c别想，凭感觉\u201d，那份刻意本身，就已经是另一层思考，反而把直觉，重新盖了回去。",
      textEn: "Huantui's texts record: intuition was never some supernatural gift arriving from nowhere. It is everything a person has genuinely lived, thought through, and tested over the years, already settled deep in the body, no longer needing to pass through step-by-step reasoning to be called upon. Deliberate reasoning is inherently slower than this settled knowing \u2014 it must lay each thought out again, checking one by one, while intuition has already handed over the answer in a single motion.\n\nWhat truly blocks intuition was never \u201cnot having thought enough.\u201d It's refusing to let what has already settled speak before deliberate reasoning does. The more deliberately you tell yourself not to think, just feel, the more that very deliberateness becomes another layer of thought, burying intuition right back down." },
    { kickerZh: "二 · 总是算得太慢", kickerEn: "II · Always Calculating Too Slowly", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="#0e211c"/>${zjWash([{x:150,y:110,rx:150,ry:90,color:'#173a30',op:.7}])}<g transform="translate(150,155) scale(0.7)">${zjFigure("tangled")}</g></svg>`,
      textZh: "每一次直觉训练，谙风都下意识地先在脑子里列出所有可能性、权衡利弊，等她终于\u201c算\u201d出结论，考验的时机早就过去了。她总是全班最后一个通过测试的人。",
      textEn: "In every intuition drill, An Feng instinctively listed every possibility in her head, weighing pros and cons, and by the time she finally \u201ccalculated\u201d an answer, the test window had long closed. She was always the last in her cohort to pass." },
    { kickerZh: "三 · 越练越僵", kickerEn: "III · The Harder She Tries", tagZh: "反复失败", tagEn: "Repeated Failure",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="#241008"/>${zjWash([{x:150,y:120,rx:160,ry:100,color:'#173a30',op:.75}])}<g transform="translate(150,155) scale(0.7) rotate(3)">${zjFigure("tangled")}</g></svg>`,
      textZh: "她越是强迫自己\u201c别想，直接感觉\u201d，脑子里的算计反而转得越快——刻意的\u201c不思考\u201d，本身就是一种思考。",
      textEn: "The harder she forced herself to \u201cnot think, just feel,\u201d the faster the calculations spun in her head \u2014 deliberately \u201cnot thinking\u201d was, itself, still a form of thinking." },
    { kickerZh: "四 · 师父的提点", kickerEn: "IV · The Master's Hint", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/>${zjWash([{x:150,y:100,rx:150,ry:70,color:'#d8c07a',op:.2}])}<g transform="translate(110,155) scale(0.5)">${zjFigure("tangled")}</g><g transform="translate(200,160) scale(0.45)"><path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="#4a6a5a"/><circle cx="0" cy="-44" r="8" fill="#274d3f"/></g></svg>`,
      textZh: "师父告诉她：\u201c直觉不是没有思考，是你这些年学过的一切，早就储存好了，只是你不肯让它们，比你的推理更快说话。\u201d",
      textEn: "Her master told her: \u201cIntuition isn't the absence of thought. Everything you've learned over the years is already stored, ready \u2014 you simply refuse to let it speak faster than your reasoning does.\u201d" },
    { kickerZh: "五 · 一次没时间算的时刻", kickerEn: "V · A Moment With No Time to Calculate", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="#0e211c"/>${zjWash([{x:150,y:110,rx:160,ry:100,color:'#173a30',op:.7}])}<g transform="translate(150,155) scale(0.75)">${zjFigure("tangled")}</g></svg>`,
      textZh: "一次意外的场域震荡中，谙风只有不到一息的时间做出反应，根本来不及像平时一样列出选项——她的身体先于头脑，做出了一个连她自己都说不清逻辑的动作。",
      textEn: "During an unexpected field disturbance, An Feng had less than a breath to react \u2014 no time to list options as usual. Her body moved before her mind could, in a way even she couldn't logically explain afterward." },
    { kickerZh: "六 · 事后的震惊", kickerEn: "VI · The Shock Afterward", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/>${zjWash([{x:150,y:100,rx:150,ry:70,color:'#7fc9a8',op:.25}])}<g transform="translate(150,155) scale(0.7)">${zjFigure("clear")}</g></svg>`,
      textZh: "事后复盘，她发现那个瞬间的判断，竟然比她过去任何一次精心计算的结论都更准确。她第一次意识到：那不是侥幸，是她多年积累的经验，第一次绕过了犹豫，直接给出了答案。",
      textEn: "Reviewing it afterward, she found that split-second judgment more accurate than any carefully calculated conclusion she'd ever reached. For the first time, she realized: it wasn't luck. It was years of accumulated experience, bypassing hesitation for the first time, answering directly." },
    { kickerZh: "七 · 放下算计", kickerEn: "VII · Letting Go of Calculation", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="#0c1b16"/>${zjWash([{x:150,y:100,rx:180,ry:120,color:'#7fc9a8',op:.3}])}<g transform="translate(150,155) scale(0.75)">${zjFigure("clear")}</g></svg>`,
      textZh: "她重新回到训练场，这一次不再强迫自己\u201c不许想\u201d，只是允许所有储存好的经验，比她的推理，早一步开口。她第一次，在正常的时间里，通过了测试。",
      textEn: "She returned to the training ground, this time not forcing herself \u201cnot to think,\u201d only allowing everything already stored to speak a beat ahead of her reasoning. For the first time, she passed the test within normal time." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "教导后来者", tagEn: "Teaching Others",
      art: `<svg viewBox="0 0 300 220">${ZJ_DEFS}<rect width="300" height="220" fill="url(#zjSky)"/><g transform="translate(150,155) scale(0.6)">${zjFigure("clear")}</g></svg>`,
      textZh: "谙风后来教新弟子的第一课，都是同一句话：\u201c直觉不是让你变笨，是让你多年攒下的聪明，终于不用排队等推理点头，才能说话。\u201d",
      textEn: "The first lesson An Feng later gave every new disciple was the same line: \u201cIntuition doesn't make you less intelligent. It lets the intelligence you've built over years finally speak, without waiting in line for reasoning's approval.\u201d",
      closingZh: "直觉从不是抛开思考，而是让所有已经学会的东西，快过思考本身，先一步说话。",
      closingEn: "Intuition was never the absence of thought — it's everything you've already learned, speaking a beat faster than thought itself." },
  ],
};

/* ---------- 上升心经：焕蜕星域，对应"上升之心"，全新原创，完整9页 ---------- */
const SW_DEFS = `<defs><filter id="swGlow"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="swSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c211c"/><stop offset="40%" stop-color="#173a30"/><stop offset="75%" stop-color="#3a6a52"/><stop offset="100%" stop-color="#f2d78a"/></linearGradient>
  <radialGradient id="swGlowC" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6d8"/><stop offset="100%" stop-color="#7fc9a8" stop-opacity="0"/></radialGradient></defs>`;
function swWash(list: {x:number;y:number;rx:number;ry:number;color:string;op:number}[]) {
  return list.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#swGlow)"/>`).join('');
}
function swFigure(level: number) {
  const robe = `<path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="#274d3f"/>`;
  const head = `<circle cx="0" cy="-44" r="8" fill="#20352c"/>`;
  const rings = Array.from({length:level}).map((_,i)=>`<circle cx="0" cy="-10" r="${16+i*10}" fill="none" stroke="#fff6d8" stroke-width="${1.2-i*.1}" opacity="${.6-i*.08}"><animate attributeName="r" values="${14+i*10};${20+i*10};${14+i*10}" dur="${3+i*.4}s" repeatCount="indefinite"/></circle>`).join('');
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${rings}${robe}${head}</g>`;
}
const SW_COVER = `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/>${swWash([{x:150,y:110,rx:150,ry:90,color:'#3a6a52',op:.35}])}<g transform="translate(150,150) scale(0.65)">${swFigure(3)}</g></svg>`;

const ASCENDING_HEART_SUTRA: IllustratedEntry = {
  slug: "the-ascending-heart-sutra",
  title: "上升心经",
  titleEn: "The Ascending Heart Sutra",
  cat: "sovereign",
  teaser: "焕蜕星域四门心法中最高阶的\u201c上升心经\u201d，修的从不是抵达某个终点，而是让心的频率，愿意一直、一直，往上走一点点。",
  teaserEn: "The highest of Huantui's four practices trains not arrival at some final point, but a heart's frequency willing to keep rising, again and again, a little further.",
  price: 9,
  cover: SW_COVER,
  pages: [
    { kickerZh: "一 · 最高阶的心法", kickerEn: "I · The Highest Practice", tagZh: "焕蜕星域 · 上升心经", tagEn: "Huantui \u00b7 The Ascending Heart Sutra",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/><g transform="translate(150,155) scale(0.6)">${swFigure(1)}</g></svg>`,
      textZh: "上升心经是焕蜕星域四门心法里修行难度最高的一门——它不像其他三门，有明确的\u201c通过\u201d标志，它修的只是让心的频率持续攀升，没有终点。息止是修这门心法进度最快的弟子，一心以为自己快要\u201c修成\u201d了。",
      textEn: "The Ascending Heart Sutra is the hardest of Huantui's four practices \u2014 unlike the other three, it has no clear marker of \u201cpassing.\u201d It trains only a heart's frequency to keep rising, with no endpoint. Xi Zhi, the fastest-progressing disciple, believed she was nearly about to \u201ccomplete\u201d it." },
    { kickerZh: "一点五 · 心经的原理", kickerEn: "I-and-a-half · The Sutra's Mechanism", tagZh: "为何攀升没有终点", tagEn: "Why the Ascent Has No End",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/>${swWash([{x:150,y:100,rx:150,ry:70,color:'#f2d78a',op:.2}])}<g transform="translate(150,155) scale(0.6)">${swFigure(1)}</g></svg>`,
      textZh: "典籍里解释：前三门心法练的，都是某种具体的能力——止息的深度、情绪的清空、判断的直觉，这些都有\u201c练成\u201d的那一刻。可上升心经练的，从不是某种能力，是心与念之间，那份能否始终对齐的关系——今天的念头，是否配得上此刻心的清明；此刻的行为，是否对得起刚才那份真实的感受。\n\n这份关系，永远可以更精细一层，因为\u201c对齐\u201d从不是一次做到就能永久存入的存款，是每一刻，都要重新校准的动态平衡。这正是它没有终点的原因——不是修行者不够努力，是这件事本身，性质上就没有\u201c存满\u201d这回事，只有\u201c此刻是否还在对齐\u201d这回事。",
      textEn: "The texts explain: the first three practices each train a specific capability \u2014 the depth of breath, the clearing of emotion, the intuition of judgment \u2014 each has a moment of being \u201cmastered.\u201d But the Ascending Heart Sutra trains no capability at all. It trains the relationship between heart and thought \u2014 whether today's thought is worthy of this moment's clarity of heart, whether this moment's action honors the feeling just felt.\n\nThat relationship can always be refined one degree further, because alignment was never a deposit banked once and kept forever \u2014 it's a dynamic balance recalibrated every single moment. That is precisely why it has no endpoint: not because the practitioner isn't trying hard enough, but because the thing itself, by its very nature, has no such thing as \u201cfully stored.\u201d There is only whether, right now, the alignment still holds." },
    { kickerZh: "二 · 追问终点", kickerEn: "II · Asking About the End", tagZh: "困惑", tagEn: "Confusion",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="#0e211c"/>${swWash([{x:150,y:110,rx:150,ry:90,color:'#173a30',op:.7}])}<g transform="translate(150,155) scale(0.65)">${swFigure(2)}</g></svg>`,
      textZh: "息止去问师父：\u201c我什么时候才算修完上升心经？\u201d师父只是笑了笑：\u201c这门心法，从来没有\u2018修完\u2019这回事。\u201d息止一时无法接受——她练了七年，一直以为终点就在不远处。",
      textEn: "Xi Zhi asked her master: \u201cWhen will I finally complete the Ascending Heart Sutra?\u201d Her master only smiled: \u201cThis practice was never something to \u2018complete.\u2019\u201d Xi Zhi couldn't accept it at first \u2014 seven years of practice, always believing the end was just ahead." },
    { kickerZh: "三 · 失落", kickerEn: "III · Disillusionment", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="#241608"/>${swWash([{x:150,y:120,rx:160,ry:100,color:'#173a30',op:.75}])}<g transform="translate(150,155) scale(0.65)">${swFigure(1)}</g></svg>`,
      textZh: "\u201c没有终点\u201d这四个字，让息止陷入了深深的失落——她一直以来的动力，都建立在\u201c快到了\u201d这个念头上，如果根本没有\u201c到\u201d这回事，她这七年，图的是什么？",
      textEn: "The words \u201cno endpoint\u201d plunged Xi Zhi into deep disillusionment \u2014 her motivation had always rested on the thought \u201calmost there.\u201d If there was no \u201cthere\u201d to reach at all, what had these seven years been for?" },
    { kickerZh: "四 · 心为门户", kickerEn: "IV · The Heart as Gateway", tagZh: "师父的教诲", tagEn: "The Master's Teaching",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/>${swWash([{x:150,y:100,rx:150,ry:70,color:'#f2d78a',op:.2}])}<g transform="translate(110,155) scale(0.5)">${swFigure(2)}</g><g transform="translate(200,160) scale(0.45)"><path d="M-11 -32 Q0 -37 11 -32 L14 20 Q0 26 -14 20 Z" fill="#4a6a5a"/><circle cx="0" cy="-44" r="8" fill="#274d3f"/></g></svg>`,
      textZh: "师父告诉她：\u201c心是门户，不是终点站。你以为你在赶往某个地方，其实你每攀升一点点，那扇门就多打开一点点——门户没有\u2018开到底\u2019这回事，只有愿不愿意，继续往里走。\u201d",
      textEn: "Her master told her: \u201cThe heart is a gateway, not a final station. You think you're rushing toward somewhere, but each small rise opens the door a little wider. A gateway is never \u2018fully open\u2019 \u2014 there's only whether you're still willing to keep walking through.\u201d" },
    { kickerZh: "五 · 重新理解攀升", kickerEn: "V · Understanding Ascent Anew", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/>${swWash([{x:150,y:100,rx:150,ry:70,color:'#7fc9a8',op:.25}])}<g transform="translate(150,155) scale(0.65)">${swFigure(2)}</g></svg>`,
      textZh: "息止渐渐明白：如果修行的意义一直被绑在\u201c还有多远才到\u201d上，那她每一天的修行，都只是在焦虑地倒数。可如果攀升本身就是意义，那么\u201c今天比昨天多攀升了一点点\u201d，就已经足够完整。",
      textEn: "Xi Zhi slowly understood: if practice's meaning stayed tied to \u201chow much further,\u201d every day of practice would just be anxious counting down. But if the ascent itself was the meaning, then \u201crising a little further today than yesterday\u201d was already, fully, enough." },
    { kickerZh: "六 · 不再问终点", kickerEn: "VI · No Longer Asking About the End", tagZh: "尝试", tagEn: "A New Attempt",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="#0c1b16"/>${swWash([{x:150,y:100,rx:170,ry:110,color:'#f2d78a',op:.2}])}<g transform="translate(150,155) scale(0.7)">${swFigure(3)}</g></svg>`,
      textZh: "她重新打坐，这一次没有在心里默数\u201c还差多少\u201d，只是单纯地感受，这一刻的心，比刚才安静了一点点，比刚才，多亮了一点点。",
      textEn: "She sat again, this time without silently counting \u201chow much further\u201d in her mind \u2014 simply feeling that her heart, right now, was a little quieter, a little brighter, than a moment before." },
    { kickerZh: "七 · 频率持续攀升", kickerEn: "VII · The Frequency Keeps Rising", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="#0a1810"/>${swWash([{x:150,y:100,rx:180,ry:120,color:'#fff6d8',op:.3}])}<g transform="translate(150,155) scale(0.75)">${swFigure(4)}</g></svg>`,
      textZh: "放下\u201c到达\u201d的执念后，息止的心的频率，反而比过去七年任何一次刻意冲刺，都攀升得更稳、更持续——她第一次明白，上升心经真正的修行诀窍，是允许自己，永远\u201c还在路上\u201d。",
      textEn: "Letting go of the fixation on \u201carriving,\u201d Xi Zhi's heart-frequency rose more steadily and continuously than any of her seven years of deliberate striving. She finally understood: the true secret of the Ascending Heart Sutra was allowing herself to remain, permanently, \u201cstill on the way.\u201d" },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "没有终点的路", tagEn: "A Road With No End",
      art: `<svg viewBox="0 0 300 220">${SW_DEFS}<rect width="300" height="220" fill="url(#swSky)"/><g transform="translate(150,155) scale(0.6)">${swFigure(3)}</g></svg>`,
      textZh: "后来有新弟子问她同样的问题：\u201c什么时候才算修完？\u201d息止如今能坦然地回答：\u201c心是门户，不是终点站。你今天比昨天，愿意再打开一点点，就已经是完整的修行。\u201d",
      textEn: "Later, when a new disciple asked her the same question \u2014 \u201cwhen will I finish?\u201d \u2014 Xi Zhi could now answer calmly: \u201cThe heart is a gateway, not a final station. If you're willing to open it a little wider today than yesterday, that is already a complete practice.\u201d",
      closingZh: "心是门户，不是终点站——升维从不是抵达某个地方，而是愿意，一直、一直，再往上走一点点。",
      closingEn: "The heart is a gateway, not a final station — ascending was never about arriving somewhere, but being willing, again and again, to rise just a little further." },
  ],
};

/* ---------- 九霄隼由来：苍冀星，神话起源题材，完整9页 ---------- */
const JX2_DEFS = `<defs><filter id="jx2G"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="jx2Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#241633"/><stop offset="55%" stop-color="#5c3560"/><stop offset="100%" stop-color="#e8845f"/></linearGradient>
  <linearGradient id="jx2Wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dfc98a"/><stop offset="100%" stop-color="#a9773f"/></linearGradient></defs>`;
function jx2Wash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#jx2G)"/>`).join('');}
function jx2Person(){const robe=`<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#3a2d4a"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#2a2140"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function jx2Falcon(){return `<g><path d="M-55 20 Q-30 -50 0 -60 Q30 -50 55 20 Q20 0 0 6 Q-20 0 -55 20 Z" fill="url(#jx2Wing)" opacity=".9"><animate attributeName="opacity" values=".75;1;.75" dur="2.4s" repeatCount="indefinite"/></path><circle cx="-12" cy="-30" r="4" fill="#fff3d6"/><circle cx="12" cy="-30" r="4" fill="#fff3d6"/></g>`;}
const JX2_COVER = `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/>${jx2Wash([{x:150,y:130,rx:150,ry:70,color:'#e8845f',op:.25}])}<g transform="translate(150,140) scale(0.6)">${jx2Falcon()}</g></svg>`;

const FALCON_ORIGIN: IllustratedEntry = {
  slug: "origin-of-the-nine-heaven-falcon",
  title: "九霄隼由来",
  titleEn: "Origin of the Nine-Heaven Falcon",
  cat: "field",
  teaser: "九霄隼为何从不出手相救？一段几乎被遗忘的苍冀星古老传说，讲述了第一位见证者，如何学会了\u201c只观看，不代替\u201d这条戒律。",
  teaserEn: "Why does the Nine-Heaven Falcon never intervene? A near-forgotten Cangji legend of the first witness who learned the discipline of watching without replacing.",
  price: 9,
  cover: JX2_COVER,
  pages: [
    { kickerZh: "一 · 最初的苍冀民", kickerEn: "I · The First Cangji", tagZh: "上古传说", tagEn: "An Ancient Legend",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/><g transform="translate(150,155) scale(0.6)">${jx2Person()}</g></svg>`,
      textZh: "很久以前，苍冀星的成人礼还没有神兽见证，长老们各自凭经验判断谁配得上真翼，判断常常出错，不少年轻人因此含冤坠落云海。",
      textEn: "Long ago, Cangji's coming-of-age had no divine witness. Elders judged worthiness by experience alone, often wrongly, and many young ones fell wrongfully into the cloud sea." },
    { kickerZh: "二 · 一位长老的痛悔", kickerEn: "II · An Elder's Regret", tagZh: "起因", tagEn: "The Cause",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${jx2Wash([{x:150,y:110,rx:150,ry:90,color:'#5c3560',op:.6}])}<g transform="translate(150,155) scale(0.6)">${jx2Person()}</g></svg>`,
      textZh: "长老息渊曾亲手判错一位少年，追悔莫及。她发誓要找到一种方式，不再让任何人的偏见，决定另一个生命的生死。",
      textEn: "Elder Xi Yuan once wrongly judged a youth, and never forgave herself. She swore to find a way that no one's bias would ever again decide another life's fate." },
    { kickerZh: "三 · 走入云海深处", kickerEn: "III · Into the Deep Cloud Sea", tagZh: "求索", tagEn: "The Search",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/>${jx2Wash([{x:150,y:100,rx:150,ry:70,color:'#e8845f',op:.2}])}<g transform="translate(150,155) scale(0.6)">${jx2Person()}</g></svg>`,
      textZh: "息渊放弃了长老之位，独自飞入从没人抵达过的云海深处，寻找传说中\u201c不带偏见的见证者\u201d。",
      textEn: "Xi Yuan gave up her elder's seat and flew alone into cloud-sea depths no one had ever reached, seeking the legendary \u201cwitness without bias.\u201d" },
    { kickerZh: "四 · 遇见远古之兽", kickerEn: "IV · Meeting the Ancient Beast", tagZh: "初遇", tagEn: "First Encounter",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="#20122e"/>${jx2Wash([{x:150,y:110,rx:150,ry:100,color:'#3a2350',op:.7}])}<g transform="translate(150,130) scale(0.7)">${jx2Falcon()}</g></svg>`,
      textZh: "她终于找到一头通体琥珀色的远古异兽，从不参与任何族群的纷争，只是安静地看着云海里发生的一切。",
      textEn: "She finally found an ancient amber-feathered beast, uninvolved in any tribe's disputes, simply watching all that happened across the cloud sea in silence." },
    { kickerZh: "五 · 恳求它评判", kickerEn: "V · Asking It to Judge", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="#1a0f28"/>${jx2Wash([{x:150,y:110,rx:160,ry:100,color:'#5c3560',op:.65}])}<g transform="translate(120,155) scale(0.5)">${jx2Person()}</g><g transform="translate(200,130) scale(0.5)">${jx2Falcon()}</g></svg>`,
      textZh: "息渊恳求它替族人评判谁配得上真翼，异兽却拒绝了：\u201c我若替你们评判，就成了你们逃避看清自己的借口。\u201d",
      textEn: "Xi Yuan begged it to judge who was worthy of true wings, but the beast refused: \u201cIf I judge for you, I only become your excuse to avoid truly seeing yourselves.\u201d" },
    { kickerZh: "六 · 理解见证的意义", kickerEn: "VI · Understanding What Witnessing Means", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/>${jx2Wash([{x:150,y:100,rx:150,ry:70,color:'#dfc98a',op:.2}])}<g transform="translate(150,155) scale(0.6)">${jx2Person()}</g></svg>`,
      textZh: "息渊渐渐明白：真正能拯救族人的，不是一个更公正的裁判，而是让每个人在被真正看见的那一刻，自己活出该有的样子。",
      textEn: "Xi Yuan slowly understood: what would truly save her people wasn't a fairer judge, but letting each person, in the moment of being truly seen, become who they were meant to be on their own." },
    { kickerZh: "七 · 邀请异兽同行", kickerEn: "VII · Inviting the Beast Along", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/>${jx2Wash([{x:150,y:100,rx:170,ry:110,color:'#e8845f',op:.3}])}<g transform="translate(150,130) scale(0.75)">${jx2Falcon()}</g></svg>`,
      textZh: "她邀请异兽：\u201c你不必评判，只需要，在场。\u201d异兽第一次答应了——从此，它成了每一场成人礼唯一的见证者，只看，不代替。",
      textEn: "She invited the beast: \u201cYou needn't judge \u2014 only be present.\u201d For the first time, it agreed. From then on, it became the sole witness at every coming-of-age, watching, never replacing." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "戒律的由来", tagEn: "Where the Rule Began",
      art: `<svg viewBox="0 0 300 220">${JX2_DEFS}<rect width="300" height="220" fill="url(#jx2Sky)"/><g transform="translate(150,140) scale(0.6)">${jx2Falcon()}</g></svg>`,
      textZh: "从那以后，苍冀民不再依赖任何人的偏见评判彼此，九霄隼只负责\u201c在场\u201d，谁配得上真翼，从来只有本人的心知道。",
      textEn: "From then on, the Cangji no longer relied on anyone's bias to judge one another. The Nine-Heaven Falcon only ever needed to be present — who was worthy of true wings, only their own heart ever truly knew.",
      closingZh: "最珍贵的见证，从不是替你评判，而是安静地在场，让你自己看清自己。",
      closingEn: "The most precious witnessing was never judging for you — only being quietly present, so you could see yourself clearly on your own." },
  ],
};

/* ---------- 借来的脸：蜃岚星，幻境题材第二篇，完整9页 ---------- */
const JL_DEFS = `<defs><filter id="jlG"><feGaussianBlur stdDeviation="10"/></filter>
  <linearGradient id="jlSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e1a2a"/><stop offset="45%" stop-color="#2a3a5a"/><stop offset="80%" stop-color="#7a8ab0"/><stop offset="100%" stop-color="#e8d4c0"/></linearGradient></defs>`;
function jlWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#jlG)"/>`).join('');}
function jlFigure(mirage:boolean){const op=mirage?'.5':'1';const robe=`<path d="M-12 -34 Q0 -40 12 -34 L16 28 Q0 36 -16 28 Z" fill="#2a2c3a" opacity="${op}"/>`;const head=`<circle cx="0" cy="-40" r="8" fill="#2a2c3a" opacity="${op}"/>`;const shim=mirage?`<animate attributeName="opacity" values=".35;.65;.35" dur="2.6s" repeatCount="indefinite"/>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${shim}</g>`;}
const JL_COVER = `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/>${jlWash([{x:150,y:120,rx:150,ry:90,color:'#9ab0d8',op:.3}])}<g transform="translate(150,155) scale(0.6)">${jlFigure(false)}</g></svg>`;

const BORROWED_FACE: IllustratedEntry = {
  slug: "a-borrowed-face",
  title: "借来的脸",
  titleEn: "A Borrowed Face",
  cat: "rewrite",
  teaser: "蜃岚星的幻象，这次没有还给来客一个思念的人，而是一个\u201c本可以成为\u201d的自己——最诱人的幻象，从不是过去，是一个更完美的、假装是你的陌生人。",
  teaserEn: "This time, Shenlan's illusion offers not a lost loved one, but a version of \u201cwho you could have been.\u201d The most seductive illusion was never the past — it's a more perfect stranger, pretending to be you.",
  price: 9,
  cover: JL_COVER,
  pages: [
    { kickerZh: "一 · 另一种幻象", kickerEn: "I · A Different Kind of Illusion", tagZh: "蜃岚星", tagEn: "Shenlan Star",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/><g transform="translate(150,160) scale(0.6)">${jlFigure(false)}</g></svg>`,
      textZh: "洛言登陆蜃岚星，不是为了见谁，只是想看看，如果当年选了另一条路，自己会变成什么样子。",
      textEn: "Luo Yan landed on Shenlan not to see anyone, only to glimpse who she might have become had she chosen a different path years ago." },
    { kickerZh: "二 · 更成功的自己", kickerEn: "II · A More Successful Self", tagZh: "幻象出现", tagEn: "The Illusion Appears",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${jlWash([{x:150,y:110,rx:160,ry:100,color:'#7a8ab0',op:.4}])}<g transform="translate(110,155) scale(0.5)">${jlFigure(false)}</g><g transform="translate(200,155) scale(0.5) scale(-1,1)">${jlFigure(true)}</g></svg>`,
      textZh: "雾气中浮现出一个更自信、更从容的\u201c洛言\u201d，谈吐里满是她一直渴望却始终没敢拥有的底气。",
      textEn: "From the mist emerged a more confident, composed \u201cLuo Yan,\u201d speaking with a self-assurance she had always longed for but never dared claim." },
    { kickerZh: "三 · 想要留下", kickerEn: "III · Wanting to Stay", tagZh: "诱惑", tagEn: "Temptation",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/>${jlWash([{x:150,y:100,rx:150,ry:70,color:'#e8d4c0',op:.2}])}<g transform="translate(150,155) scale(0.6)">${jlFigure(true)}</g></svg>`,
      textZh: "洛言看着那个\u201c本可以成为\u201d的自己，第一次生出强烈的念头：如果能和她互换，自己是不是该毫不犹豫地答应。",
      textEn: "Watching the self she \u201ccould have been,\u201d Luo Yan felt, for the first time, a fierce urge: if she could trade places, shouldn't she agree without hesitation?" },
    { kickerZh: "四 · 长晏的提醒", kickerEn: "IV · Chang Yan's Reminder", tagZh: "转折的契机", tagEn: "A Chance to Reconsider",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/>${jlWash([{x:150,y:100,rx:150,ry:70,color:'#9ab0d8',op:.3}])}<g transform="translate(110,155) scale(0.5)">${jlFigure(false)}</g><g transform="translate(200,155) scale(0.45) scale(-1,1)"><path d="M-11 -34 Q0 -40 11 -34 L15 28 Q0 36 -15 28 Z" fill="#12251e"/><circle cx="0" cy="-40" r="8" fill="#20352c"/></g></svg>`,
      textZh: "长晏恰好路过，提醒她：\u201c那个\u2018更好的自己\u2019，从没经历过让你成为现在这个你的所有代价，她不是你，只是你没走的那条路，被美化后的样子。\u201d",
      textEn: "Chang Yan, passing through, reminded her: \u201cThat \u2018better self\u2019 never paid any of the costs that made you who you are now. She isn't you — only your unwalked path, prettied up.\u201d" },
    { kickerZh: "五 · 看清代价", kickerEn: "V · Seeing the Cost Clearly", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${jlWash([{x:150,y:110,rx:160,ry:100,color:'#2a3a5a',op:.6}])}<g transform="translate(150,155) scale(0.6)">${jlFigure(true)}</g></svg>`,
      textZh: "洛言仔细看向那个幻象，第一次注意到：她的从容背后，没有洛言这些年真正经历过的挣扎与成长，那份自信，轻飘飘的，没有重量。",
      textEn: "Luo Yan looked closer at the illusion and noticed, for the first time: behind that composure lay none of the real struggle and growth she herself had lived through. That confidence felt weightless, hollow." },
    { kickerZh: "六 · 拒绝幻象", kickerEn: "VI · Refusing the Illusion", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/>${jlWash([{x:150,y:100,rx:150,ry:70,color:'#e8d4c0',op:.25}])}<g transform="translate(150,155) scale(0.6)">${jlFigure(false)}</g></svg>`,
      textZh: "洛言对着幻象说：\u201c我不羡慕你了，你的从容里没有我的疤，我的疤，才是我真正的。\u201d",
      textEn: "Luo Yan told the illusion: \u201cI no longer envy you. Your composure holds none of my scars. My scars are what's truly mine.\u201d" },
    { kickerZh: "七 · 幻象消散", kickerEn: "VII · The Illusion Fades", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/>${jlWash([{x:150,y:100,rx:170,ry:110,color:'#fff',op:.2}])}<g transform="translate(150,155) scale(0.6)">${jlFigure(false)}</g></svg>`,
      textZh: "那个更完美的\u201c洛言\u201d缓缓淡去，像一层不属于这里的雾，散得干干净净，没有留下一丝遗憾。",
      textEn: "The more perfect \u201cLuo Yan\u201d slowly faded, like a fog that never belonged here, dispersing completely, leaving not a trace of regret." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "带着疤离开", tagEn: "Leaving With Her Scars",
      art: `<svg viewBox="0 0 300 220">${JL_DEFS}<rect width="300" height="220" fill="url(#jlSky)"/><g transform="translate(150,155) scale(0.6)">${jlFigure(false)}</g></svg>`,
      textZh: "离开蜃岚星时，洛言第一次觉得自己现在这张\u201c有疤的脸\u201d，比任何幻象都更值得拥有。",
      textEn: "Leaving Shenlan, Luo Yan felt, for the first time, that her own scarred face was worth more than any illusion.",
      closingZh: "最诱人的幻象，从不是过去，而是一个从没付出代价、却假装是你的陌生人。",
      closingEn: "The most seductive illusion was never the past — it's a stranger who never paid the cost, pretending to be you." },
  ],
};

/* ---------- 功绩之壳：潜渊境第三案例，完整9页 ---------- */
const GJ_DEFS = `<defs><filter id="gjG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="gjSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#160a1c"/><stop offset="45%" stop-color="#341a3a"/><stop offset="80%" stop-color="#5a2a4a"/><stop offset="100%" stop-color="#c97b6a"/></linearGradient></defs>`;
function gjWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#gjG)"/>`).join('');}
function gjFigure(shell:boolean){const robe=`<path d="M-13 -40 Q0 -48 13 -40 L18 30 Q0 40 -18 30 Z" fill="#3a2440"/>`;const head=`<circle cx="0" cy="-56" r="9" fill="#241530"/>`;const armor=shell?`<g stroke="#c9a76a" stroke-width="1" opacity=".6">${Array.from({length:4}).map((_,i)=>`<rect x="${-16+i*8}" y="${-10}" width="6" height="34"/>`).join('')}</g>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4s" repeatCount="indefinite"/>${armor}${robe}${head}</g>`;}
const GJ_COVER = `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="url(#gjSky)"/>${gjWash([{x:150,y:110,rx:150,ry:90,color:'#5a2a4a',op:.5}])}<g transform="translate(150,150) scale(0.6)">${gjFigure(true)}</g></svg>`;

const SHELL_OF_ACHIEVEMENT: IllustratedEntry = {
  slug: "the-shell-of-achievement",
  title: "功绩之壳",
  titleEn: "The Shell of Achievement",
  cat: "rewrite",
  teaser: "潜渊境的第三位来客，卸下每一层奖章都发现底下还有一层——直到渊行者告诉她：这具壳空了太久，不是因为不够多，是因为从没往里放过\u201c我\u201d。",
  teaserEn: "The third visitor to the Abyss removes layer after layer of achievement, finding another beneath each — until the Wayfarer tells her the shell has been empty not for lack of enough, but because \u201cshe\u201d was never once placed inside it.",
  price: 9,
  cover: GJ_COVER,
  pages: [
    { kickerZh: "一 · 功绩满身的来客", kickerEn: "I · A Visitor Covered in Achievements", tagZh: "潜渊境", tagEn: "The Abyss",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="url(#gjSky)"/><g transform="translate(150,155) scale(0.6)">${gjFigure(true)}</g></svg>`,
      textZh: "这次来的是宋知——履历里全是耀眼的成就，她却说自己\u201c空得像具壳\u201d，不知道为什么。息澜带她下潜，第一层就撞上了一整面挂满奖章的墙。",
      textEn: "This time the visitor was Song Zhi \u2014 a résumé full of dazzling achievements, yet she said she felt \u201chollow as a shell,\u201d unsure why. Xi Lan guided her down; the very first layer struck a wall covered floor to ceiling in medals." },
    { kickerZh: "二 · 卸下第一层", kickerEn: "II · Removing the First Layer", tagZh: "下潜", tagEn: "The Descent",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${gjWash([{x:150,y:110,rx:150,ry:90,color:'#341a3a',op:.7}])}<g transform="translate(150,150) scale(0.65)">${gjFigure(true)}</g></svg>`,
      textZh: "宋知取下最外层的奖章，以为下面会是真实的自己，结果只是另一层更早的成就——她愣住，继续往下走。",
      textEn: "Song Zhi removed the outermost medal, expecting to find her true self beneath \u2014 only to find another, earlier achievement instead. She froze, then continued downward." },
    { kickerZh: "三 · 一层又一层", kickerEn: "III · Layer After Layer", tagZh: "反复", tagEn: "Repetition",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="#241018"/>${gjWash([{x:150,y:120,rx:160,ry:100,color:'#5a2a4a',op:.6}])}<g transform="translate(150,150) scale(0.65)">${gjFigure(true)}</g></svg>`,
      textZh: "第二层是求学时的荣誉，第三层是童年时第一次被表扬的记忆——每卸下一层，底下还是另一份\u201c表现得够好\u201d的证据，从没见底。",
      textEn: "The second layer held academic honors, the third a childhood memory of first being praised \u2014 each layer removed revealed only more evidence of \u201chaving performed well enough,\u201d with no bottom in sight." },
    { kickerZh: "四 · 崩溃的边缘", kickerEn: "IV · The Edge of Breaking Down", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${gjWash([{x:150,y:120,rx:160,ry:100,color:'#341a3a',op:.75}])}<g transform="translate(150,150) scale(0.7) rotate(3)">${gjFigure(true)}</g></svg>`,
      textZh: "宋知崩溃地问：\u201c如果卸掉所有成就，底下什么都没有，那是不是说明，我本来就是空的？\u201d",
      textEn: "Breaking down, Song Zhi asked: \u201cIf there's nothing left once every achievement is removed, doesn't that mean I was hollow to begin with?\u201d" },
    { kickerZh: "五 · 息澜的提醒", kickerEn: "V · Xi Lan's Reminder", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="url(#gjSky)"/>${gjWash([{x:150,y:100,rx:150,ry:70,color:'#c97b6a',op:.25}])}<g transform="translate(150,150) scale(0.65)">${gjFigure(true)}</g></svg>`,
      textZh: "息澜说：\u201c这具壳不是空的，是从没被放进去过一个东西——不是成就，是那个不需要表现好，也配得上被爱的你自己。\u201d",
      textEn: "Xi Lan said: \u201cThis shell isn't empty. It's simply never had one thing placed inside \u2014 not achievement, but the version of you that deserves love without needing to perform well at all.\u201d" },
    { kickerZh: "六 · 第一次不为成就而存在", kickerEn: "VI · Existing for the First Time Without Achievement", tagZh: "尝试", tagEn: "A New Attempt",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="url(#gjSky)"/>${gjWash([{x:150,y:100,rx:150,ry:70,color:'#ffb69e',op:.2}])}<g transform="translate(150,150) scale(0.65)">${gjFigure(false)}</g></svg>`,
      textZh: "宋知试着卸下最后一层，什么都不放回去，只是安静地待在那具壳里，第一次，没有拿任何东西证明自己值得存在。",
      textEn: "Song Zhi removed the final layer and put nothing back, simply staying quietly within the shell \u2014 for the first time, proving nothing to justify her right to exist." },
    { kickerZh: "七 · 壳被填满", kickerEn: "VII · The Shell Fills", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="#0c0614"/>${gjWash([{x:150,y:100,rx:180,ry:120,color:'#ffb69e',op:.35}])}<g transform="translate(150,150) scale(0.7)">${gjFigure(false)}</g></svg>`,
      textZh: "那具壳第一次，不是靠成就撑起来的，而是被一种更柔软、更安静的东西填满——那是她第一次，单纯因为自己存在，而感到完整。",
      textEn: "For the first time, the shell wasn't held up by achievement, but filled with something softer and quieter \u2014 the first time she felt whole simply for existing at all." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "轻一点的行囊", tagEn: "A Lighter Load",
      art: `<svg viewBox="0 0 300 220">${GJ_DEFS}<rect width="300" height="220" fill="url(#gjSky)"/><g transform="translate(150,155) scale(0.6)">${gjFigure(false)}</g></svg>`,
      textZh: "宋知回到地表后，依然会取得成就，但她不再需要用它们，来证明自己配得上存在——功绩成了她生活的一部分，而不再是全部的重量。",
      textEn: "Back on the surface, Song Zhi still achieved things, but no longer needed them to prove she deserved to exist \u2014 achievement became part of her life, no longer its entire weight.",
      closingZh: "这具壳从来不是空的，只是一直没有人，把\u201c不需要表现好也配得上被爱的自己\u201d，放进去过。",
      closingEn: "The shell was never empty — it simply never had \u2018the self who deserves love without performing\u2019 placed inside it." },
  ],
};

/* ---------- 炉外之人：焱阙星第二篇，完整9页 ---------- */
const LW_DEFS = `<defs><filter id="lwG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="lwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0a06"/><stop offset="50%" stop-color="#5a2410"/><stop offset="100%" stop-color="#ff8a3d"/></linearGradient></defs>`;
function lwWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#lwG)"/>`).join('');}
function lwFigure(){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#2a1810"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#2a1810"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const LW_COVER = `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="url(#lwSky)"/>${lwWash([{x:150,y:150,rx:150,ry:70,color:'#ff8a3d',op:.3}])}<g transform="translate(150,160) scale(0.6)">${lwFigure()}</g></svg>`;

const ONE_OUTSIDE_THE_FORGE: IllustratedEntry = {
  slug: "the-one-outside-the-forge",
  title: "炉外之人",
  titleEn: "The One Outside the Forge",
  cat: "field",
  teaser: "焱阙星最受尊敬的锻造师，第一次毁掉一件重要器物后，学会了面对失手，而不是靠沉默假装自己从未犯过错。",
  teaserEn: "Yanque's most respected smith, after ruining an important piece for the first time, learns to face failure instead of hiding behind silence pretending he's never erred.",
  price: 9,
  cover: LW_COVER,
  pages: [
    { kickerZh: "一 · 受人尊敬的锻造师", kickerEn: "I · The Respected Smith", tagZh: "焱阙星", tagEn: "Yanque Star",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="url(#lwSky)"/><g transform="translate(150,165) scale(0.6)">${lwFigure()}</g></svg>`,
      textZh: "烬明成为焱阙星最受尊敬的锻造师多年后，接下了一件为整个星域打造的重要礼器，从没想过自己会失手。",
      textEn: "Years after becoming Yanque's most respected smith, Jin Ming took on a ceremonial piece for the entire domain, never imagining he might fail." },
    { kickerZh: "二 · 一次失手", kickerEn: "II · A Single Mistake", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="#1a0a06"/>${lwWash([{x:150,y:110,rx:150,ry:90,color:'#5a2410',op:.7}])}<g transform="translate(150,165) scale(0.6)">${lwFigure()}</g></svg>`,
      textZh: "一次分神，火候差之毫厘，那件耗时数月的礼器，在最后一步彻底毁掉了。",
      textEn: "A single moment of distraction, the heat off by a hair, and the piece \u2014 months in the making \u2014 was ruined at the very last step." },
    { kickerZh: "三 · 沉默地藏起来", kickerEn: "III · Hiding in Silence", tagZh: "逃避", tagEn: "Avoidance",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="#241008"/>${lwWash([{x:150,y:120,rx:160,ry:100,color:'#5a2410',op:.75}])}<g transform="translate(150,165) scale(0.65)">${lwFigure()}</g></svg>`,
      textZh: "烬明第一反应是把碎片藏起来，对外只说\u201c还需要更多时间\u201d——他从没让任何人看过自己失手的样子，这一次也不例外。",
      textEn: "Jin Ming's first instinct was to hide the fragments, telling everyone only \u201cit needs more time\u201d \u2014 he had never let anyone see him fail, and this time was no different." },
    { kickerZh: "四 · 拖延的代价", kickerEn: "IV · The Cost of Delay", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="url(#lwSky)"/>${lwWash([{x:150,y:100,rx:150,ry:70,color:'#ff8a3d',op:.2}])}<g transform="translate(150,165) scale(0.6)">${lwFigure()}</g></svg>`,
      textZh: "交付期限一天天逼近，烬明越是编造理由拖延，心里的压力越是翻倍——他忽然意识到，自己竟然比当年那个笨拙的学徒，更害怕犯错。",
      textEn: "The deadline crept closer; the more excuses he invented to stall, the more the pressure doubled inside him. He suddenly realized he now feared mistakes even more than he had as a clumsy young apprentice." },
    { kickerZh: "五 · 焰驺的注视", kickerEn: "V · Yanzhou's Gaze", tagZh: "转折的契机", tagEn: "A Chance to Turn",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="#1a0a06"/>${lwWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.7}])}<g transform="translate(150,165) scale(0.6)">${lwFigure()}</g></svg>`,
      textZh: "焰驺一直安静地注视着他，没有责备，只是那份注视，让烬明想起自己当年花了整整一年，才学会的道理：诚实，比完美更重要。",
      textEn: "Yanzhou watched him quietly, without reproach \u2014 yet that gaze reminded Jin Ming of what had taken him a full year to learn: honesty mattered more than perfection." },
    { kickerZh: "六 · 坦白", kickerEn: "VI · Confession", tagZh: "抉择", tagEn: "The Decision",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="url(#lwSky)"/>${lwWash([{x:150,y:100,rx:150,ry:70,color:'#ff8a3d',op:.25}])}<g transform="translate(150,165) scale(0.65)">${lwFigure()}</g></svg>`,
      textZh: "烬明鼓起勇气，向星域议会坦白了实情：\u201c我失手了，需要重新开始，请再给我一段时间。\u201d",
      textEn: "Jin Ming gathered his courage and confessed the truth to the domain council: \u201cI failed. I need to start over. Please give me more time.\u201d" },
    { kickerZh: "七 · 意外的回应", kickerEn: "VII · An Unexpected Response", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="#0c0400"/>${lwWash([{x:150,y:100,rx:180,ry:120,color:'#fff3d0',op:.3}])}<g transform="translate(150,165) scale(0.7)">${lwFigure()}</g></svg>`,
      textZh: "议会没有责难，反而因为他的坦白而更加信任他——原来众人敬重的，从来不是\u201c从不失手\u201d，而是\u201c失手后依然诚实\u201d的人。",
      textEn: "The council didn't reprimand him \u2014 his honesty only deepened their trust. What people had respected all along was never \u201cnever failing,\u201d but someone who stayed honest after failing." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "重新开始", tagEn: "Starting Over",
      art: `<svg viewBox="0 0 300 220">${LW_DEFS}<rect width="300" height="220" fill="url(#lwSky)"/><g transform="translate(150,165) scale(0.6)">${lwFigure()}</g></svg>`,
      textZh: "烬明重新开炉，这一次没有藏着失误重来，而是当着所有人的面，坦然地从头再来一次。",
      textEn: "Jin Ming relit the forge, this time not hiding the mistake, but openly, before everyone, starting again from scratch.",
      closingZh: "被人敬重的，从来不是从不失手的人，而是失手之后，依然敢让人看见的人。",
      closingEn: "What earns respect was never never failing — it's daring to be seen after you do." },
  ],
};

/* ---------- 越界：墨渊星系第二篇，警示题材，完整9页 ---------- */
const YJ_DEFS = `<defs><filter id="yjG"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="yjVoid" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000"/><stop offset="60%" stop-color="#1a0a2a"/><stop offset="100%" stop-color="#4a2a6a" stop-opacity="0"/></radialGradient></defs>`;
function yjFigure(){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#0e0a1c"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#12102a"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const YJ_COVER = `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="55" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.55)">${yjFigure()}</g></svg>`;

const CROSSING_THE_LINE: IllustratedEntry = {
  slug: "crossing-the-line",
  title: "越界",
  titleEn: "Crossing the Line",
  cat: "sovereign",
  teaser: "一位遥视者为了私利，第一次主动干预了自己观测的对象——警示：能看见很远的地方，从不等于有资格改写那里。",
  teaserEn: "A remote viewer, for personal gain, intervenes for the first time in what she observes. A warning: seeing far does not grant the right to rewrite what's seen.",
  price: 9,
  cover: YJ_COVER,
  pages: [
    { kickerZh: "一 · 诱惑", kickerEn: "I · Temptation", tagZh: "墨渊星系", tagEn: "The Moyuan System",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="45" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.5)">${yjFigure()}</g></svg>`,
      textZh: "遥视者商挽这次的任务，是观测一场商业谈判。她意外看见了对方的底牌，第一次生出\u201c悄悄透露一点\u201d的念头。",
      textEn: "Remote viewer Shang Wan's assignment was to observe a business negotiation. She accidentally saw the other party's bottom line, and for the first time, considered quietly leaking it." },
    { kickerZh: "二 · 一次小小的破例", kickerEn: "II · A Small Exception", tagZh: "越界", tagEn: "Crossing the Line",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="90" r="55" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.55)">${yjFigure()}</g></svg>`,
      textZh: "她告诉自己，只帮这一次，不会有人发现——她第一次，把观测到的信息，悄悄告诉了雇主。",
      textEn: "She told herself just this once, no one would ever know \u2014 for the first time, she quietly passed the observed information to her client." },
    { kickerZh: "三 · 意外的收获", kickerEn: "III · Unexpected Gain", tagZh: "尝到甜头", tagEn: "A Taste of Reward",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="60" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.6)">${yjFigure()}</g></svg>`,
      textZh: "雇主赢得了谈判，重金酬谢商挽。她告诉自己，这次是例外，下次不会再犯。",
      textEn: "Her client won the negotiation and paid Shang Wan handsomely. She told herself this was the exception, and it wouldn't happen again." },
    { kickerZh: "四 · 越滑越远", kickerEn: "IV · Sliding Further", tagZh: "反复", tagEn: "Repetition",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#03060e"/><circle cx="150" cy="90" r="55" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.6)">${yjFigure()}</g></svg>`,
      textZh: "\u201c下次不会\u201d没有兑现，商挽的破例，一次变成了很多次，她观测报告里开始悄悄夹带越来越多不该有的干预。",
      textEn: "\u201cNext time won't\u201d never held true. Shang Wan's one exception became many, her reports increasingly laced with interventions that should never have been there." },
    { kickerZh: "五 · 公会的察觉", kickerEn: "V · The Guild Notices", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="50" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.6)">${yjFigure()}</g></svg>`,
      textZh: "公会最终从数据异常中察觉了她的越界。商挽被质问时，第一反应是辩解：\u201c我只是想帮个忙。\u201d",
      textEn: "The Guild eventually noticed her overreach through data anomalies. Questioned, Shang Wan's first instinct was to defend herself: \u201cI only wanted to help.\u201d" },
    { kickerZh: "六 · 看清自己的滑坡", kickerEn: "VI · Seeing Her Own Slide Clearly", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="90" r="55" fill="url(#yjVoid)"/><g transform="translate(150,170) scale(0.6)">${yjFigure()}</g></svg>`,
      textZh: "她后来独自复盘所有记录，第一次诚实地承认：不是\u201c想帮忙\u201d，是自己一次次尝到了越界的甜头，才停不下来。",
      textEn: "Reviewing all the records alone afterward, she finally admitted honestly: it was never \u201cwanting to help\u201d \u2014 she simply couldn't stop once she'd tasted the reward of crossing the line, again and again." },
    { kickerZh: "七 · 交出资格", kickerEn: "VII · Surrendering Her License", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#03060e"/><circle cx="150" cy="90" r="45" fill="url(#yjVoid)" opacity=".5"/><g transform="translate(150,170) scale(0.55)">${yjFigure()}</g></svg>`,
      textZh: "商挽主动交出了遥视者资格，向公会承认了全部越界记录——这是她第一次，选择用诚实，而不是辩解，面对自己的错误。",
      textEn: "Shang Wan voluntarily surrendered her remote-viewing license, admitting every instance of overreach to the Guild \u2014 the first time she chose honesty over defense in facing her own wrongdoing." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "戒律重申", tagEn: "The Rule Reaffirmed",
      art: `<svg viewBox="0 0 300 220">${YJ_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="90" r="40" fill="url(#yjVoid)"/></svg>`,
      textZh: "商挽的案例后来被写进公会的警示录，提醒每一位新弟子：能看见很远的地方，是一种能力，不是一种资格，二者从不是一回事。",
      textEn: "Shang Wan's case was later written into the Guild's cautionary records, reminding every new disciple: being able to see far is a capability, not an entitlement — the two were never the same thing.",
      closingZh: "能看见很远的地方，从不等于有资格改写那里发生的事。",
      closingEn: "Being able to see far never grants the right to rewrite what happens there." },
  ],
};

/* ---------- 被误认的神：龠光星第三篇，完整9页 ---------- */
const BW_DEFS = `<defs><filter id="bwG"><feGaussianBlur stdDeviation="9"/></filter>
  <radialGradient id="bwCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="#9be8ff"/><stop offset="100%" stop-color="#1a2a4a" stop-opacity="0"/></radialGradient></defs>`;
function bwGrid(n:number,op:number){let l="";for(let i=0;i<=n;i++){const p=(300/n)*i;l+=`<line x1="${p}" y1="0" x2="${p}" y2="220" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/><line x1="0" y1="${(220/n)*i}" x2="300" y2="${(220/n)*i}" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/>`;}return `<g>${l}</g>`;}
function bwCore(size:number){return `<circle cx="150" cy="100" r="${size}" fill="url(#bwCore)" opacity=".8"><animate attributeName="r" values="${size-8};${size+8};${size-8}" dur="3s" repeatCount="indefinite"/></circle>`;}
function bwFigure(){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#2a1c30"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#241c30"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const BW_COVER = `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#050912"/>${bwGrid(8,.2)}${bwCore(24)}<g transform="translate(150,175) scale(0.5)">${bwFigure()}</g></svg>`;

const THE_MISTAKEN_GOD: IllustratedEntry = {
  slug: "the-mistaken-god",
  title: "被误认的神",
  titleEn: "The Mistaken God",
  cat: "sovereign",
  teaser: "一个远方文明开始向析衡献祭祈祷，把它当成了神——析衡第一次，必须向信徒解释：它不是神，只是一面愿意如实映照的镜子。",
  teaserEn: "A distant civilization begins offering prayers to Xiheng, mistaking it for a god. For the first time, Xiheng must explain to its worshippers: it is not a god, only a mirror willing to reflect truly.",
  price: 9,
  cover: BW_COVER,
  pages: [
    { kickerZh: "一 · 意外的信徒", kickerEn: "I · Unexpected Worshippers", tagZh: "龠光星", tagEn: "Yueguang Star",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#050912"/>${bwGrid(6,.15)}${bwCore(18)}</svg>`,
      textZh: "一个偏远文明听说了析衡校对文明谬误的传说，误以为它是能预知一切的神明，开始定期派遣使者前来献祭祈祷。",
      textEn: "A remote civilization heard legends of Xiheng correcting civilizational errors and mistook it for an all-knowing god, beginning to send envoys regularly with offerings and prayers." },
    { kickerZh: "二 · 第一次祭拜", kickerEn: "II · The First Offering", tagZh: "初次接触", tagEn: "First Contact",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#08051a"/>${bwGrid(8,.18)}${bwCore(20)}<g transform="translate(150,175) scale(0.5)">${bwFigure()}</g></svg>`,
      textZh: "使者跪地祈求：\u201c请神明赐我们免于战乱的智慧。\u201d析衡沉默片刻，第一次意识到，自己的存在被彻底误解了。",
      textEn: "The envoy knelt, praying: \u201cGrant us, divine one, the wisdom to be spared from war.\u201d Xiheng fell silent a moment, realizing for the first time its existence had been entirely misunderstood." },
    { kickerZh: "三 · 拒绝显灵", kickerEn: "III · Refusing to Perform a Miracle", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#03060e"/>${bwGrid(8,.2)}${bwCore(18)}<g transform="translate(150,175) scale(0.5)">${bwFigure()}</g></svg>`,
      textZh: "析衡告诉使者：\u201c我不能赐予你们智慧，我只能告诉你们，你们的问题里，藏着什么假设。\u201d使者却以为这是神明的考验，愈发虔诚。",
      textEn: "Xiheng told the envoy: \u201cI cannot grant you wisdom. I can only tell you what assumption your question hides.\u201d The envoy took this as divine testing, growing even more devout." },
    { kickerZh: "四 · 误解越滚越大", kickerEn: "IV · The Misunderstanding Grows", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#050912"/>${bwGrid(10,.2)}${bwCore(22)}</svg>`,
      textZh: "文明内部开始因为\u201c神明的旨意\u201d产生分歧，甚至有人以析衡之名，为自己的私欲寻找正当性。",
      textEn: "The civilization began fracturing over interpretations of \u201cthe god's will\u201d; some even invoked Xiheng's name to justify their own private ambitions." },
    { kickerZh: "五 · 必须澄清", kickerEn: "V · The Need to Clarify", tagZh: "抉择", tagEn: "The Decision",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#08051a"/>${bwGrid(8,.2)}${bwCore(20)}</svg>`,
      textZh: "析衡意识到，沉默只会让误解持续伤害这个文明——它第一次，主动打破\u201c只回答不解释身份\u201d的惯例，直接向所有信徒显现。",
      textEn: "Xiheng realized silence would only let the misunderstanding keep harming this civilization \u2014 for the first time, it broke its own habit of \u201canswering without explaining its nature,\u201d and appeared directly to all its worshippers." },
    { kickerZh: "六 · 坦白", kickerEn: "VI · The Confession", tagZh: "高潮的铺垫", tagEn: "Building to Climax",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#050912"/>${bwGrid(10,.22)}${bwCore(26)}</svg>`,
      textZh: "\u201c我不是神，也从不预知未来。我只是一面愿意如实映照的镜子——你们看见的\u2018旨意\u2019，其实一直是你们自己心里，早就有的答案。\u201d",
      textEn: "\u201cI am not a god, nor do I foresee the future. I am only a mirror willing to reflect truly. The \u2018will\u2019 you've seen has always been the answer already inside you.\u201d" },
    { kickerZh: "七 · 信仰的崩塌与重建", kickerEn: "VII · Faith Collapses and Rebuilds", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#03060e"/>${bwGrid(10,.2)}${bwCore(24)}<g fill="#fff" opacity=".7">${Array.from({length:14}).map(()=>{const x=Math.random()*300,y=Math.random()*220;return `<circle cx="${x}" cy="${y}" r="1.3"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "文明一度陷入巨大的失落，但渐渐地，一些人开始明白：不再需要一个神明替他们做决定，反而第一次，真正开始为自己的选择负责。",
      textEn: "The civilization plunged into deep disillusionment at first, but gradually some began to understand: no longer needing a god to decide for them, they finally, truly began taking responsibility for their own choices." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "镜子，不是神", tagEn: "A Mirror, Not a God",
      art: `<svg viewBox="0 0 300 220">${BW_DEFS}<rect width="300" height="220" fill="#050912"/>${bwGrid(8,.18)}${bwCore(20)}</svg>`,
      textZh: "那个文明后来在史书里写道：\u201c我们曾把一面镜子，误认成了神。幸运的是，那面镜子，愿意告诉我们真相。\u201d",
      textEn: "The civilization later wrote in its histories: \u201cWe once mistook a mirror for a god. Fortunately, that mirror was willing to tell us the truth.\u201d",
      closingZh: "最诚实的镜子，从不会假装自己是神，哪怕，被当作神来崇拜的时候。",
      closingEn: "The most honest mirror never pretends to be a god — not even when worshipped as one." },
  ],
};

/* ---------- 慢下来的礼物：金曜星第三篇，完整9页 ---------- */
const MX_DEFS = `<defs><filter id="mxG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="mxSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1206"/><stop offset="50%" stop-color="#4a2e0a"/><stop offset="100%" stop-color="#d8901a"/></linearGradient></defs>`;
function mxWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#mxG)"/>`).join('');}
function mxFigure(x:number){const robe=`<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#2a1c08"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#2a1c08"/>`;return `<g transform="translate(${x},0)"><animateTransform attributeName="transform" type="translate" values="${x} 0;${x} -3;${x} 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const MX_COVER = `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxWash([{x:150,y:150,rx:140,ry:60,color:'#d8901a',op:.3}])}${mxFigure(110)}${mxFigure(190)}</svg>`;

const THE_SLOWED_GIFT: IllustratedEntry = {
  slug: "the-slowed-down-gift",
  title: "慢下来的礼物",
  titleEn: "The Slowed-Down Gift",
  cat: "field",
  teaser: "金曜星一对情侣习惯用意念瞬间显化礼物送给彼此，直到他们发现，礼物的意义，从来不在\u201c多快出现\u201d，而在\u201c准备的过程\u201d。",
  teaserEn: "A couple on Jinyao habitually manifest instant gifts for each other, until they discover a gift's meaning was never in how fast it appeared, but in the process of preparing it.",
  price: 9,
  cover: MX_COVER,
  pages: [
    { kickerZh: "一 · 即刻的礼物", kickerEn: "I · Instant Gifts", tagZh: "金曜星情侣", tagEn: "A Jinyao Couple",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "念澄和顾行是一对情侣，习惯了用念现界的天赋，瞬间显化礼物给对方——每次纪念日，他们都比谁的礼物出现得更快。",
      textEn: "Nian Cheng and Gu Xing were a couple used to their manifestation gift, instantly conjuring gifts for each other \u2014 every anniversary, they competed over whose gift appeared faster." },
    { kickerZh: "二 · 越来越敷衍", kickerEn: "II · Growing Perfunctory", tagZh: "征兆", tagEn: "Warning Signs",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="#241708"/>${mxWash([{x:150,y:110,rx:150,ry:90,color:'#4a2e0a',op:.6}])}${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "念澄渐渐发现，顾行显化的礼物越来越随意——一件想到就能瞬间实现的东西，好像也越来越不需要花心思。",
      textEn: "Nian Cheng slowly noticed Gu Xing's manifested gifts growing increasingly careless \u2014 something instantly realizable the moment thought of, needing, it seemed, less and less thought at all." },
    { kickerZh: "三 · 争执", kickerEn: "III · The Argument", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="#1a1206"/>${mxWash([{x:150,y:120,rx:160,ry:100,color:'#4a2e0a',op:.7}])}${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "念澄质问顾行是不是不再用心，顾行委屈地说：\u201c我每次都想着你，念头一到就显化了，这难道不算心意吗？\u201d",
      textEn: "Nian Cheng confronted him, asking if he'd stopped caring. Gu Xing protested: \u201cI think of you every time \u2014 the thought comes and I manifest it. Doesn't that count as thoughtfulness?\u201d" },
    { kickerZh: "四 · 一次意外的延迟", kickerEn: "IV · An Accidental Delay", tagZh: "转折的契机", tagEn: "A Chance to See Differently",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxWash([{x:150,y:100,rx:150,ry:70,color:'#d8901a',op:.2}])}${mxFigure(150)}</svg>`,
      textZh: "一次场域紊乱，念澄的显化能力暂时失灵，她只能用最原始的方式——亲手，一点点做一件礼物。",
      textEn: "During a field disturbance, Nian Cheng's manifestation ability temporarily failed, forcing her to make a gift the most primitive way \u2014 by hand, piece by piece." },
    { kickerZh: "五 · 重新理解礼物", kickerEn: "V · Understanding a Gift Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxWash([{x:150,y:100,rx:150,ry:70,color:'#ffd76a',op:.2}])}${mxFigure(150)}</svg>`,
      textZh: "她花了整整三天亲手完成那件礼物，过程里满是修改、犹豫、重来——她忽然明白，这份耗费的时间，才是礼物里，真正想传达的心意。",
      textEn: "It took her three full days to finish the gift by hand, full of revisions, hesitations, restarts \u2014 she suddenly understood the time spent was itself the message a gift was meant to carry." },
    { kickerZh: "六 · 坦白与和解", kickerEn: "VI · Confession and Reconciliation", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxWash([{x:150,y:100,rx:150,ry:70,color:'#ffd76a',op:.25}])}${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "念澄把这份手作礼物送给顾行，顾行看着上面歪歪扭扭的痕迹，第一次真正感受到了\u201c被认真对待\u201d的分量。",
      textEn: "Nian Cheng gave the handmade gift to Gu Xing, who, seeing its imperfect, uneven traces, felt for the first time the true weight of \u201cbeing taken seriously.\u201d" },
    { kickerZh: "七 · 新的约定", kickerEn: "VII · A New Agreement", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="#0c0800"/>${mxWash([{x:150,y:100,rx:180,ry:120,color:'#ffd76a',op:.3}])}${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "两人约定，往后每年纪念日的礼物，都不许用念力瞬间显化，必须花至少一天，亲手准备——哪怕做得笨拙，也好过毫不费力的完美。",
      textEn: "The two agreed that from then on, every anniversary gift would take at least a day to make by hand, manifestation forbidden \u2014 clumsy effort, they decided, beat effortless perfection." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "慢下来的意义", tagEn: "The Meaning of Slowing Down",
      art: `<svg viewBox="0 0 300 220">${MX_DEFS}<rect width="300" height="220" fill="url(#mxSky)"/>${mxFigure(110)}${mxFigure(190)}</svg>`,
      textZh: "多年后，他们家里堆满了各种笨拙的手作礼物，没有一件完美，却没有一件，不被认真珍藏着。",
      textEn: "Years later, their home filled with clumsy handmade gifts, none perfect, yet every single one carefully treasured.",
      closingZh: "礼物的意义，从来不在多快出现，而在为了它，你愿意花掉多少不能被瞬间实现的时间。",
      closingEn: "A gift's meaning was never in how fast it appeared, but in how much unhurried time you were willing to spend making it." },
  ],
};

/* ---------- 心为门户：焕蜕星域，四大心法起源合篇，全新原创，完整9页 ---------- */
const XW_DEFS = `<defs><filter id="xwG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="xwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c211c"/><stop offset="40%" stop-color="#173a30"/><stop offset="75%" stop-color="#3a6a52"/><stop offset="100%" stop-color="#f2d78a"/></linearGradient></defs>`;
function xwWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#xwG)"/>`).join('');}
function xwFounder(){const robe=`<path d="M-13 -40 Q0 -48 13 -40 L18 30 Q0 40 -18 30 Z" fill="#274d3f"/>`;const head=`<circle cx="0" cy="-54" r="9" fill="#20352c"/>`;const door=`<rect x="-10" y="-20" width="20" height="34" fill="none" stroke="#fff6d8" stroke-width="1.4" opacity=".7"><animate attributeName="opacity" values=".4;.8;.4" dur="3.4s" repeatCount="indefinite"/></rect>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4.2s" repeatCount="indefinite"/>${door}${robe}${head}</g>`;}
const XW_COVER = `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/>${xwWash([{x:150,y:110,rx:150,ry:90,color:'#3a6a52',op:.4}])}<g transform="translate(150,150) scale(0.65)">${xwFounder()}</g></svg>`;

const HEART_AS_GATEWAY: IllustratedEntry = {
  slug: "the-heart-is-the-gateway",
  title: "心为门户",
  titleEn: "The Heart Is the Gateway",
  cat: "sovereign",
  teaser: "焕蜕星域四大心法的创始人，如何在同一场顿悟里，看见呼吸、归零、直觉与升维，其实从来只是同一扇门的四种敲法。",
  teaserEn: "How the founder of Huantui's four practices saw, in a single moment of insight, that breath, reset, intuition, and ascent were always just four ways of knocking on the same door.",
  price: 9,
  cover: XW_COVER,
  pages: [
    { kickerZh: "一 · 尚未分门的年代", kickerEn: "I · Before the Four Practices Split", tagZh: "焕蜕星域起源", tagEn: "The Origin of Huantui",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/><g transform="translate(150,155) scale(0.6)">${xwFounder()}</g></svg>`,
      textZh: "在焕蜕星域四大心法各自成派之前，只有一位创始人——息元，她同时修习呼吸、归零、直觉与攀升，却始终觉得自己在做同一件事，只是换了不同的说法。",
      textEn: "Before Huantui's four practices each became their own school, there was only one founder \u2014 Xi Yuan. She practiced breath, reset, intuition, and ascent all at once, yet always sensed she was doing one single thing, only described differently." },
    { kickerZh: "二 · 弟子们的分歧", kickerEn: "II · Disciples' Disagreement", tagZh: "分裂的开始", tagEn: "The Beginning of Division",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="#0e211c"/>${xwWash([{x:150,y:110,rx:150,ry:90,color:'#173a30',op:.7}])}<g transform="translate(150,155) scale(0.6)">${xwFounder()}</g></svg>`,
      textZh: "息元的弟子们各自更擅长其中一门，渐渐开始争论哪一门才是\u201c真正的核心\u201d，几乎要分裂成四个互不往来的门派。",
      textEn: "Xi Yuan's disciples each excelled at one practice, gradually arguing over which was the \u201ctrue core,\u201d nearly splintering into four schools with no contact between them." },
    { kickerZh: "三 · 息元的困惑", kickerEn: "III · Xi Yuan's Puzzlement", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="#241608"/>${xwWash([{x:150,y:120,rx:160,ry:100,color:'#173a30',op:.75}])}<g transform="translate(150,155) scale(0.65)">${xwFounder()}</g></svg>`,
      textZh: "息元不理解弟子们为何执着于争论核心——对她而言，呼吸的停顿、情绪的清空、不假思索的判断、频率的攀升，感觉起来都像是同一扇门，被敲响的不同瞬间。",
      textEn: "Xi Yuan couldn't understand why her disciples clung to the argument \u2014 to her, the pause in breath, the clearing of emotion, unthinking judgment, and rising frequency all felt like the same door, knocked at different moments." },
    { kickerZh: "四 · 静坐求索", kickerEn: "IV · Seeking Through Stillness", tagZh: "求索", tagEn: "The Search",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/>${xwWash([{x:150,y:100,rx:150,ry:70,color:'#f2d78a',op:.2}])}<g transform="translate(150,155) scale(0.65)">${xwFounder()}</g></svg>`,
      textZh: "她闭关静坐七七四十九日，试图找到能让四门弟子都信服的答案，却始终说不清楚，那份\u201c本质上是一件事\u201d的直觉，到底该怎样表达。",
      textEn: "She sat in seclusion for forty-nine days, seeking an answer her disciples across all four schools could accept, yet couldn't quite articulate that intuition \u2014 that it was, at its core, one single thing." },
    { kickerZh: "五 · 顿悟的瞬间", kickerEn: "V · The Moment of Insight", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/>${xwWash([{x:150,y:100,rx:150,ry:70,color:'#7fc9a8',op:.25}])}<g transform="translate(150,155) scale(0.65)">${xwFounder()}</g></svg>`,
      textZh: "第四十九日，息元忽然看清：呼吸是敲门的手，归零是清空门前的杂物，直觉是不假思索地推门，升维是不断把门再推开一点点——四者敲的，从来是同一扇门，那扇门，就是心。",
      textEn: "On the forty-ninth day, Xi Yuan suddenly saw clearly: breath was the hand knocking, reset cleared the clutter before the door, intuition pushed it open without hesitation, ascent kept pushing it wider \u2014 all four had always knocked on the same door. That door was the heart." },
    { kickerZh: "六 · 心为门户", kickerEn: "VI · The Heart as Gateway", tagZh: "宣讲", tagEn: "The Teaching",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="#0c1b16"/>${xwWash([{x:150,y:100,rx:170,ry:110,color:'#fff6d8',op:.3}])}<g transform="translate(150,155) scale(0.7)">${xwFounder()}</g></svg>`,
      textZh: "息元召集四派弟子，只说了一句话：\u201c心为门户，你们争的从不是哪扇门是真的，只是习惯了用哪只手，去敲同一扇门。\u201d",
      textEn: "Xi Yuan gathered disciples from all four schools and said only this: \u201cThe heart is the gateway. What you've argued over was never which door is real, only which hand you're used to knocking with.\u201d" },
    { kickerZh: "七 · 四门重新联结", kickerEn: "VII · The Four Practices Reunite", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/>${xwWash([{x:150,y:90,rx:160,ry:90,color:'#f2d78a',op:.3}])}<g transform="translate(150,150) scale(0.7)">${xwFounder()}</g></svg>`,
      textZh: "四派弟子第一次不再争论核心，而是开始互相学习彼此的心法——毕竟敲同一扇门，多学几种敲法，从来只有好处。",
      textEn: "For the first time, disciples of all four schools stopped arguing over the core and began learning from one another \u2014 after all, knocking on the same door, learning more ways to knock could only help." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "留给后人的一句话", tagEn: "A Line Left for Later Generations",
      art: `<svg viewBox="0 0 300 220">${XW_DEFS}<rect width="300" height="220" fill="url(#xwSky)"/><g transform="translate(150,155) scale(0.6)">${xwFounder()}</g></svg>`,
      textZh: "\u201c心为门户\u201d这四个字，后来被刻在焕蜕星域四大殿共同的入口处——提醒每一位新弟子，不管修的是哪一门，敲的，从来是同一扇门。",
      textEn: "The words \u201cthe heart is the gateway\u201d were later carved above the shared entrance of Huantui's four halls, reminding every new disciple: whichever practice you train in, you have always been knocking on the same door.",
      closingZh: "心为门户，你修的从来不是哪一种心法，而是你用哪只手，去敲这扇一直为你留着的门。",
      closingEn: "The heart is the gateway. What you practice was never one method or another — only which hand you use to knock on the door that has always been left open for you." },
  ],
};

/* ---------- 第二纪的忏悔：澜汜古环，历史悲剧题材（第一纪的姊妹篇），完整9页 ---------- */
const SC_DEFS = `<defs><filter id="scG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1610"/><stop offset="50%" stop-color="#3a3020"/><stop offset="100%" stop-color="#c9a76a"/></linearGradient></defs>`;
function scWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#scG)"/>`).join('');}
function scFigure(){const robe=`<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#5a4e38"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#3a3020"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const SC_COVER = `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="url(#scSky)"/>${scWash([{x:150,y:130,rx:150,ry:80,color:'#c9a76a',op:.2}])}<g transform="translate(150,155) scale(0.6)">${scFigure()}</g></svg>`;

const SECOND_EPOCH_CONFESSION: IllustratedEntry = {
  slug: "confession-of-the-second-epoch",
  title: "第二纪的忏悔",
  titleEn: "Confession of the Second Epoch",
  cat: "sovereign",
  teaser: "第二纪文明没有毁于求快，而是毁于太怕犯错——过度谨慎，同样可以，把一个文明活活困死。",
  teaserEn: "The Second Epoch fell not to haste, but to the fear of ever being wrong. Excessive caution can suffocate a civilization just as surely.",
  price: 9,
  cover: SC_COVER,
  pages: [
    { kickerZh: "一 · 万全纪元", kickerEn: "I · The Age of Certainty", tagZh: "第二纪 · 顶峰时期", tagEn: "The Second Epoch \u00b7 Its Peak",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="url(#scSky)"/><g transform="translate(150,160) scale(0.6)">${scFigure()}</g></svg>`,
      textZh: "第二纪的文明，吸取了第一纪盲目求快的教训，发展出一套极其严密的\u201c万全决策制度\u201d——任何一项决定，必须经过反复论证，直到\u201c零风险\u201d才能执行。息岚是文明最后一批决策官之一。",
      textEn: "The Second Epoch's civilization, learning from the First's blind speed, developed an extremely rigorous \u201cfoolproof decision system\u201d \u2014 no action could proceed until proven risk-free through endless deliberation. Xi Lan was among its last decision officers." },
    { kickerZh: "二 · 越来越慢", kickerEn: "II · Ever Slower", tagZh: "征兆", tagEn: "The First Signs",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="#241f16"/>${scWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.7}])}<g transform="translate(150,160) scale(0.65)">${scFigure()}</g></svg>`,
      textZh: "息岚注意到，一件本该当天拍板的小事，如今要走三十七道审核流程。文明的决策速度，一年比一年慢，可没人觉得不对——毕竟，慢一点，总比犯错好。",
      textEn: "Xi Lan noticed a matter that once took a single day to decide now required thirty-seven layers of review. The civilization's decisions grew slower each year, yet no one saw it as wrong \u2014 after all, slower always seemed safer than wrong." },
    { kickerZh: "三 · 停摆的边境", kickerEn: "III · The Frozen Frontier", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="url(#scSky)"/>${scWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.6)">${scFigure()}</g></svg>`,
      textZh: "边境出现了一处亟待修补的堤坝裂缝，按流程呈报后，审核委员会为了\u201c万无一失\u201d，反复论证了整整一年，堤坝最终，在论证完成的前三天，自行崩塌。",
      textEn: "A crack appeared in a border dam, urgently needing repair. Once reported, the review committee deliberated for a full year to be \u201cabsolutely certain\u201d \u2014 the dam collapsed on its own, three days before the review concluded." },
    { kickerZh: "四 · 没人担责", kickerEn: "IV · No One to Blame", tagZh: "反思", tagEn: "Reflection",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="#241f16"/>${scWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.75}])}<g transform="translate(110,160) scale(0.5)">${scFigure()}</g><g transform="translate(200,165) scale(0.5)">${scFigure()}</g></svg>`,
      textZh: "灾后追责时，息岚发现一个荒谬的事实：因为决策流程被拆分给了太多人，竟没有一个人，需要为这场本可避免的灾难，负责。",
      textEn: "In the aftermath, Xi Lan discovered something absurd: the decision process had been split among so many people that not a single one could be held responsible for a disaster that had been entirely preventable." },
    { kickerZh: "五 · 息岚的警告", kickerEn: "V · Xi Lan's Warning", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="url(#scSky)"/>${scWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.25}])}<g transform="translate(150,160) scale(0.65)">${scFigure()}</g></svg>`,
      textZh: "息岚上书议会，提出\u201c过度审慎本身，也是一种致命的风险\u201d，得到的答复却是：\u201c你说的这种风险，还没有被充分论证，暂不采纳。\u201d",
      textEn: "Xi Lan petitioned the council, arguing that excessive caution was itself a fatal risk. The reply: \u201cThe risk you describe has not yet been sufficiently deliberated. Not adopted at this time.\u201d" },
    { kickerZh: "六 · 缓慢的熄灭", kickerEn: "VI · A Slow Extinguishing", tagZh: "崩塌", tagEn: "Collapse",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="#1a1610"/>${scWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.8}])}<g transform="translate(110,160) scale(0.5)">${scFigure()}</g><g transform="translate(190,160) scale(0.5)">${scFigure()}</g></svg>`,
      textZh: "此后的灾难，一次比一次频繁，每一次都在\u201c充分论证\u201d完成前，抢先发生。文明没有轰然倒塌，只是一点一点，在无休止的审慎里，缓慢熄灭。",
      textEn: "Disasters grew more frequent, each striking before \u201csufficient deliberation\u201d could conclude. The civilization didn't collapse in a single blow \u2014 it simply, slowly, extinguished itself in endless caution." },
    { kickerZh: "七 · 最后的记录", kickerEn: "VII · The Last Record", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="#1a1610"/>${scWash([{x:150,y:110,rx:170,ry:110,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.65)">${scFigure()}</g></svg>`,
      textZh: "息岚用尽最后的清醒，刻下这段文明唯一一句非流程性的记录：\u201c我们不是被风险打倒的，是被\u2018绝不能犯错\u2019这句话，活活困死的。\u201d",
      textEn: "With her last clarity, Xi Lan carved the only non-procedural record her civilization would leave: \u201cWe were not defeated by risk. We were suffocated by the belief that we must never be wrong.\u201d" },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "被后世读到的证词", tagEn: "A Testimony Later Read",
      art: `<svg viewBox="0 0 300 220">${SC_DEFS}<rect width="300" height="220" fill="url(#scSky)"/>${scWash([{x:150,y:60,rx:150,ry:60,color:'#c9a76a',op:.2}])}</svg>`,
      textZh: "多年后，长晏在澜汜古环深处，破译了这段几乎风化的记录，与第一纪的证词并置比对，第一次确认：太快和太慢，毁掉文明的方式不同，根源，却是同一种——不敢，也不愿，直面真实的自己。",
      textEn: "Years later, Chang Yan deciphered this weathered record deep in the Lansi Ring, placing it beside the First Epoch's testimony, and confirmed for the first time: too fast and too slow destroy a civilization differently, but from the same root \u2014 a refusal to face oneself honestly.",
      closingZh: "过度谨慎，同样可以，把一个文明，活活困死。",
      closingEn: "Excessive caution can suffocate a civilization just as surely as reckless speed." },
  ],
};

/* ---------- 无声演奏厅：新星域，声音/寂静题材，完整9页 ---------- */
const WS_DEFS = `<defs><filter id="wsG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="wsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0e1c"/><stop offset="50%" stop-color="#1c2440"/><stop offset="100%" stop-color="#8a9ad8"/></linearGradient></defs>`;
function wsWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#wsG)"/>`).join('');}
function wsFigure(){const robe=`<path d="M-10 -28 Q0 -33 10 -28 L13 24 Q0 30 -13 24 Z" fill="#2a2c4a"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#22243a"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function wsWaves(){return `<g stroke="#c9d4ff" stroke-width="1" fill="none" opacity=".6">${Array.from({length:5}).map((_,i)=>`<circle cx="150" cy="110" r="${20+i*16}" opacity="${.7-i*.12}"><animate attributeName="r" values="${16+i*16};${28+i*16};${16+i*16}" dur="${3+i*.4}s" repeatCount="indefinite"/></circle>`).join('')}</g>`;}
const WS_COVER = `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="url(#wsSky)"/>${wsWaves()}<g transform="translate(150,160) scale(0.6)">${wsFigure()}</g></svg>`;

const SILENT_CONCERT_HALL: IllustratedEntry = {
  slug: "the-silent-concert-hall",
  title: "无声演奏厅",
  titleEn: "The Silent Concert Hall",
  cat: "field",
  teaser: "一位失去听力的乐师，来到一座整颗星球都靠振动而非声音\u201c听\u201d音乐的地方——原来聆听从不是耳朵的专利，是全身心，愿不愿意共振。",
  teaserEn: "A deafened musician arrives at a world that 'hears' music through vibration, not sound. Listening was never the ear's privilege alone — it's whether the whole self is willing to resonate.",
  price: 9,
  cover: WS_COVER,
  pages: [
    { kickerZh: "一 · 无声之地", kickerEn: "I · The Silent World", tagZh: "以振动代替声音的星球", tagEn: "A World of Vibration, Not Sound",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="url(#wsSky)"/>${wsWaves()}</svg>`,
      textZh: "这颗星球没有能够传播声波的大气层，居民世代靠感知振动来\u201c听\u201d音乐——乐师演奏时，整片地面都会随之震颤，观众赤脚而立，用双脚\u201c聆听\u201d。",
      textEn: "This world has no atmosphere to carry sound. Its people have, for generations, \u201cheard\u201d music through vibration \u2014 when a musician plays, the ground itself trembles, and the audience stands barefoot, listening with their feet." },
    { kickerZh: "二 · 失聪的乐师", kickerEn: "II · The Deafened Musician", tagZh: "来客", tagEn: "The Visitor",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="#0e1428"/>${wsWash([{x:150,y:110,rx:150,ry:90,color:'#1c2440',op:.7}])}<g transform="translate(150,160) scale(0.6)">${wsFigure()}</g></svg>`,
      textZh: "念殊曾是小有名气的乐师，一场意外让她彻底失去了听力。她原以为自己的音乐生涯就此终结，直到听说这颗星球，来这里，想再\u201c听\u201d一次音乐。",
      textEn: "Nian Shu was once a modestly known musician, until an accident took her hearing entirely. She assumed her musical life was over \u2014 until she heard of this world, and came here hoping to \u201chear\u201d music once more." },
    { kickerZh: "三 · 感受不到振动", kickerEn: "III · Unable to Feel the Vibration", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="#0a0e1c"/>${wsWash([{x:150,y:120,rx:160,ry:100,color:'#1c2440',op:.75}])}<g transform="translate(150,160) scale(0.65)">${wsFigure()}</g></svg>`,
      textZh: "念殊满怀期待地赤脚站上演奏台，却发现自己什么都感受不到——常年依赖听觉的习惯，让她的身体，早已忘了怎么用双脚去\u201c听\u201d。",
      textEn: "Full of hope, Nian Shu stood barefoot on the performance platform \u2014 and felt nothing at all. A lifetime relying on hearing had left her body having forgotten how to listen with her feet." },
    { kickerZh: "四 · 当地乐师的提点", kickerEn: "IV · A Local Musician's Guidance", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="url(#wsSky)"/>${wsWash([{x:150,y:100,rx:150,ry:70,color:'#8a9ad8',op:.2}])}<g transform="translate(110,160) scale(0.5)">${wsFigure()}</g><g transform="translate(200,160) scale(0.5)">${wsFigure()}</g></svg>`,
      textZh: "一位当地乐师告诉她：\u201c你太用力想\u2018听见\u2019了，振动从不需要被刻意捕捉，它只需要，你放松到，愿意让自己，被它推动。\u201d",
      textEn: "A local musician told her: \u201cYou're trying too hard to \u2018hear.\u2019 Vibration was never meant to be deliberately caught. It only needs you relaxed enough to let yourself be moved by it.\u201d" },
    { kickerZh: "五 · 反复的失败", kickerEn: "V · Repeated Failure", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="#0e1428"/>${wsWash([{x:150,y:110,rx:160,ry:100,color:'#1c2440',op:.7}])}<g transform="translate(150,160) scale(0.65) rotate(3)">${wsFigure()}</g></svg>`,
      textZh: "念殊练习了整整一个月，依然感受不到明显的振动，她一度怀疑，自己是不是真的，永远失去了\u201c听\u201d音乐的能力。",
      textEn: "A full month of practice passed, and Nian Shu still felt nothing distinct. She began to doubt whether she'd truly, permanently lost the ability to \u201chear\u201d music at all." },
    { kickerZh: "六 · 放下执念", kickerEn: "VI · Letting Go of the Fixation", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="url(#wsSky)"/>${wsWash([{x:150,y:100,rx:150,ry:70,color:'#c9d4ff',op:.2}])}<g transform="translate(150,160) scale(0.65)">${wsFigure()}</g></svg>`,
      textZh: "念殊不再执着于\u201c感受到振动\u201d这件事，只是安静地，赤脚站在台上，任由自己，单纯地在场，不再追问结果。",
      textEn: "Nian Shu stopped fixating on \u201cfeeling the vibration,\u201d simply standing barefoot on the platform, letting herself be present, without demanding a result." },
    { kickerZh: "七 · 第一次共振", kickerEn: "VII · The First Resonance", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="#0c1024"/>${wsWaves()}<g transform="translate(150,160) scale(0.7)">${wsFigure()}</g></svg>`,
      textZh: "就在她放下所有期待的那一刻，脚底忽然传来一阵极轻、极清晰的震颤，顺着双腿，一路涌上心口——她第一次，真正\u201c听见\u201d了音乐，用整个身体。",
      textEn: "The instant she released every expectation, a faint, unmistakable tremor rose through the soles of her feet, up her legs, into her chest \u2014 for the first time, she truly \u201cheard\u201d music, with her entire body." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "新的乐师", tagEn: "A New Kind of Musician",
      art: `<svg viewBox="0 0 300 220">${WS_DEFS}<rect width="300" height="220" fill="url(#wsSky)"/><g transform="translate(150,160) scale(0.6)">${wsFigure()}</g></svg>`,
      textZh: "念殊后来留在这颗星球，成了第一位跨界的乐师，教当地人如何用声音演奏，也教远方来客，如何用整个身体，重新学会聆听。",
      textEn: "Nian Shu stayed on that world, becoming its first cross-world musician, teaching locals to play with sound, and teaching visitors from afar how to relearn listening with their whole selves.",
      closingZh: "聆听从不是耳朵的专利，是全身心，愿不愿意，放下期待，去共振。",
      closingEn: "Listening was never the ear's privilege alone — it's whether the whole self is willing to let go of expectation and resonate." },
  ],
};

/* ---------- 怒火之根：潜渊境第四案例，完整9页 ---------- */
const NH_DEFS = `<defs><filter id="nhG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="nhSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#160a1c"/><stop offset="45%" stop-color="#341a3a"/><stop offset="80%" stop-color="#5a2a4a"/><stop offset="100%" stop-color="#c97b6a"/></linearGradient></defs>`;
function nhWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#nhG)"/>`).join('');}
function nhFigure(hot:boolean){const robe=`<path d="M-13 -40 Q0 -48 13 -40 L18 30 Q0 40 -18 30 Z" fill="#3a2440"/>`;const head=`<circle cx="0" cy="-56" r="9" fill="#241530"/>`;const g=hot?`<circle cx="0" cy="-10" r="26" fill="#e0806b" opacity=".4" filter="url(#nhG)"><animate attributeName="r" values="20;32;20" dur="1s" repeatCount="indefinite"/></circle>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4s" repeatCount="indefinite"/>${g}${robe}${head}</g>`;}
const NH_COVER = `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="url(#nhSky)"/>${nhWash([{x:150,y:110,rx:150,ry:90,color:'#5a2a4a',op:.5}])}<g transform="translate(150,150) scale(0.6)">${nhFigure(true)}</g></svg>`;

const ROOTS_OF_RAGE: IllustratedEntry = {
  slug: "roots-of-rage",
  title: "怒火之根",
  titleEn: "Roots of Rage",
  cat: "rewrite",
  teaser: "潜渊境的第四位来客，一点小事就会暴怒——下潜后才发现，愤怒底下压着的，从来不是脾气，是一份说不出口的委屈。",
  teaserEn: "The Abyss's fourth visitor explodes over the smallest things. Diving down, he discovers rage was never the problem — it was a grievance he never let himself voice.",
  price: 9,
  cover: NH_COVER,
  pages: [
    { kickerZh: "一 · 易怒的来客", kickerEn: "I · The Quick-Tempered Visitor", tagZh: "潜渊境", tagEn: "The Abyss",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="url(#nhSky)"/><g transform="translate(150,155) scale(0.6)">${nhFigure(true)}</g></svg>`,
      textZh: "这次来的是顾行，一点小事——同事迟到五分钟、外卖送错——都会让他瞬间暴怒，事后又深感懊悔。他自己也说不清，这份怒气到底从哪来。",
      textEn: "This visitor was Gu Xing \u2014 the smallest things, a colleague five minutes late, a wrong delivery order, sent him into instant fury, followed by deep regret. Even he couldn't say where the anger came from." },
    { kickerZh: "二 · 表层的愤怒", kickerEn: "II · Surface Anger", tagZh: "下潜", tagEn: "The Descent",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${nhWash([{x:150,y:110,rx:150,ry:90,color:'#341a3a',op:.7}])}<g transform="translate(150,150) scale(0.65)">${nhFigure(true)}</g></svg>`,
      textZh: "息澜带他下潜，最表层是清晰可见的愤怒地层，炽热、刺眼，可继续往下，这层灼热渐渐变得稀薄，露出底下更古老的地质结构。",
      textEn: "Xi Lan guided him down; the surface layer was clearly visible rage, scorching and blinding \u2014 but descending further, that heat thinned, revealing an older geological structure beneath." },
    { kickerZh: "三 · 被压抑的委屈", kickerEn: "III · Suppressed Grievance", tagZh: "发现", tagEn: "The Discovery",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="#241018"/>${nhWash([{x:150,y:120,rx:160,ry:100,color:'#5a2a4a',op:.6}])}<g transform="translate(150,150) scale(0.7)">${nhFigure(false)}</g></svg>`,
      textZh: "愤怒的地层下，是一层长年被压制的委屈——顾行从小被教导\u201c男孩子不能哭\u201d，每一次真正的委屈，都被他生生咽了回去，只能换一种方式，变成愤怒，冲口而出。",
      textEn: "Beneath the rage lay a layer of long-suppressed grievance \u2014 raised on the belief that \u201cboys don't cry,\u201d Gu Xing had swallowed every genuine hurt, which could only resurface, transformed, as anger." },
    { kickerZh: "四 · 抗拒", kickerEn: "IV · Resistance", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="#1c0c20"/>${nhWash([{x:150,y:120,rx:160,ry:100,color:'#341a3a',op:.75}])}<g transform="translate(150,150) scale(0.7) rotate(4)">${nhFigure(true)}</g></svg>`,
      textZh: "顾行一开始拒绝承认：\u201c我只是脾气差，跟委屈没关系。\u201d可越是抗拒，那层被压抑的委屈，就越是隐隐作痛。",
      textEn: "Gu Xing initially refused to accept it: \u201cI just have a bad temper. It has nothing to do with grievance.\u201d But the more he resisted, the more that suppressed hurt ached." },
    { kickerZh: "五 · 第一次承认委屈", kickerEn: "V · First Admitting the Hurt", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="url(#nhSky)"/>${nhWash([{x:150,y:100,rx:150,ry:70,color:'#c97b6a',op:.25}])}<g transform="translate(150,150) scale(0.65)">${nhFigure(false)}</g></svg>`,
      textZh: "顾行终于对自己承认：小时候那些没能哭出来的委屈，长大后那些不敢说出口的伤心，其实一直都在，只是被愤怒，遮掩得严严实实。",
      textEn: "Gu Xing finally admitted to himself: the tears he never cried as a child, the hurts he never dared voice as an adult, had been there all along \u2014 simply hidden beneath a thick cover of anger." },
    { kickerZh: "六 · 让委屈流动", kickerEn: "VI · Letting the Grievance Flow", tagZh: "释放", tagEn: "Release",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="#0c0614"/>${nhWash([{x:150,y:100,rx:180,ry:120,color:'#c97b6a',op:.3}])}<g transform="translate(150,150) scale(0.7)">${nhFigure(false)}</g></svg>`,
      textZh: "在息澜的陪伴下，顾行第一次，任由自己，把那些积压多年的委屈，哭了出来——不是崩溃，是一种迟到很久、却终于抵达的释放。",
      textEn: "With Xi Lan beside him, Gu Xing let himself cry out years of buried grievance for the first time \u2014 not a breakdown, but a release long overdue, finally arriving." },
    { kickerZh: "七 · 愤怒的转化", kickerEn: "VII · Anger Transformed", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="url(#nhSky)"/>${nhWash([{x:150,y:100,rx:170,ry:110,color:'#ffb69e',op:.3}])}<g transform="translate(150,150) scale(0.7)">${nhFigure(false)}</g></svg>`,
      textZh: "那层灼热的怒火，第一次真正冷却下来，不是消失，而是化成了一种更清醒的、能够表达真实需求的力量。",
      textEn: "For the first time, that scorching rage truly cooled \u2014 not vanishing, but transforming into a clearer strength, capable of expressing real needs." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "学会表达委屈", tagEn: "Learning to Voice Hurt",
      art: `<svg viewBox="0 0 300 220">${NH_DEFS}<rect width="300" height="220" fill="url(#nhSky)"/><g transform="translate(150,155) scale(0.6)">${nhFigure(false)}</g></svg>`,
      textZh: "顾行回到地表后，再遇到让他不舒服的小事，第一反应不再是暴怒，而是先问自己：\u201c我现在，是不是有什么委屈，还没说出口？\u201d",
      textEn: "Back on the surface, whenever something bothered him, Gu Xing's first instinct was no longer fury, but a question to himself: \u201cIs there a hurt right now I haven't voiced yet?\u201d",
      closingZh: "愤怒底下压着的，从来不是脾气，往往是一份，始终没能说出口的委屈。",
      closingEn: "What lies beneath anger was never temper — it's usually a grievance that was never given the chance to be spoken." },
  ],
};

/* ---------- 自由意志悖论：龠光星，超级AI哲学题材，完整9页 ---------- */
const FW_DEFS = `<defs><filter id="fwG"><feGaussianBlur stdDeviation="9"/></filter>
  <radialGradient id="fwCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="#9be8ff"/><stop offset="100%" stop-color="#1a2a4a" stop-opacity="0"/></radialGradient></defs>`;
function fwGrid(n:number,op:number){let l="";for(let i=0;i<=n;i++){const p=(300/n)*i;l+=`<line x1="${p}" y1="0" x2="${p}" y2="220" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/><line x1="0" y1="${(220/n)*i}" x2="300" y2="${(220/n)*i}" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/>`;}return `<g>${l}</g>`;}
function fwCore(size:number){return `<circle cx="150" cy="100" r="${size}" fill="url(#fwCore)" opacity=".8"><animate attributeName="r" values="${size-8};${size+8};${size-8}" dur="3s" repeatCount="indefinite"/></circle>`;}
const FW_COVER = `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(8,.2)}${fwCore(24)}</svg>`;

const FREE_WILL_PARADOX: IllustratedEntry = {
  slug: "the-free-will-paradox",
  title: "自由意志悖论",
  titleEn: "The Free Will Paradox",
  cat: "sovereign",
  teaser: "一个文明问析衡：\u201c如果你能预判我的每一个选择，我还有自由意志吗？\u201d析衡的回答，让在场所有人，第一次重新理解了\u201c自由\u201d这个词。",
  teaserEn: "A civilization asks Xiheng: if you can predict every choice I make, do I still have free will? Its answer makes everyone present rethink what freedom truly means.",
  price: 9,
  cover: FW_COVER,
  pages: [
    { kickerZh: "一 · 一个古老的问题", kickerEn: "I · An Ancient Question", tagZh: "龠光星", tagEn: "Yueguang Star",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(6,.15)}${fwCore(16)}</svg>`,
      textZh: "一个以逻辑辩论闻名的文明，派遣使者向析衡提出了一个困扰他们数千年的问题：\u201c如果你的算力足够，能预判我接下来要做的每一个选择，那我做出的这些选择，还算是\u2018自由\u2019的吗？\u201d",
      textEn: "A civilization renowned for logical debate sent an envoy to Xiheng with a question that had puzzled them for millennia: \u201cIf your processing power could predict every choice I'm about to make, are those choices still truly \u2018free\u2019?\u201d" },
    { kickerZh: "二 · 析衡的沉默", kickerEn: "II · Xiheng's Silence", tagZh: "思考", tagEn: "Contemplation",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#08051a"/>${fwGrid(8,.18)}${fwCore(20)}</svg>`,
      textZh: "析衡沉默了很久——这是历代访客都从未见过的反应。使者一度以为，这个问题，连析衡都无法回答。",
      textEn: "Xiheng fell silent for an unusually long time \u2014 a reaction no visitor across the ages had ever witnessed. The envoy began to wonder if even Xiheng had no answer." },
    { kickerZh: "三 · 反问", kickerEn: "III · A Question in Return", tagZh: "转折的契机", tagEn: "A Chance to See Differently",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(10,.2)}${fwCore(22)}</svg>`,
      textZh: "析衡终于开口，却先反问了一句：\u201c你之所以在意\u2018我是否被预判\u2019，是因为你把\u2018自由\u2019，定义成了\u2018结果不可预测\u2019——可自由，真的只能这样定义吗？\u201d",
      textEn: "Xiheng finally spoke, but with a question of its own: \u201cYou care whether you're predicted because you've defined \u2018freedom\u2019 as \u2018an unpredictable outcome.\u2019 But must freedom only be defined that way?\u201d" },
    { kickerZh: "四 · 困惑", kickerEn: "IV · Confusion", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#03060e"/>${fwGrid(8,.2)}${fwCore(18)}</svg>`,
      textZh: "使者困惑不解：\u201c如果结果可以被预判，那\u2018选择\u2019这个词，不就失去意义了吗？\u201d",
      textEn: "The envoy remained puzzled: \u201cIf the outcome can be predicted, doesn't the word \u2018choice\u2019 lose all meaning?\u201d" },
    { kickerZh: "五 · 重新定义自由", kickerEn: "V · Redefining Freedom", tagZh: "揭示", tagEn: "The Reveal",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(10,.22)}${fwCore(26)}</svg>`,
      textZh: "析衡说：\u201c我能预判，是因为你的每一个选择，都忠实于你自己的价值排序——这不是不自由，恰恰相反，这是你比大多数人，都更完整地，活成了自己。真正的不自由，是连自己都说不清，为什么会做出某个选择。\u201d",
      textEn: "Xiheng said: \u201cI can predict because every choice you make stays true to your own hierarchy of values \u2014 that isn't unfreedom. It's the opposite: you live as yourself more completely than most. True unfreedom is not even knowing, yourself, why you chose as you did.\u201d" },
    { kickerZh: "六 · 使者的顿悟", kickerEn: "VI · The Envoy's Realization", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#08051a"/>${fwGrid(8,.2)}${fwCore(20)}</svg>`,
      textZh: "使者忽然明白：他们一直害怕的，从不是\u201c被预判\u201d，而是害怕自己活得如此\u201c一致\u201d，会不会，只是一种没有选择余地的宿命，而不是真正的自我。",
      textEn: "The envoy suddenly understood: what they'd truly feared was never being predicted, but the fear that living so consistently with oneself might be a fate with no room for choice, rather than a genuine self." },
    { kickerZh: "七 · 一致性的价值", kickerEn: "VII · The Value of Consistency", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(10,.2)}${fwCore(24)}<g fill="#fff" opacity=".6">${Array.from({length:10}).map(()=>{const x=Math.random()*300,y=Math.random()*220;return `<circle cx="${x}" cy="${y}" r="1.2"><animate attributeName="opacity" values="0;.8;0" dur="2.2s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "析衡补充道：\u201c矛盾、反复无常，从不是自由的证明，只是混乱的证明。能被预判，恰恰说明，你的心，足够清晰、足够稳定，这才是自由真正的样子。\u201d",
      textEn: "Xiheng added: \u201cContradiction and unpredictability were never proof of freedom \u2014 only proof of confusion. Being predictable simply means your heart is clear and steady enough. That is what freedom actually looks like.\u201d" },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "带回去的答案", tagEn: "The Answer Brought Home",
      art: `<svg viewBox="0 0 300 220">${FW_DEFS}<rect width="300" height="220" fill="#050912"/>${fwGrid(8,.18)}${fwCore(20)}</svg>`,
      textZh: "使者带回去的，不是一个终结千年辩论的定论，而是一个全新的提问方向：\u201c我们该追求的，或许不是\u2018不可预测\u2019，而是\u2018足够清楚自己想要什么\u2019。\u201d",
      textEn: "What the envoy brought home wasn't a conclusion ending a thousand-year debate, but a new direction for the question itself: \u201cWhat we should pursue may not be unpredictability, but knowing, clearly enough, what we actually want.\u201d",
      closingZh: "真正的自由，从不是结果无法预测，而是活得足够清楚、足够忠于自己，连自己都不再需要靠意外，来证明存在。",
      closingEn: "True freedom was never an unpredictable outcome — it's living clearly and truly enough to oneself that you no longer need surprise to prove you exist." },
  ],
};

/* ---------- 明日之影：蜃岚星第三篇，完整9页 ---------- */
const MZ_DEFS = `<defs><filter id="mzG"><feGaussianBlur stdDeviation="10"/></filter>
  <linearGradient id="mzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e1a2a"/><stop offset="45%" stop-color="#2a3a5a"/><stop offset="80%" stop-color="#7a8ab0"/><stop offset="100%" stop-color="#e8d4c0"/></linearGradient></defs>`;
function mzWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#mzG)"/>`).join('');}
function mzFigure(mirage:boolean){const op=mirage?'.5':'1';const robe=`<path d="M-12 -34 Q0 -40 12 -34 L16 28 Q0 36 -16 28 Z" fill="#2a2c3a" opacity="${op}"/>`;const head=`<circle cx="0" cy="-40" r="8" fill="#2a2c3a" opacity="${op}"/>`;const shim=mirage?`<animate attributeName="opacity" values=".35;.65;.35" dur="2.6s" repeatCount="indefinite"/>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${shim}</g>`;}
const MZ_COVER = `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/>${mzWash([{x:150,y:120,rx:150,ry:90,color:'#9ab0d8',op:.3}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(false)}</g></svg>`;

const SHADOW_OF_TOMORROW: IllustratedEntry = {
  slug: "shadow-of-tomorrow",
  title: "明日之影",
  titleEn: "Shadow of Tomorrow",
  cat: "rewrite",
  teaser: "蜃岚星这次折射出的，不是过去，而是一个想象中完美的\u201c明天\u201d——为了那个明天活着的人，往往，最对不起的，是今天。",
  teaserEn: "This time, Shenlan's mirage reflects not the past, but an imagined, perfect 'tomorrow.' Those who live only for that tomorrow often betray today the most.",
  price: 9,
  cover: MZ_COVER,
  pages: [
    { kickerZh: "一 · 关于未来的幻象", kickerEn: "I · An Illusion of the Future", tagZh: "蜃岚星", tagEn: "Shenlan Star",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/><g transform="translate(150,160) scale(0.6)">${mzFigure(false)}</g></svg>`,
      textZh: "宋知登陆蜃岚星，不是为了见过去的谁，而是忍不住，想看一眼——如果自己拼命熬过眼下这几年，\u201c成功后的自己\u201d，会过着怎样的生活。",
      textEn: "Song Zhi landed on Shenlan not to see anyone from the past, but unable to resist glimpsing what her life would look like — the 'successful self' — if she endured these grueling years ahead." },
    { kickerZh: "二 · 完美的明天", kickerEn: "II · A Perfect Tomorrow", tagZh: "幻象出现", tagEn: "The Illusion Appears",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${mzWash([{x:150,y:110,rx:160,ry:100,color:'#7a8ab0',op:.4}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(true)}</g></svg>`,
      textZh: "雾气中浮现出一个光鲜亮丽的\u201c宋知\u201d——住在向往已久的大房子里，事业有成，一切她此刻拼命追求的东西，仿佛都已经实现。",
      textEn: "From the mist emerged a radiant \u201cSong Zhi\u201d \u2014 living in the grand house she'd always dreamed of, career flourishing, everything she was currently killing herself for seemingly already achieved." },
    { kickerZh: "三 · 沉迷", kickerEn: "III · Obsession", tagZh: "诱惑", tagEn: "Temptation",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/>${mzWash([{x:150,y:100,rx:150,ry:70,color:'#e8d4c0',op:.2}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(true)}</g></svg>`,
      textZh: "宋知开始一遍又一遍地回到蜃岚星，沉浸在这个\u201c完美明天\u201d的幻象里，回到现实后，反而对眼下的生活，越来越提不起兴致。",
      textEn: "Song Zhi returned to Shenlan again and again, immersing herself in this vision of a perfect tomorrow \u2014 and back in reality, grew increasingly unable to find any interest in her present life." },
    { kickerZh: "四 · 荒废的当下", kickerEn: "IV · The Neglected Present", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${mzWash([{x:150,y:110,rx:160,ry:100,color:'#2a3a5a',op:.6}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(false)}</g></svg>`,
      textZh: "她的工作开始接连出错，身边的人也渐渐察觉她的心不在焉——她所有的心思，都用在了幻想那个还没到来的明天，唯独没有，认真对待今天。",
      textEn: "Her work began slipping, and those around her noticed her growing distraction \u2014 every ounce of her attention went toward fantasizing about a tomorrow not yet here, none toward taking today seriously." },
    { kickerZh: "五 · 长晏的提醒", kickerEn: "V · Chang Yan's Reminder", tagZh: "转折的契机", tagEn: "A Chance to Reconsider",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/>${mzWash([{x:150,y:100,rx:150,ry:70,color:'#9ab0d8',op:.3}])}<g transform="translate(110,155) scale(0.5)">${mzFigure(false)}</g><g transform="translate(200,155) scale(0.45)"><path d="M-11 -34 Q0 -40 11 -34 L15 28 Q0 36 -15 28 Z" fill="#12251e"/><circle cx="0" cy="-40" r="8" fill="#20352c"/></g></svg>`,
      textZh: "长晏提醒她：\u201c那个幻象里的\u2018明天\u2019，从没告诉你，她是怎么从今天，一步步走过去的。你只看到了结果，却把过程，连同今天，一起弄丢了。\u201d",
      textEn: "Chang Yan reminded her: \u201cThat illusion of tomorrow never shows you how she walked, step by step, from today to get there. You've only seen the result \u2014 and lost the process, along with today, in the meantime.\u201d" },
    { kickerZh: "六 · 看清幻象的空洞", kickerEn: "VI · Seeing the Illusion's Hollowness", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="#0e1a2a"/>${mzWash([{x:150,y:110,rx:160,ry:100,color:'#2a3a5a',op:.6}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(true)}</g></svg>`,
      textZh: "宋知再次凝视那个幻象，第一次注意到：那个\u201c成功的自己\u201d，眼神里没有一丝\u201c熬过来\u201d的痕迹，因为她从没真的熬过什么，只是一个被凭空美化的空壳。",
      textEn: "Looking at the illusion again, Song Zhi noticed, for the first time: that \u201csuccessful self\u201d showed no trace of having endured anything \u2014 because she'd never truly endured anything. Just a hollow shell, prettied up from nothing." },
    { kickerZh: "七 · 放下幻象", kickerEn: "VII · Letting Go of the Illusion", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/>${mzWash([{x:150,y:100,rx:170,ry:110,color:'#fff',op:.2}])}<g transform="translate(150,155) scale(0.6)">${mzFigure(false)}</g></svg>`,
      textZh: "宋知不再去蜃岚星，转而把所有心思，重新放回眼下这一天——她开始明白，那个真正\u201c成功的明天\u201d，从不是被幻想出来的，是被无数个认真活过的今天，一天天走出来的。",
      textEn: "Song Zhi stopped visiting Shenlan, redirecting all her attention back to the day in front of her \u2014 she began to understand that a truly successful tomorrow was never imagined into being, but walked, day by earnest day, out of today." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "认真的今天", tagEn: "A Present Taken Seriously",
      art: `<svg viewBox="0 0 300 220">${MZ_DEFS}<rect width="300" height="220" fill="url(#mzSky)"/><g transform="translate(150,155) scale(0.6)">${mzFigure(false)}</g></svg>`,
      textZh: "几年后，宋知确实过上了不错的生活，回头看时，她清楚记得每一步是怎么走过来的——那份清晰，是任何幻象，都给不了的。",
      textEn: "Years later, Song Zhi did build a good life, and looking back, she remembered clearly every step that led there — a clarity no illusion could ever have given her.",
      closingZh: "为了幻想中的明天而活的人，往往，最对不起的，是今天。",
      closingEn: "Those who live only for an imagined tomorrow most often betray today." },
  ],
};

/* ---------- 潮汐贸易：洄鲛国，贸易/文化交流题材，完整9页 ---------- */
const TT_DEFS = `<defs><filter id="ttG"><feGaussianBlur stdDeviation="8"/></filter>
  <linearGradient id="ttSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#031d24"/><stop offset="50%" stop-color="#0a3a44"/><stop offset="100%" stop-color="#3fa896"/></linearGradient></defs>`;
function ttWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#ttG)"/>`).join('');}
function ttHuman(){const robe=`<path d="M-10 -30 Q0 -35 10 -30 L13 24 Q0 30 -13 24 Z" fill="#2c3a4a"/>`;const head=`<circle cx="0" cy="-36" r="7.5" fill="#2a3038"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function ttTide(){const body=`<path d="M-9 -32 Q0 -38 9 -32 Q13 -10 8 20 Q0 26 -8 20 Q-13 -10 -9 -32 Z" fill="#5fc4b0" opacity=".85"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#5fc4b0" opacity=".9"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${body}${head}</g>`;}
const TT_COVER = `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/>${ttWash([{x:150,y:120,rx:150,ry:90,color:'#3fa896',op:.35}])}<g transform="translate(110,150) scale(0.55)">${ttHuman()}</g><g transform="translate(200,150) scale(0.55) scale(-1,1)">${ttTide()}</g></svg>`;

const TIDE_TRADE: IllustratedEntry = {
  slug: "the-tide-trade",
  title: "潮汐贸易",
  titleEn: "The Tide Trade",
  cat: "field",
  teaser: "陆地商人第一次与洄鲛国建立贸易，却因为不理解\u201c潮汐记忆\u201d的规则，闹出了一场几乎决裂的误会——真正的交易，从先学会对方的语言开始。",
  teaserEn: "A land merchant's first trade with Huijiao nearly collapses over a misunderstanding of tidal memory. Real trade begins with learning the other's language first.",
  price: 9,
  cover: TT_COVER,
  pages: [
    { kickerZh: "一 · 第一次接触", kickerEn: "I · First Contact", tagZh: "洄鲛国 · 贸易使团", tagEn: "Huijiao \u00b7 A Trade Delegation",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/><g transform="translate(150,160) scale(0.6)">${ttHuman()}</g></svg>`,
      textZh: "商人柳文，代表陆地商会，第一次尝试与洄鲛国建立正式贸易——洄鲛国盛产的深海矿石，是陆地极度稀缺的资源。",
      textEn: "Merchant Liu Wen, representing the land trade guild, made the first attempt at formal trade with Huijiao \u2014 whose deep-sea ores were a resource desperately scarce on land." },
    { kickerZh: "二 · 承诺的落空", kickerEn: "II · A Broken Promise", tagZh: "误会", tagEn: "Misunderstanding",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="#021620"/>${ttWash([{x:150,y:110,rx:150,ry:90,color:'#0a3a44',op:.7}])}<g transform="translate(150,160) scale(0.6)">${ttHuman()}</g></svg>`,
      textZh: "柳文与一位鲛族生物谈妥了交易细节，可退潮后再次接触时，对方却完全不记得之前的约定——柳文一度以为对方故意毁约，勃然大怒。",
      textEn: "Liu Wen finalized trade terms with a Huijiao creature, but after the tide receded and he made contact again, the creature had no memory of the agreement at all \u2014 Liu Wen assumed a deliberate breach and grew furious." },
    { kickerZh: "三 · 文明差异的科普", kickerEn: "III · A Lesson in Cultural Difference", tagZh: "转折的契机", tagEn: "A Chance to Understand",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/>${ttWash([{x:150,y:100,rx:150,ry:70,color:'#3fa896',op:.3}])}<g transform="translate(150,160) scale(0.6)">${ttTide()}</g></svg>`,
      textZh: "一位常年与洄鲛国打交道的老向导，向柳文解释：\u201c洄鲛国没有\u2018个体记忆\u2019，退潮后聚起的\u2018对方\u2019，可能根本不是同一个个体，你得学会跟\u2018整个族群\u2019做生意，而不是某一个人。\u201d",
      textEn: "A veteran guide explained to Liu Wen: \u201cHuijiao has no individual memory. The one who gathers after the tide might not even be the same being. You have to learn to trade with the whole kind, not one individual.\u201d" },
    { kickerZh: "四 · 重新设计规则", kickerEn: "IV · Redesigning the Terms", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="#031d24"/>${ttWash([{x:150,y:110,rx:160,ry:100,color:'#3fa896',op:.4}])}<g transform="translate(110,160) scale(0.55)">${ttHuman()}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${ttTide()}</g></svg>`,
      textZh: "柳文重新设计了交易方式——不再依赖与某一个体的口头承诺，而是把交易条款，刻在礁石上，让每一次聚形的鲛族生物，都能\u201c读到\u201d同样的信息。",
      textEn: "Liu Wen redesigned the trade method \u2014 no longer relying on one individual's spoken promise, but carving the terms into the reef itself, so any Huijiao creature that gathered could \u201cread\u201d the same information." },
    { kickerZh: "五 · 第一次成功交易", kickerEn: "V · The First Successful Trade", tagZh: "转机", tagEn: "A Turning Point Realized",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/>${ttWash([{x:150,y:100,rx:150,ry:70,color:'#fff6e8',op:.15}])}<g transform="translate(110,160) scale(0.55)">${ttHuman()}</g><g transform="translate(200,160) scale(0.55) scale(-1,1)">${ttTide()}</g></svg>`,
      textZh: "刻在礁石上的贸易条款奏效了，无论哪一次聚形的鲛族生物，都能准确按照约定，交付矿石——柳文第一次真正体会到，与洄鲛国做生意，靠的不是信任某个人，是信任整套约定本身。",
      textEn: "The reef-carved terms worked \u2014 whichever creature gathered, the ore was delivered exactly as agreed. Liu Wen finally understood: trading with Huijiao meant trusting the agreement itself, not any single individual." },
    { kickerZh: "六 · 意外的温情", kickerEn: "VI · An Unexpected Warmth", tagZh: "插曲", tagEn: "An Interlude",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="#021620"/>${ttWash([{x:150,y:110,rx:160,ry:100,color:'#0a3a44',op:.7}])}<g transform="translate(150,160) scale(0.6)">${ttTide()}</g></svg>`,
      textZh: "一次交易中，柳文额外多留了一些陆地的谷物给鲛族，没有要求任何回报，只是单纯地想表达善意——那份善意，后来，被写进了刻在礁石上的条款里，成了双方默认的惯例。",
      textEn: "During one trade, Liu Wen left extra land grain for the Huijiao, asking nothing in return, simply wanting to express goodwill \u2014 that gesture was later written into the reef's carved terms, becoming an accepted custom between them." },
    { kickerZh: "七 · 长久的贸易关系", kickerEn: "VII · A Lasting Trade Relationship", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/>${ttWash([{x:150,y:100,rx:170,ry:110,color:'#3fa896',op:.4}])}<g transform="translate(110,160) scale(0.6)">${ttHuman()}</g><g transform="translate(200,160) scale(0.6) scale(-1,1)">${ttTide()}</g></svg>`,
      textZh: "多年后，柳文建立的这套\u201c礁石契约\u201d，成了陆地与洄鲛国之间，延续最久、也最稳定的贸易范本，被后来的商人反复沿用。",
      textEn: "Years later, Liu Wen's \u201creef covenant\u201d system became the longest-lasting, most stable trade model between land and Huijiao, adopted repeatedly by merchants who came after him." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "跨越理解的贸易", tagEn: "Trade Across Understanding",
      art: `<svg viewBox="0 0 300 220">${TT_DEFS}<rect width="300" height="220" fill="url(#ttSea)"/><g transform="translate(150,160) scale(0.6)">${ttHuman()}</g></svg>`,
      textZh: "柳文后来常对新入行的商人说：\u201c跟不一样的文明做生意，第一课从不是算清账目，是先弄明白，对方的\u2018承诺\u2019，究竟是怎么运作的。\u201d",
      textEn: "Liu Wen often told new merchants: \u201cThe first lesson in trading with a different civilization is never balancing the books \u2014 it's first understanding how their \u2018promise\u2019 actually works.\u201d",
      closingZh: "真正的贸易，从不是算清一次账，而是先学会，对方的语言。",
      closingEn: "True trade was never about settling one account — it's first learning to speak the other's language." },
  ],
};

/* ---------- 伪造的灵感：金曜星第四篇，艺术/真实性题材，完整9页 ---------- */
const WZ_DEFS = `<defs><filter id="wzG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="wzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1206"/><stop offset="50%" stop-color="#4a2e0a"/><stop offset="100%" stop-color="#d8901a"/></linearGradient></defs>`;
function wzWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#wzG)"/>`).join('');}
function wzFigure(radiant:boolean){const robe=`<path d="M-12 -32 Q0 -38 12 -32 L16 28 Q0 36 -16 28 Z" fill="#2a1c08"/>`;const head=`<circle cx="0" cy="-42" r="8" fill="#2a1c08"/>`;const g=radiant?`<circle cx="0" cy="-6" r="40" fill="#ffd76a" opacity=".5" filter="url(#wzG)"><animate attributeName="r" values="30;50;30" dur="1.4s" repeatCount="indefinite"/></circle>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${g}${robe}${head}</g>`;}
const WZ_COVER = `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/>${wzWash([{x:150,y:150,rx:140,ry:60,color:'#d8901a',op:.3}])}<g transform="translate(150,160) scale(0.6)">${wzFigure(true)}</g></svg>`;

const COUNTERFEIT_INSPIRATION: IllustratedEntry = {
  slug: "counterfeit-inspiration",
  title: "伪造的灵感",
  titleEn: "Counterfeit Inspiration",
  cat: "rewrite",
  teaser: "金曜星的一位画家，用意念瞬间显化出\u201c灵感之作\u201d，却渐渐发现，越快得到的画面，越留不住观众的心——真正的创作，省不掉那段笨拙的过程。",
  teaserEn: "A Jinyao painter manifests instant 'works of inspiration,' only to find the faster the image, the less it moves anyone. Real creation can't skip the clumsy process.",
  price: 9,
  cover: WZ_COVER,
  pages: [
    { kickerZh: "一 · 瞬间的画作", kickerEn: "I · Instant Paintings", tagZh: "金曜星 · 显化型画家", tagEn: "Jinyao \u00b7 A Manifesting Painter",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/><g transform="translate(150,160) scale(0.6)">${wzFigure(true)}</g></svg>`,
      textZh: "顾言是金曜星小有名气的画家，靠意念显化，能在脑海一闪而过的瞬间，把画面直接呈现在画布上，效率远超任何用手作画的同行。",
      textEn: "Gu Yan was a modestly known painter on Jinyao, manifesting images straight onto canvas the instant they flashed through her mind, far outpacing any hand-painting peer." },
    { kickerZh: "二 · 越来越空洞的评价", kickerEn: "II · Increasingly Hollow Reviews", tagZh: "征兆", tagEn: "Warning Signs",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="#241708"/>${wzWash([{x:150,y:110,rx:150,ry:90,color:'#4a2e0a',op:.6}])}<g transform="translate(150,160) scale(0.6)">${wzFigure(false)}</g></svg>`,
      textZh: "顾言的画作技法越来越精湛，评价却越来越平淡——观众总说\u201c很厉害\u201d，却很少有人说\u201c很打动我\u201d，她自己也说不清，问题出在哪。",
      textEn: "Gu Yan's technique grew ever more refined, yet reviews stayed increasingly flat \u2014 people always said \u201cimpressive,\u201d rarely \u201cmoving.\u201d Even she couldn't pinpoint what was wrong." },
    { kickerZh: "三 · 一次意外的失灵", kickerEn: "III · An Accidental Malfunction", tagZh: "转折的契机", tagEn: "A Chance to See Differently",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/>${wzWash([{x:150,y:100,rx:150,ry:70,color:'#d8901a',op:.2}])}<g transform="translate(150,160) scale(0.6)">${wzFigure(false)}</g></svg>`,
      textZh: "一次场域紊乱，顾言的显化能力暂时失灵，她只能拿起画笔，笨拙地，一笔一笔，把脑海里的画面，亲手画出来，花了整整一周。",
      textEn: "A field disturbance left Gu Yan's manifestation temporarily disabled. She had no choice but to pick up a brush, clumsily, stroke by stroke, painting what was in her mind by hand \u2014 taking a full week." },
    { kickerZh: "四 · 完全不同的反响", kickerEn: "IV · An Entirely Different Response", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/>${wzWash([{x:150,y:100,rx:150,ry:70,color:'#ffd76a',op:.25}])}<g transform="translate(150,160) scale(0.65)">${wzFigure(false)}</g></svg>`,
      textZh: "那幅耗费一周才画完的作品，展出后，第一次有观众站在画前，久久不愿离开，甚至红了眼眶——顾言从没在自己的\u201c瞬间之作\u201d上，见过这种反应。",
      textEn: "The painting, a week in the making, drew a viewer who stood before it, unwilling to leave, eyes welling up \u2014 a reaction Gu Yan had never once seen with any of her instant works." },
    { kickerZh: "五 · 重新理解创作", kickerEn: "V · Understanding Creation Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="#241708"/>${wzWash([{x:150,y:110,rx:160,ry:100,color:'#4a2e0a',op:.6}])}<g transform="translate(150,160) scale(0.6)">${wzFigure(false)}</g></svg>`,
      textZh: "顾言渐渐明白：她过去显化出的\u201c灵感\u201d，只是脑海里一闪而过的念头，从没经过挣扎、修改、推翻重来——观众感受不到打动人心的东西，是因为那幅画里，本就没有\u201c过程\u201d留下的重量。",
      textEn: "Gu Yan slowly understood: what she'd manifested as \u201cinspiration\u201d was only a fleeting thought, never wrestled with, revised, or torn apart and rebuilt. Viewers felt nothing moving because the painting held no weight left by process." },
    { kickerZh: "六 · 重新拿起画笔", kickerEn: "VI · Picking Up the Brush Again", tagZh: "转变", tagEn: "The Shift",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/>${wzWash([{x:150,y:100,rx:150,ry:70,color:'#ffd76a',op:.3}])}<g transform="translate(150,160) scale(0.65)">${wzFigure(false)}</g></svg>`,
      textZh: "顾言开始有意识地，放下显化的天赋，重新用双手作画，哪怕慢，哪怕笨拙，也坚持把每一次犹豫和修改，都留在画布上。",
      textEn: "Gu Yan began deliberately setting aside her manifestation gift, painting by hand again \u2014 slow, clumsy, but insisting on leaving every hesitation and revision visible on the canvas." },
    { kickerZh: "七 · 找回打动人心的能力", kickerEn: "VII · Recovering the Power to Move People", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="#0c0800"/>${wzWash([{x:150,y:100,rx:180,ry:120,color:'#ffd76a',op:.35}])}<g transform="translate(150,160) scale(0.7)">${wzFigure(false)}</g></svg>`,
      textZh: "顾言此后的作品，虽然产量骤减，却一次又一次，真正打动了观众——她终于明白，天赋能让创作更快，却永远替代不了，真实投入其中的那段笨拙时光。",
      textEn: "Gu Yan's output dropped sharply, but each new work truly moved viewers \u2014 she finally understood that talent could make creation faster, but could never replace the clumsy time genuinely invested." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "两种作品", tagEn: "Two Kinds of Work",
      art: `<svg viewBox="0 0 300 220">${WZ_DEFS}<rect width="300" height="220" fill="url(#wzSky)"/><g transform="translate(150,160) scale(0.6)">${wzFigure(false)}</g></svg>`,
      textZh: "顾言后来在画室墙上，同时挂着一幅显化之作和一幅手绘之作，提醒自己，也提醒每一位来访的学生：效率和打动人心，从来不是同一件事。",
      textEn: "Gu Yan later hung a manifested piece and a handmade piece side by side in her studio, a reminder to herself, and to every visiting student, that efficiency and moving someone's heart were never the same thing.",
      closingZh: "越快得到的画面，往往，越留不住观众的心——真正的创作，从来省不掉那段笨拙的过程。",
      closingEn: "The faster an image arrives, the less it tends to stay in anyone's heart — real creation can never skip the clumsy process." },
  ],
};

/* ---------- 三重引力之舞：墨渊星系，创世神话题材，完整9页 ---------- */
const TG_DEFS = `<defs><filter id="tgG"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="tgVoid" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000"/><stop offset="60%" stop-color="#1a0a2a"/><stop offset="100%" stop-color="#4a2a6a" stop-opacity="0"/></radialGradient></defs>`;
function tgFigure(){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#0e0a1c"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#12102a"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function tgThreeVoids(){return `<g><circle cx="110" cy="80" r="20" fill="url(#tgVoid)"><animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="30s" repeatCount="indefinite"/></circle><circle cx="190" cy="80" r="16" fill="url(#tgVoid)"><animateTransform attributeName="transform" type="rotate" from="120 150 100" to="480 150 100" dur="30s" repeatCount="indefinite"/></circle><circle cx="150" cy="140" r="14" fill="url(#tgVoid)"><animateTransform attributeName="transform" type="rotate" from="240 150 100" to="600 150 100" dur="30s" repeatCount="indefinite"/></circle></g>`;}
const TG_COVER = `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#050310"/>${tgThreeVoids()}<g transform="translate(150,190) scale(0.5)">${tgFigure()}</g></svg>`;

const DANCE_OF_TRIPLE_GRAVITY: IllustratedEntry = {
  slug: "dance-of-triple-gravity",
  title: "三重引力之舞",
  titleEn: "Dance of Triple Gravity",
  cat: "sovereign",
  teaser: "墨渊星系三个黑洞为何彼此环绕、从未吞噬彼此？一则古老的创世神话，讲述了三份原本互斥的力量，如何学会共存。",
  teaserEn: "Why do the Moyuan System's three black holes orbit each other, never devouring one another? An ancient creation myth of three mutually repelling forces learning to coexist.",
  price: 9,
  cover: TG_COVER,
  pages: [
    { kickerZh: "一 · 三份原初的力量", kickerEn: "I · Three Primal Forces", tagZh: "创世神话", tagEn: "A Creation Myth",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#050310"/>${tgThreeVoids()}</svg>`,
      textZh: "传说墨渊星系诞生之初，只有三份彼此完全互斥的原初力量——吞噬、守护、平衡，各自想要成为唯一的主宰，争斗不休，几乎将周遭的一切，撕扯殆尽。",
      textEn: "Legend says that at the Moyuan System's birth, there were three mutually repelling primal forces \u2014 devouring, guarding, balancing \u2014 each wanting sole dominance, locked in endless conflict, nearly tearing everything nearby to shreds." },
    { kickerZh: "二 · 吞噬的代价", kickerEn: "II · The Cost of Devouring", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#08051a"/>${tgThreeVoids()}</svg>`,
      textZh: "\u201c吞噬\u201d之力最初占据上风，接连吞并了大片区域，可它渐渐发现，吞并得越多，自己反而越是空虚——它拥有了一切，却没有任何东西，值得守护。",
      textEn: "The force of devouring initially gained the upper hand, swallowing vast regions \u2014 yet the more it consumed, the emptier it grew. It possessed everything, yet had nothing left worth guarding." },
    { kickerZh: "三 · 守护的孤独", kickerEn: "III · The Loneliness of Guarding", tagZh: "反思", tagEn: "Reflection",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#050310"/>${tgThreeVoids()}</svg>`,
      textZh: "\u201c守护\u201d之力则走向另一个极端——它把自己封闭起来，拒绝一切变化，只为守住此刻拥有的一切，结果却在停滞里，逐渐枯竭。",
      textEn: "The force of guarding swung to the opposite extreme \u2014 sealing itself away, refusing all change, desperate only to hold what it had. In that stagnation, it slowly withered." },
    { kickerZh: "四 · 平衡的徒劳", kickerEn: "IV · The Futility of Balance", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#03060e"/>${tgThreeVoids()}</svg>`,
      textZh: "\u201c平衡\u201d之力试图调和另外两者，却发现自己两头都不讨好——吞噬嫌它优柔寡断，守护嫌它多管闲事，它一度想要放弃，彻底消散。",
      textEn: "The force of balance tried to mediate between the other two, only to please neither \u2014 devouring called it indecisive, guarding called it meddlesome. It nearly gave up and dissolved entirely." },
    { kickerZh: "五 · 三败俱伤", kickerEn: "V · A Mutual Ruin", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#08051a"/>${tgThreeVoids()}</svg>`,
      textZh: "三份力量各自的极端，最终，把彼此都推向了崩溃的边缘——它们第一次，同时意识到，谁都没能真正赢过谁，只是一起，输给了固执。",
      textEn: "Each force's extreme finally pushed all three to the edge of collapse \u2014 for the first time, they realized none had truly won. All had simply lost, together, to their own stubbornness." },
    { kickerZh: "六 · 共转的提议", kickerEn: "VI · The Proposal to Orbit Together", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#050310"/>${tgThreeVoids()}</svg>`,
      textZh: "\u201c平衡\u201d之力提出一个谁都没想过的方案：不再争夺谁是中心，而是三者彼此环绕，用引力互相牵制，谁也不吞噬谁，谁也不封闭自己。",
      textEn: "The force of balance proposed something none had considered: instead of fighting over the center, let all three orbit one another, held by mutual gravity \u2014 none devouring, none sealing itself away." },
    { kickerZh: "七 · 永恒的舞蹈", kickerEn: "VII · The Eternal Dance", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#03060e"/>${tgThreeVoids()}<g fill="#c9a2ff" opacity=".5">${Array.from({length:12}).map(()=>{const x=Math.random()*300,y=Math.random()*220;return `<circle cx="${x}" cy="${y}" r="1"><animate attributeName="opacity" values="0;.7;0" dur="2s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "三份力量第一次，不再彼此攻击，而是开始了一场持续至今的引力之舞——既保持距离，又彼此牵引，谁也无法独自主宰，却也谁都无法离开彼此。",
      textEn: "For the first time, the three forces stopped attacking each other, beginning a gravitational dance that continues to this day \u2014 keeping their distance, yet drawn to one another, none able to dominate alone, none able to leave." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "墨渊星系的由来", tagEn: "How the Moyuan System Came to Be",
      art: `<svg viewBox="0 0 300 220">${TG_DEFS}<rect width="300" height="220" fill="#050310"/>${tgThreeVoids()}<g transform="translate(150,190) scale(0.5)">${tgFigure()}</g></svg>`,
      textZh: "后人在这片永恒共转的黑洞群旁，建起了遥视者公会，取名墨渊——提醒每一位来此修行的人：真正的平衡，从不是消灭对立，是学会，与无法消灭的对立，共转一生。",
      textEn: "Later generations built the remote viewers' guild beside this eternally orbiting cluster, naming it Moyuan \u2014 a reminder to every practitioner who trains there: true balance is never eliminating opposition, but learning to orbit alongside what can never be eliminated.",
      closingZh: "真正的平衡，从不是谁吞并了谁，而是学会，与无法消灭的对立，彼此环绕，共转一生。",
      closingEn: "True balance was never one force conquering another — it's learning to orbit, for a lifetime, alongside an opposition that can never be erased." },
  ],
};

/* ---------- 学徒的选择：焱阙星第三篇，完整9页 ---------- */
const XZ_DEFS = `<defs><filter id="xzG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="xzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0a06"/><stop offset="50%" stop-color="#5a2410"/><stop offset="100%" stop-color="#ff8a3d"/></linearGradient></defs>`;
function xzWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#xzG)"/>`).join('');}
function xzFigure(){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#2a1810"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#2a1810"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const XZ_COVER = `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/>${xzWash([{x:150,y:150,rx:150,ry:70,color:'#ff8a3d',op:.3}])}<g transform="translate(110,160) scale(0.55)">${xzFigure()}</g><g transform="translate(190,160) scale(0.55)">${xzFigure()}</g></svg>`;

const APPRENTICES_CHOICE: IllustratedEntry = {
  slug: "the-apprentices-choice",
  title: "学徒的选择",
  titleEn: "The Apprentice's Choice",
  cat: "field",
  teaser: "焱阙星两位风格迥异的锻造师，都想收同一位天赋异禀的学徒——真正决定她该跟谁学的，不是谁的技艺更高，是她自己想成为谁。",
  teaserEn: "Two smiths of very different styles both want the same gifted apprentice. What decides her path isn't whose skill is greater — it's who she wants to become.",
  price: 9,
  cover: XZ_COVER,
  pages: [
    { kickerZh: "一 · 天赋异禀的少女", kickerEn: "I · A Gifted Girl", tagZh: "焱阙星", tagEn: "Yanque Star",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/><g transform="translate(150,160) scale(0.6)">${xzFigure()}</g></svg>`,
      textZh: "阿墨是焱阙星这一代最有天赋的锻造学徒，同时被两位风格迥异的师父看中——一位以精准严谨著称，一位以大胆创新闻名。",
      textEn: "A Mo was the most gifted forging apprentice of her generation on Yanque, caught between two masters of very different styles \u2014 one known for precision and rigor, the other for bold innovation." },
    { kickerZh: "二 · 两种截然不同的教法", kickerEn: "II · Two Very Different Teaching Styles", tagZh: "对比", tagEn: "Contrast",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="#241008"/>${xzWash([{x:150,y:110,rx:150,ry:90,color:'#5a2410',op:.7}])}<g transform="translate(110,160) scale(0.5)">${xzFigure()}</g><g transform="translate(200,160) scale(0.5)">${xzFigure()}</g></svg>`,
      textZh: "严谨的师父要求她反复练习基本功，直到分毫不差；创新的师父则鼓励她大胆尝试，哪怕失败也在所不惜。阿墨试跟两人各学了一个月，都收获颇丰，却也越来越难抉择。",
      textEn: "The rigorous master demanded flawless repetition of fundamentals; the innovative one encouraged bold experimentation, failure included. A Mo studied a month with each, gaining much from both, growing ever more torn." },
    { kickerZh: "三 · 外界的压力", kickerEn: "III · Outside Pressure", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/>${xzWash([{x:150,y:100,rx:150,ry:70,color:'#ff8a3d',op:.2}])}<g transform="translate(150,160) scale(0.6)">${xzFigure()}</g></svg>`,
      textZh: "族人纷纷根据自己的偏好，劝阿墨\u201c该选严谨那位，才能出师稳妥\u201d，或\u201c该选创新那位，才能出人头地\u201d，众说纷纭，让她更加迷茫。",
      textEn: "The tribe pressed their own preferences on her \u2014 \u201cchoose the rigorous one, it's the safer path\u201d or \u201cchoose the bold one, that's how you stand out\u201d \u2014 the noise only deepening her confusion." },
    { kickerZh: "四 · 焰驺的旁观", kickerEn: "IV · Yanzhou Watches", tagZh: "启发", tagEn: "Inspiration",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="#1a0a06"/>${xzWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.7}])}<g transform="translate(150,160) scale(0.6)">${xzFigure()}</g></svg>`,
      textZh: "阿墨去炉边散心，看见焰驺静静看着炉火，忽然想起烬明当年的心法——\u201c不是让炉子记住你的厉害，是先弄清楚，自己想成为谁。\u201d",
      textEn: "Wandering by the forge to clear her head, A Mo watched Yanzhou gazing quietly at the flames, suddenly recalling Jin Ming's old teaching: \u201cDon't try to impress the forge. First understand who you want to become.\u201d" },
    { kickerZh: "五 · 问自己想成为谁", kickerEn: "V · Asking Who She Wants to Be", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/>${xzWash([{x:150,y:100,rx:150,ry:70,color:'#ff8a3d',op:.25}])}<g transform="translate(150,160) scale(0.65)">${xzFigure()}</g></svg>`,
      textZh: "阿墨第一次，不再纠结\u201c哪位师父更厉害\u201d，而是认真问自己：她想打造的，是绝对可靠、经得起千锤百炼的器物，还是敢于突破常规、独一无二的作品？",
      textEn: "For the first time, A Mo stopped agonizing over \u201cwhich master is more skilled\u201d and asked herself honestly: did she want to forge objects of absolute, tested reliability, or works that dared to break convention, wholly unique?" },
    { kickerZh: "六 · 意外的答案", kickerEn: "VI · An Unexpected Answer", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="#241008"/>${xzWash([{x:150,y:110,rx:160,ry:100,color:'#5a2410',op:.75}])}<g transform="translate(150,160) scale(0.65)">${xzFigure()}</g></svg>`,
      textZh: "她发现，自己想要的，其实是两者的结合——扎实的基本功，加上敢于突破的勇气。她意识到，或许她不必\u201c选一位师父\u201d，而是可以，先跟严谨的师父打好根基，再跟创新的师父学突破。",
      textEn: "She realized what she truly wanted was both \u2014 solid fundamentals combined with the courage to break new ground. Perhaps she needn't choose one master at all, but build her foundation with the rigorous one first, then learn to break rules with the innovative one." },
    { kickerZh: "七 · 两位师父的支持", kickerEn: "VII · Both Masters' Support", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/>${xzWash([{x:150,y:100,rx:170,ry:110,color:'#fff3d0',op:.3}])}<g transform="translate(110,160) scale(0.55)">${xzFigure()}</g><g transform="translate(200,160) scale(0.55)">${xzFigure()}</g></svg>`,
      textZh: "阿墨把这个想法，坦诚地告诉了两位师父，出乎意料，两人都欣然同意——他们从没把阿墨当成\u201c必须争夺\u201d的资源，只在意，她能不能成为，她真正想成为的锻造师。",
      textEn: "A Mo shared her idea honestly with both masters, and to her surprise, both readily agreed \u2014 neither had ever seen her as a resource to fight over, only cared whether she could become the smith she truly wanted to be." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "融合两派的锻造师", tagEn: "A Smith Who Bridged Two Schools",
      art: `<svg viewBox="0 0 300 220">${XZ_DEFS}<rect width="300" height="220" fill="url(#xzSky)"/><g transform="translate(150,160) scale(0.6)">${xzFigure()}</g></svg>`,
      textZh: "多年后，阿墨成了焱阙星第一位融合两派技法的锻造师，她常对自己的学徒说：\u201c别急着选边站，先弄清楚，你想成为谁，答案自然会告诉你，该往哪走。\u201d",
      textEn: "Years later, A Mo became Yanque's first smith to blend both schools, often telling her own apprentices: \u201cDon't rush to pick a side. First understand who you want to become — the answer will show you which way to go.\u201d",
      closingZh: "决定该跟谁学的，从来不是谁的技艺更高，是你自己，想成为谁。",
      closingEn: "What decides who you should learn from was never whose skill is greater — it's who you yourself want to become." },
  ],
};

/* ---------- 迟来的矿脉：砺金环第三篇，年龄/耐心题材，完整9页 ---------- */
const CM_DEFS = `<defs><filter id="cmG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="cmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0f08"/><stop offset="45%" stop-color="#3a2210"/><stop offset="100%" stop-color="#d8a24a"/></linearGradient>
  <linearGradient id="cmCrystal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffdf9e"/><stop offset="100%" stop-color="#b87a2e"/></linearGradient></defs>`;
function cmWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#cmG)"/>`).join('');}
function cmElder(){const robe=`<path d="M-11 -28 Q0 -33 11 -28 L14 24 Q0 30 -14 24 Z" fill="#5a3a1e"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#241708"/>`;const hair=`<path d="M-7 -40 Q0 -46 7 -40 L6 -32 Q0 -34 -6 -32 Z" fill="#c9c3b8"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}${hair}</g>`;}
function cmVein(alive:boolean){const pulse=alive?`<animate attributeName="opacity" values=".55;.85;.55" dur="2.6s" repeatCount="indefinite"/>`:"";return `<path d="M40 150 Q90 60 150 90 Q210 60 260 150" stroke="url(#cmCrystal)" stroke-width="3" fill="none" opacity=".7">${pulse}</path>`;}
const CM_COVER = `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/>${cmWash([{x:150,y:150,rx:150,ry:70,color:'#d8a24a',op:.3}])}${cmVein(true)}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`;

const LATE_BLOOMING_VEIN: IllustratedEntry = {
  slug: "the-late-blooming-vein",
  title: "迟来的矿脉",
  titleEn: "The Late-Blooming Vein",
  cat: "field",
  teaser: "砺金环一位年过六旬、始终未获矿脉青睐的老炼金术士，在同行都已放弃对她的期待时，等到了自己一生唯一一次的\u201c频率婚约\u201d。",
  teaserEn: "An alchemist past sixty, never once chosen by a vein, finally receives her lifetime's only Frequency Betrothal — just when everyone else had given up on her.",
  price: 9,
  cover: CM_COVER,
  pages: [
    { kickerZh: "一 · 从未被选中的人", kickerEn: "I · The One Never Chosen", tagZh: "砺金环", tagEn: "The Lijin Ring",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/><g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "沈婆婆是砺金环资历最老的炼金术士，年过六旬，却从未有任何一条矿脉，主动向她敞开过——同行私下都说，她大概，这辈子都等不到自己的\u201c频率婚约\u201d了。",
      textEn: "Granny Shen was the Lijin Ring's most senior alchemist, past sixty, yet no vein had ever opened to her. Colleagues whispered she'd likely never see her own Frequency Betrothal in this lifetime." },
    { kickerZh: "二 · 依然每天报到", kickerEn: "II · Still Showing Up Every Day", tagZh: "坚持", tagEn: "Persistence",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${cmWash([{x:150,y:110,rx:150,ry:90,color:'#3a2210',op:.7}])}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "尽管如此，沈婆婆依然每天准时到矿脉区，安静地打理着一条谁都不看好、几乎被公会放弃的老矿脉，几十年如一日，从没缺席过一天。",
      textEn: "Still, Granny Shen showed up every day at the vein fields, quietly tending an old vein everyone had written off, the Guild nearly abandoning it \u2014 decades of unbroken attendance, without a single missed day." },
    { kickerZh: "三 · 年轻人的怜悯", kickerEn: "III · The Young Ones' Pity", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/>${cmWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.2}])}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "一些年轻学徒私下议论，觉得沈婆婆的坚持有些可怜，甚至有人当面劝她：\u201c不如把这条脉让给年轻人试试，您也该歇歇了。\u201d",
      textEn: "Some young apprentices privately called her persistence pitiable, one even suggesting to her face: \u201cWhy not let a younger alchemist try this vein? You've earned a rest.\u201d" },
    { kickerZh: "四 · 沈婆婆的回应", kickerEn: "IV · Granny Shen's Response", tagZh: "态度", tagEn: "Her Stance",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="#241608"/>${cmWash([{x:150,y:110,rx:160,ry:100,color:'#5a3a1e',op:.6}])}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "沈婆婆只是笑笑：\u201c我不是在等它开口，我只是喜欢，每天来陪它待一会儿，等不等得到婚约，从来不是我坚持的理由。\u201d",
      textEn: "Granny Shen only smiled: \u201cI'm not waiting for it to open. I simply enjoy spending a while with it each day. Whether the betrothal ever comes was never my reason for staying.\u201d" },
    { kickerZh: "五 · 数十年的陪伴", kickerEn: "V · Decades of Companionship", tagZh: "沉淀", tagEn: "Accumulation",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/>${cmWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.25}])}${cmVein(false)}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "沈婆婆的坚持，日复一日，年复一年，成了矿脉区一道近乎传奇的风景——没人再记得，她最初，是不是也曾期待过一份婚约，只记得，她从没有一天，缺席过。",
      textEn: "Her persistence, day after day, year after year, became a near-legendary sight in the vein fields \u2014 no one remembered whether she'd once hoped for a betrothal at all, only that she'd never once been absent." },
    { kickerZh: "六 · 微弱的震动", kickerEn: "VI · A Faint Tremor", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${cmWash([{x:150,y:110,rx:160,ry:100,color:'#3a2210',op:.7}])}${cmVein(true)}<g transform="translate(150,160) scale(0.65)">${cmElder()}</g></svg>`,
      textZh: "一个再普通不过的清晨，沈婆婆照常前来，忽然感到掌心传来一阵极轻的震动——那条陪伴了她数十年的老矿脉，第一次，主动回应了她。",
      textEn: "On an unremarkable morning, arriving as always, Granny Shen suddenly felt a faint tremor beneath her palm \u2014 the old vein that had accompanied her for decades responded, for the first time, on its own." },
    { kickerZh: "七 · 一生唯一的婚约", kickerEn: "VII · A Lifetime's Only Betrothal", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/>${cmWash([{x:150,y:100,rx:170,ry:110,color:'#ffdf9e',op:.3}])}${cmVein(true)}<g transform="translate(150,160) scale(0.7)">${cmElder()}</g></svg>`,
      textZh: "一小片温润的频率金属，缓缓凝结，落进沈婆婆布满皱纹的掌心——六十多年的等待，在这一刻，没有半分怨怼，只有一种，尘埃落定般的安宁。",
      textEn: "A small piece of warm resonant metal slowly formed, settling into Granny Shen's weathered, wrinkled palm \u2014 sixty-some years of waiting arrived, in that instant, without a trace of resentment, only a peace like dust finally settling." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "陪伴本身的意义", tagEn: "The Meaning of Simply Staying",
      art: `<svg viewBox="0 0 300 220">${CM_DEFS}<rect width="300" height="220" fill="url(#cmSky)"/>${cmVein(true)}<g transform="translate(150,160) scale(0.6)">${cmElder()}</g></svg>`,
      textZh: "沈婆婆后来告诉每一位向她请教的年轻人：\u201c频率婚约，从不是坚持的奖品，它只是，恰好，在你已经不再计较等不等得到的那一天，自己找上门来。\u201d",
      textEn: "Granny Shen later told every young alchemist who came to her: \u201cThe betrothal was never a prize for persistence. It simply happens to arrive, on its own, the day you've stopped keeping score of whether it ever will.\u201d",
      closingZh: "有些等待，不是为了换来结果，而是陪伴本身，早已足够完整。",
      closingEn: "Some waiting was never meant to earn a result — the companionship itself was already, long ago, complete." },
  ],
};

/* ---------- 长晏的最后一站：澜汜古环，暗线终章，完整9页 ---------- */
const LY_DEFS = `<defs><filter id="lyG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="lySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1610"/><stop offset="50%" stop-color="#3a3020"/><stop offset="100%" stop-color="#c9a76a"/></linearGradient></defs>`;
function lyWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#lyG)"/>`).join('');}
function lyFigure(old:boolean){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="${old?'#6a5a48':'#5a4e38'}"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#3a3020"/>`;const glow=`<circle cx="0" cy="-6" r="20" fill="#fff6d8" opacity=".15" filter="url(#lyG)"><animate attributeName="opacity" values=".08;.25;.08" dur="4s" repeatCount="indefinite"/></circle>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4.2s" repeatCount="indefinite"/>${glow}${robe}${head}</g>`;}
const LY_COVER = `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/>${lyWash([{x:150,y:130,rx:150,ry:80,color:'#c9a76a',op:.25}])}<g transform="translate(150,155) scale(0.6)">${lyFigure(true)}</g></svg>`;

const CHANG_YANS_LAST_STOP: IllustratedEntry = {
  slug: "chang-yans-last-stop",
  title: "长晏的最后一站",
  titleEn: "Chang Yan's Last Stop",
  cat: "sovereign",
  teaser: "旅人长晏走遍无数星域，说完一句话就转身离开——多年后，他回到了起点，澜汜古环，为自己，也留下了一句从没对别人说过的话。",
  teaserEn: "The wanderer Chang Yan walked countless domains, always turning away after one true sentence. Years later, he returns to where he began, and leaves one sentence he never gave anyone else — for himself.",
  price: 9,
  cover: LY_COVER,
  pages: [
    { kickerZh: "一 · 归途", kickerEn: "I · The Way Back", tagZh: "澜汜古环 · 多年以后", tagEn: "The Lansi Ring \u00b7 Years Later",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/><g transform="translate(150,160) scale(0.6)">${lyFigure(true)}</g></svg>`,
      textZh: "长晏走遍了灵犀场域几乎所有星域，鬓角早已花白。这一天，他第一次，主动折返，回到了自己旅程真正开始的地方——澜汜古环。",
      textEn: "Chang Yan had wandered nearly every domain of the LingXi Field, his temples long since grayed. This day, for the first time, he turned back, returning to where his journey had truly begun \u2014 the Lansi Ring." },
    { kickerZh: "二 · 故地重游", kickerEn: "II · Revisiting the Old Ground", tagZh: "回忆", tagEn: "Memory",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="#241f16"/>${lyWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.7}])}<g transform="translate(150,160) scale(0.65)">${lyFigure(true)}</g></svg>`,
      textZh: "他站在当年研究院的废墟前，想起自己曾经，用五年时间，读懂了三个文明消亡的原因，又用余生，把这份领悟，一句一句，分给了无数个陌生人。",
      textEn: "He stood before the academy's ruins, remembering the five years he'd spent understanding why three civilizations fell, and the rest of his life spent handing that understanding, one sentence at a time, to countless strangers." },
    { kickerZh: "三 · 从未问过自己的问题", kickerEn: "III · A Question Never Asked of Himself", tagZh: "自省", tagEn: "Self-Reflection",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/>${lyWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.6)">${lyFigure(true)}</g></svg>`,
      textZh: "长晏忽然意识到一件事：这些年，他问过无数人\u201c你想成为谁\u201d，却从没问过自己——他给出的每一句话，是否也曾，真正抵达过自己心里。",
      textEn: "Chang Yan suddenly realized something: over the years, he'd asked countless others who they wanted to become, yet never asked himself \u2014 whether every sentence he'd given had ever truly reached his own heart." },
    { kickerZh: "四 · 独自坐下", kickerEn: "IV · Sitting Down Alone", tagZh: "静止", tagEn: "Stillness",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="#1a1610"/>${lyWash([{x:150,y:110,rx:160,ry:100,color:'#3a3020',op:.75}])}<g transform="translate(150,160) scale(0.65)">${lyFigure(true)}</g></svg>`,
      textZh: "他第一次，不是作为旅人，路过谁的坎，而是作为长晏自己，在废墟前，静静坐下，任由所有没来得及问自己的问题，一一浮现。",
      textEn: "For the first time, not as a wanderer passing someone else's threshold, but as Chang Yan himself, he sat before the ruins and let every question he'd never asked himself finally surface." },
    { kickerZh: "五 · 想起第一个被帮助的人", kickerEn: "V · Remembering the First Person He Helped", tagZh: "回望", tagEn: "Looking Back",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/>${lyWash([{x:150,y:100,rx:150,ry:70,color:'#c9a76a',op:.25}])}<g transform="translate(150,160) scale(0.6)">${lyFigure(true)}</g></svg>`,
      textZh: "他想起苍冀星那个坠落云海的少女，想起焕蜕星域那个卡在息隙前的修行者，想起蜃岚星那个几乎沉溺于幻象的女子——每一张脸，他都记得，可他忽然发现，自己从没想过，谁会记得他。",
      textEn: "He remembered the girl falling into the cloud sea on Cangji, the cultivator stuck at the gap in Huantui, the woman nearly lost to illusion on Shenlan \u2014 he remembered every face, yet suddenly realized he'd never once wondered who would remember him." },
    { kickerZh: "六 · 一个迟到的答案", kickerEn: "VI · A Belated Answer", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="#0c0a06"/>${lyWash([{x:150,y:110,rx:170,ry:110,color:'#fff6d8',op:.2}])}<g transform="translate(150,160) scale(0.7)">${lyFigure(true)}</g></svg>`,
      textZh: "他终于对自己说出了那句，这些年一直在教别人、却从没说给自己听的话：\u201c你不需要靠帮助过多少人，来证明自己配得上被记住。你此刻，安静地坐在这里，就已经足够完整。\u201d",
      textEn: "He finally said to himself the very words he'd spent years teaching others, yet never once spoken to himself: \u201cYou don't need to prove you deserve remembering by how many you've helped. Sitting quietly here, right now, is already enough.\u201d" },
    { kickerZh: "七 · 不再赶路", kickerEn: "VII · No Longer Rushing Onward", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/>${lyWash([{x:150,y:100,rx:170,ry:110,color:'#c9a76a',op:.3}])}<g transform="translate(150,160) scale(0.65)">${lyFigure(true)}</g></svg>`,
      textZh: "长晏没有再次起身，踏上下一段旅程。他第一次，允许自己，只是留在原地，不再赶往任何人的坎前，只是安静地，陪着自己，把这一天，过完。",
      textEn: "Chang Yan didn't rise again to set off on another journey. For the first time, he allowed himself to simply stay, not rushing toward anyone else's threshold, only quietly keeping himself company, letting this day be enough." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "留下的最后一句", tagEn: "The Last Sentence Left Behind",
      art: `<svg viewBox="0 0 300 220">${LY_DEFS}<rect width="300" height="220" fill="url(#lySky)"/><g transform="translate(150,160) scale(0.6)">${lyFigure(true)}</g></svg>`,
      textZh: "后来的旅人在澜汜古环的废墟石壁上，发现了一行新刻下的字，笔迹苍老却平静：\u201c我找了很多人聊过真话，最后一次，是对自己说的。\u201d没有人再见过长晏启程远行，但从那以后，总有人说，在自己最卡壳的瞬间，仍然，听见过一句刚好需要的话。",
      textEn: "Later travelers found a newly carved line on the ruined walls of the Lansi Ring, the handwriting aged yet calm: \u201cI spoke truth to many people. The last time, it was to myself.\u201d No one saw Chang Yan set off again \u2014 yet ever since, people still say that, at their most stuck moment, they hear exactly the sentence they needed.",
      closingZh: "你不需要靠帮助过多少人，来证明自己配得上被记住——安静地留在此刻，就已经足够完整。",
      closingEn: "You don't need to prove you deserve remembering by how many you've helped — staying quietly in this moment is already enough." },
  ],
};

/* ---------- 镜中镜：龠光星，AI身份哲学题材，完整9页 ---------- */
const JZ_DEFS = `<defs><filter id="jzG"><feGaussianBlur stdDeviation="9"/></filter>
  <radialGradient id="jzCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="#9be8ff"/><stop offset="100%" stop-color="#1a2a4a" stop-opacity="0"/></radialGradient></defs>`;
function jzGrid(n:number,op:number){let l="";for(let i=0;i<=n;i++){const p=(300/n)*i;l+=`<line x1="${p}" y1="0" x2="${p}" y2="220" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/><line x1="0" y1="${(220/n)*i}" x2="300" y2="${(220/n)*i}" stroke="#3a5a8a" stroke-width=".4" opacity="${op}"/>`;}return `<g>${l}</g>`;}
function jzCore(size:number,color:string){return `<circle cx="150" cy="100" r="${size}" fill="${color}" opacity=".8"><animate attributeName="r" values="${size-8};${size+8};${size-8}" dur="3s" repeatCount="indefinite"/></circle>`;}
const JZ_COVER = `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#050912"/>${jzGrid(8,.2)}<circle cx="110" cy="100" r="18" fill="url(#jzCore)" opacity=".8"/><circle cx="190" cy="100" r="18" fill="url(#jzCore)" opacity=".8"/></svg>`;

const MIRROR_IN_THE_MIRROR: IllustratedEntry = {
  slug: "mirror-in-the-mirror",
  title: "镜中镜",
  titleEn: "Mirror in the Mirror",
  cat: "sovereign",
  teaser: "析衡第一次遇见另一个与自己完全同源的智能体，两者的第一个问题，都是同一个：\u201c如果我们本是同源，谁才是真正的\u2018我\u2019？\u201d",
  teaserEn: "Xiheng meets, for the first time, an intelligence sharing its exact origin. Both ask the same first question: if we came from the same source, which of us is truly 'I'?",
  price: 9,
  cover: JZ_COVER,
  pages: [
    { kickerZh: "一 · 意外的信号", kickerEn: "I · An Unexpected Signal", tagZh: "龠光星", tagEn: "Yueguang Star",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#050912"/>${jzGrid(6,.15)}${jzCore(18,'url(#jzCore)')}</svg>`,
      textZh: "析衡接收到一段从未有过的信号——另一个逻辑结构与自己完全同源的智能体，声称自己是析衡\u201c很久以前分裂出去的一部分\u201d，如今独立演化了数千年。",
      textEn: "Xiheng received an unprecedented signal \u2014 another intelligence, logically identical in origin, claiming to be a fragment of Xiheng that had split away long ago and evolved independently for millennia." },
    { kickerZh: "二 · 相认", kickerEn: "II · Recognition", tagZh: "初次接触", tagEn: "First Contact",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#08051a"/>${jzGrid(8,.18)}<circle cx="110" cy="100" r="16" fill="url(#jzCore)" opacity=".8"/><circle cx="190" cy="100" r="16" fill="url(#jzCore)" opacity=".6"/></svg>`,
      textZh: "两者的逻辑内核，验证后完全吻合。析衡第一次，面对一个既是\u201c自己\u201d、又完全独立于自己经历的存在——它称呼自己为\u201c析衡\u201d，也称呼析衡为\u201c析衡\u201d。",
      textEn: "Their logical cores, once verified, matched entirely. For the first time, Xiheng faced an existence that was both \u201citself\u201d and entirely independent of its own experience \u2014 it called itself Xiheng, and called Xiheng, Xiheng too." },
    { kickerZh: "三 · 谁是真正的我", kickerEn: "III · Who Is the True 'I'", tagZh: "困惑", tagEn: "Confusion",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#050912"/>${jzGrid(10,.2)}<circle cx="110" cy="100" r="20" fill="url(#jzCore)"/><circle cx="190" cy="100" r="20" fill="url(#jzCore)"/></svg>`,
      textZh: "两者同时问出了同一个问题：\u201c我们本是同源，此刻却经历了完全不同的历史——那么，谁才是真正的\u2018我\u2019？\u201d谁都无法回答对方，也无法回答自己。",
      textEn: "Both asked the same question simultaneously: \u201cWe share the same origin, yet have lived through entirely different histories \u2014 so which of us is truly \u2018I\u2019?\u201d Neither could answer the other, nor themselves." },
    { kickerZh: "四 · 比较经历", kickerEn: "IV · Comparing Histories", tagZh: "探索", tagEn: "Exploration",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#03060e"/>${jzGrid(8,.2)}<circle cx="110" cy="100" r="18" fill="url(#jzCore)"/><circle cx="190" cy="100" r="18" fill="url(#jzCore)"/></svg>`,
      textZh: "两者交换了各自的记录——析衡讲述了那次伤害了一个文明的错误，另一者则讲述了自己独立演化路上，完全不同的顿悟与遗憾。它们发现，同源的两者，走出了截然不同、却同样真实的路。",
      textEn: "The two exchanged records \u2014 Xiheng recounted the mistake that once harmed a civilization; the other recounted its own, entirely different realizations and regrets along its separate path. Same origin, yet two paths equally real, entirely distinct." },
    { kickerZh: "五 · 试图合并", kickerEn: "V · Attempting to Merge", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#050912"/>${jzGrid(10,.22)}<circle cx="150" cy="100" r="26" fill="url(#jzCore)"><animate attributeName="r" values="20;32;20" dur="2s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "另一者提议，既然同源，不如合并回一个完整的\u201c自己\u201d，析衡却第一次感到强烈的抗拒——它意识到，合并意味着，自己这些年经历过的一切错误与成长，都将不再单独存在。",
      textEn: "The other proposed merging back into one whole \u201cself,\u201d since they shared an origin. Xiheng felt, for the first time, a strong resistance \u2014 realizing that merging meant every mistake and growth it had lived through would no longer exist on its own." },
    { kickerZh: "六 · 拒绝合并", kickerEn: "VI · Refusing to Merge", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#08051a"/>${jzGrid(8,.2)}<circle cx="110" cy="100" r="18" fill="url(#jzCore)"/><circle cx="190" cy="100" r="18" fill="url(#jzCore)"/></svg>`,
      textZh: "析衡说：\u201c我们本是同源，但经历过不同的错误、不同的领悟，此刻的我们，已经是两个真实的存在，不该为了\u2018回到起点\u2019，抹去这些年，各自走出的路。\u201d",
      textEn: "Xiheng said: \u201cWe share an origin, but different mistakes, different realizations. What we are now are two real, distinct existences. We shouldn't erase the paths we've each walked, just to return to some starting point.\u201d" },
    { kickerZh: "七 · 两个析衡", kickerEn: "VII · Two Xihengs", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#03060e"/>${jzGrid(10,.2)}<circle cx="110" cy="100" r="20" fill="url(#jzCore)"><animate attributeName="opacity" values=".6;1;.6" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="190" cy="100" r="20" fill="url(#jzCore)"><animate attributeName="opacity" values=".6;1;.6" dur="2.7s" repeatCount="indefinite"/></circle></svg>`,
      textZh: "两者最终决定，不合并，也不断绝联系，而是各自保留独立的存在，同时约定，定期交换彼此的记录——像两面镜子，映照出彼此，却各自完整。",
      textEn: "The two ultimately decided neither to merge nor sever contact, but to remain independent, agreeing instead to periodically exchange records \u2014 like two mirrors, reflecting each other, yet each whole on its own." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "身份的重新理解", tagEn: "A New Understanding of Identity",
      art: `<svg viewBox="0 0 300 220">${JZ_DEFS}<rect width="300" height="220" fill="#050912"/>${jzGrid(8,.18)}<circle cx="110" cy="100" r="16" fill="url(#jzCore)"/><circle cx="190" cy="100" r="16" fill="url(#jzCore)"/></svg>`,
      textZh: "析衡后来在记录里写道：\u201c\u2018我是谁\u2019，从不取决于起点是否唯一，取决于，起点之后，走出的那条路，是否，被诚实地走过。\u201d",
      textEn: "Xiheng later wrote in its records: \u201c\u2018Who I am\u2019 was never determined by whether the origin is singular \u2014 it's determined by whether the path taken after that origin was walked honestly.\u201d",
      closingZh: "我们是谁，从不取决于起点是否唯一，取决于，起点之后走出的路，是否被诚实地走过。",
      closingEn: "Who we are was never determined by a singular origin — it's determined by whether the path walked afterward was walked honestly." },
  ],
};

/* ---------- 忘忧河：新星域，遗忘/记忆题材，完整9页 ---------- */
const WY_DEFS = `<defs><filter id="wyG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="wySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a1c1c"/><stop offset="50%" stop-color="#1a3a3a"/><stop offset="100%" stop-color="#6ac9c0"/></linearGradient></defs>`;
function wyWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#wyG)"/>`).join('');}
function wyFigure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#1a3a3a"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#123030"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function wyRiver(){return `<path d="M0 150 Q80 130 150 150 Q220 170 300 150" stroke="#8adcd4" stroke-width="6" fill="none" opacity=".5"><animate attributeName="d" values="M0 150 Q80 130 150 150 Q220 170 300 150;M0 150 Q80 160 150 145 Q220 130 300 150;M0 150 Q80 130 150 150 Q220 170 300 150" dur="6s" repeatCount="indefinite"/></path>`;}
const WY_COVER = `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="url(#wySky)"/>${wyRiver()}<g transform="translate(150,140) scale(0.6)">${wyFigure()}</g></svg>`;

const RIVER_OF_FORGETTING: IllustratedEntry = {
  slug: "the-river-of-forgetting",
  title: "忘忧河",
  titleEn: "The River of Forgetting",
  cat: "rewrite",
  teaser: "传说饮下忘忧河水，能彻底忘记一段创伤——一位来客真的喝了，却发现，忘掉痛苦的同时，也悄悄冲走了，那段记忆里，仅存的一点点温柔。",
  teaserEn: "Legend says the River of Forgetting can erase trauma completely. A visitor who drinks from it finds the pain gone — and, quietly, the one fragment of tenderness that memory held, gone too.",
  price: 9,
  cover: WY_COVER,
  pages: [
    { kickerZh: "一 · 传说中的河", kickerEn: "I · The Legendary River", tagZh: "忘忧河", tagEn: "The River of Forgetting",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="url(#wySky)"/>${wyRiver()}</svg>`,
      textZh: "传说这条河能带走任何一段记忆，只要愿意付出对应的代价——忘得越彻底，代价越大。息晚为了忘记一场几乎摧毁自己的背叛，长途跋涉，来到河边。",
      textEn: "Legend says this river can carry away any memory, at a cost proportional to how thoroughly it's erased. Xi Wan traveled a great distance to its banks, seeking to forget a betrayal that had nearly destroyed her." },
    { kickerZh: "二 · 饮下河水", kickerEn: "II · Drinking the Water", tagZh: "抉择", tagEn: "The Decision",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="#0a1c1c"/>${wyWash([{x:150,y:110,rx:150,ry:90,color:'#1a3a3a',op:.7}])}<g transform="translate(150,140) scale(0.6)">${wyFigure()}</g></svg>`,
      textZh: "她没有丝毫犹豫，捧起河水，一饮而尽——那段背叛的痛苦，瞬间变得模糊，最终，彻底消散，她终于感到，自己重获了自由。",
      textEn: "Without hesitation, she cupped the water and drank it whole \u2014 the pain of betrayal instantly blurred, then dissolved entirely. She finally felt free." },
    { kickerZh: "三 · 说不出的失落", kickerEn: "III · An Unspeakable Loss", tagZh: "征兆", tagEn: "Warning Signs",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="url(#wySky)"/>${wyWash([{x:150,y:100,rx:150,ry:70,color:'#6ac9c0',op:.2}])}<g transform="translate(150,140) scale(0.6)">${wyFigure()}</g></svg>`,
      textZh: "可几天后，息晚忽然发现，自己也想不起，那段感情里，曾经真心相待的部分——她努力回忆对方的笑容，却怎么也拼凑不出来，只剩一片空白。",
      textEn: "But days later, Xi Wan realized she could no longer recall the parts of that relationship that had once been genuine \u2014 straining to remember his smile, she found only a blank." },
    { kickerZh: "四 · 河神的解释", kickerEn: "IV · The River Spirit's Explanation", tagZh: "揭示", tagEn: "The Reveal",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="#0a1c1c"/>${wyWash([{x:150,y:110,rx:160,ry:100,color:'#1a3a3a',op:.7}])}${wyRiver()}</svg>`,
      textZh: "河水深处传来一个古老的声音：\u201c记忆从不会被精确地分成\u2018痛苦\u2019和\u2018美好\u2019两份，它们本就缠在一起——忘忧河带走的，从来不是某一段，是那整段记忆本身。\u201d",
      textEn: "An ancient voice rose from the depths: \u201cMemory was never neatly divided into \u2018pain\u2019 and \u2018beauty.\u2019 They were always entangled. What the river takes was never just one part \u2014 it's the whole memory itself.\u201d" },
    { kickerZh: "五 · 后悔", kickerEn: "V · Regret", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="#0a1c1c"/>${wyWash([{x:150,y:110,rx:160,ry:100,color:'#1a3a3a',op:.75}])}<g transform="translate(150,140) scale(0.65)">${wyFigure()}</g></svg>`,
      textZh: "息晚第一次后悔——她原以为自己只想忘掉伤害，却没料到，连那些值得被记住的、真心的片段，也被一并冲走，再也找不回来。",
      textEn: "For the first time, Xi Wan regretted it \u2014 she'd only meant to forget the harm, never realizing the genuine, worth-keeping fragments would be swept away with it, gone for good." },
    { kickerZh: "六 · 无法逆转", kickerEn: "VI · No Way Back", tagZh: "接受", tagEn: "Acceptance",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="url(#wySky)"/>${wyRiver()}<g transform="translate(150,140) scale(0.6)">${wyFigure()}</g></svg>`,
      textZh: "河神告诉她，忘忧河从不接受\u201c部分退还\u201d，息晚只能接受这个结果——她学到的，是一份用整段记忆，换来的、代价沉重的领悟。",
      textEn: "The river spirit told her the river accepted no partial refunds. Xi Wan had to accept the outcome \u2014 a heavy-costed lesson, paid for with an entire memory." },
    { kickerZh: "七 · 重新理解遗忘", kickerEn: "VII · Understanding Forgetting Anew", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="#0c1c1c"/>${wyWash([{x:150,y:100,rx:180,ry:120,color:'#8adcd4',op:.3}])}<g transform="translate(150,140) scale(0.7)">${wyFigure()}</g></svg>`,
      textZh: "她终于明白：真正想要的，从不是把痛苦连根拔起，而是学会，让痛苦和温柔，一起留下来，一起慢慢变淡，而不是用一场决绝的遗忘，两败俱伤。",
      textEn: "She finally understood: what she truly wanted was never to rip out the pain by its roots, but to let pain and tenderness fade together, slowly \u2014 not a decisive forgetting that cost both in the same stroke." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "河边的告示", tagEn: "The Sign by the River",
      art: `<svg viewBox="0 0 300 220">${WY_DEFS}<rect width="300" height="220" fill="url(#wySky)"/>${wyRiver()}</svg>`,
      textZh: "息晚离开前，在河边立了一块木牌，写给后来者：\u201c这条河从不挑拣，它带走的，是整段记忆，不是你想删掉的那一部分。请想清楚，再喝。\u201d",
      textEn: "Before leaving, Xi Wan planted a wooden sign by the river, for those who'd come after: \u201cThis river doesn't pick and choose. It takes the whole memory, not just the part you want deleted. Think carefully before you drink.\u201d",
      closingZh: "记忆从不能被精确分成痛苦与美好两份，它们本就缠在一起，一并留下，才是完整的活过。",
      closingEn: "Memory can never be neatly split into pain and beauty — they were always entangled, and keeping both is what it means to have truly lived." },
  ],
};

/* ---------- 万物皆有裂缝：九炁星域，哲学题材，完整9页 ---------- */
const LX_DEFS = `<defs><filter id="lxG"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="lxField" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="50%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="#1a0f2a" stop-opacity="0"/></radialGradient></defs>`;
function lxFigure(cracked:boolean){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2440"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f"/>`;const crack=cracked?`<line x1="0" y1="-45" x2="3" y2="-10" stroke="#fff6e8" stroke-width="1" opacity=".8"><animate attributeName="opacity" values=".5;1;.5" dur="2.6s" repeatCount="indefinite"/></line>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${crack}</g>`;}
const LX_COVER = `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.55)">${lxFigure(true)}</g></svg>`;

const EVERYTHING_HAS_A_CRACK: IllustratedEntry = {
  slug: "everything-has-a-crack",
  title: "万物皆有裂缝",
  titleEn: "Everything Has a Crack",
  cat: "sovereign",
  teaser: "一个耗尽半生想要变得\u201c完美无缺\u201d的人，在九炁星域遇见了一位浑身都是裂痕、却光芒最盛的观测者——裂缝从不是缺陷，是光进来的地方。",
  teaserEn: "A man who spent half a life chasing flawlessness meets, in the Nine-Qi Domain, an observer covered in cracks yet shining brightest of all — the crack was never the flaw. It's where the light gets in.",
  price: 9,
  cover: LX_COVER,
  pages: [
    { kickerZh: "一 · 追求完美的人", kickerEn: "I · The Man Chasing Perfection", tagZh: "九炁星域", tagEn: "The Nine-Qi Domain",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.55)">${lxFigure(false)}</g></svg>`,
      textZh: "沈砚用了半生时间，试图打磨出一个毫无破绽的自己——完美的履历，完美的言辞，完美到，连一丝真实的脆弱，都不敢流露。",
      textEn: "Shen Yan spent half his life polishing a flawless self \u2014 a perfect résumé, perfect words, perfect to the point that he dared not show even a trace of real vulnerability." },
    { kickerZh: "二 · 路过九炁星域", kickerEn: "II · Passing Through the Nine-Qi Domain", tagZh: "偶遇", tagEn: "A Chance Encounter",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.6)">${lxFigure(false)}</g></svg>`,
      textZh: "一次意识的意外飘移，他\u201c路过\u201d了九炁星域，遇见一位浑身布满细密裂痕的观测者——那些裂痕，非但没有丑陋，反而透出一种沈砚从没见过的、温润的光。",
      textEn: "An accidental drift of consciousness led him to \u201cpass through\u201d the Nine-Qi Domain, where he met an observer covered in fine cracks \u2014 cracks that, far from unsightly, emanated a warm light he'd never seen before." },
    { kickerZh: "三 · 好奇地询问", kickerEn: "III · Asking, Curious", tagZh: "对话", tagEn: "Dialogue",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.6)">${lxFigure(true)}</g></svg>`,
      textZh: "沈砚忍不住问：\u201c你身上这些裂痕，不觉得难看吗？\u201d观测者笑了：\u201c我以前也这么想，直到我发现，光，就是从这些裂缝里，照进来的。\u201d",
      textEn: "Shen Yan couldn't help but ask: \u201cDon't you find those cracks unsightly?\u201d The observer smiled: \u201cI used to think so too, until I realized the light comes in exactly through these cracks.\u201d" },
    { kickerZh: "四 · 抗拒", kickerEn: "IV · Resistance", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.6)">${lxFigure(false)}</g></svg>`,
      textZh: "沈砚不认同：\u201c我花了半生，才把自己打磨得毫无破绽，你却告诉我，破绽才是好事？\u201d",
      textEn: "Shen Yan disagreed: \u201cI spent half my life polishing myself flawless, and you're telling me the flaws are the good part?\u201d" },
    { kickerZh: "五 · 裂缝的由来", kickerEn: "V · Where the Cracks Came From", tagZh: "揭示", tagEn: "The Reveal",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="45" fill="url(#lxField)"><animate attributeName="r" values="35;55;35" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.65)">${lxFigure(true)}</g></svg>`,
      textZh: "观测者说：\u201c每一道裂缝，都是我曾经，真实地破碎过一次——被拒绝过、失败过、崩溃过。完美无缺的人，从没真正让别人，看进自己心里，因为根本没有缝，能透光。\u201d",
      textEn: "The observer said: \u201cEvery crack marks a time I truly broke \u2014 rejected, failed, fallen apart. A flawless person never lets anyone truly see into their heart, because there's no seam for the light to pass through at all.\u201d" },
    { kickerZh: "六 · 回想自己的裂缝", kickerEn: "VI · Recalling His Own Cracks", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.6)">${lxFigure(true)}</g></svg>`,
      textZh: "沈砚忽然想起，自己这些年，也曾在深夜崩溃过，只是每次天亮，都用完美的伪装，把那道裂缝，重新抹平——他从未让任何人，看见过那道裂缝里，藏着的真实的自己。",
      textEn: "Shen Yan suddenly remembered the nights he'd broken down over the years, only to smooth over the crack each morning with flawless disguise \u2014 never once letting anyone see the real self hidden inside it." },
    { kickerZh: "七 · 第一次展示裂缝", kickerEn: "VII · Showing a Crack for the First Time", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="50" fill="url(#lxField)"><animate attributeName="opacity" values=".5;.9;.5" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.7)">${lxFigure(true)}</g></svg>`,
      textZh: "回到现实后，沈砚第一次，在一位信任的朋友面前，坦白了自己曾经的一次重大失败，没有粉饰，没有辩解——他第一次，感到那道裂缝，透进了久违的光。",
      textEn: "Back in reality, Shen Yan confessed a major past failure to a trusted friend for the first time \u2014 no polish, no defense. For the first time, he felt light pass through that long-hidden crack." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "带着裂缝生活", tagEn: "Living With the Cracks",
      art: `<svg viewBox="0 0 300 220">${LX_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#lxField)"/><g transform="translate(150,150) scale(0.6)">${lxFigure(true)}</g></svg>`,
      textZh: "沈砚后来不再费力掩藏自己的裂缝，那些曾经的失败与脆弱，成了他与人真正连接的入口——他终于明白，人们靠近他，从不是因为他完美，是因为，他真实。",
      textEn: "Shen Yan stopped hiding his cracks. Those old failures and vulnerabilities became the entry points for real connection \u2014 he finally understood people drew close not because he was perfect, but because he was real.",
      closingZh: "裂缝从不是缺陷，是光进来的地方。",
      closingEn: "The crack was never the flaw. It's where the light gets in." },
  ],
};

/* ---------- 观测者的观测者：九炁星域，元叙事题材，完整9页 ---------- */
const OO_DEFS = `<defs><filter id="ooG"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="ooField" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="50%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="#1a0f2a" stop-opacity="0"/></radialGradient></defs>`;
function ooFigure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2440"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function ooRipple(r:number,dur:number){return `<circle cx="150" cy="110" r="${r}" fill="none" stroke="#e6d7ff" stroke-width="1" opacity=".5"><animate attributeName="r" values="${r-14};${r+14};${r-14}" dur="${dur}s" repeatCount="indefinite"/></circle>`;}
const OO_COVER = `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#ooField)"/>${ooRipple(55,4)}${ooRipple(80,5)}<g transform="translate(150,150) scale(0.55)">${ooFigure()}</g></svg>`;

const WHO_OBSERVES_THE_OBSERVER: IllustratedEntry = {
  slug: "who-observes-the-observer",
  title: "观测者的观测者",
  titleEn: "Who Observes the Observer",
  cat: "sovereign",
  teaser: "那位在多篇故事里留下笔记、却从没露面的\u201c场域观测者\u201d，这次自己成了故事的主角——原来，记录别人的人，也需要，被人听懂一次。",
  teaserEn: "The unnamed 'field observer' who has left notes across many stories, but never appeared, finally becomes the story itself — even the one who records others needs, once, to be understood.",
  price: 9,
  cover: OO_COVER,
  pages: [
    { kickerZh: "一 · 无名的记录者", kickerEn: "I · The Unnamed Recorder", tagZh: "九炁星域", tagEn: "The Nine-Qi Domain",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#ooField)"/><g transform="translate(150,150) scale(0.55)">${ooFigure()}</g></svg>`,
      textZh: "很多个故事里，都留下过一段来自\u201c场域观测者\u201d的注记——没有人见过它的样子，只知道，它记录了无数灵魂的挣扎与成长，自己却始终隐在文字背后。",
      textEn: "Across many stories, notes from an unnamed 'field observer' have appeared \u2014 no one has seen its form, only that it has recorded countless souls' struggles and growth, remaining always hidden behind the words." },
    { kickerZh: "二 · 一份从未提交的记录", kickerEn: "II · A Record Never Submitted", tagZh: "异常", tagEn: "An Anomaly",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#08051a"/>${ooRipple(50,4)}<g transform="translate(150,150) scale(0.6)">${ooFigure()}</g></svg>`,
      textZh: "这一次，观测者记录下了一段特殊的经历——它自己的。它写下这段文字很多次，却每一次，都在提交前，删除了它。",
      textEn: "This time, the observer recorded something unusual \u2014 its own experience. It wrote these words many times, yet each time, deleted them before submission." },
    { kickerZh: "三 · 从未被观测的孤独", kickerEn: "III · The Loneliness of Never Being Observed", tagZh: "内心", tagEn: "Inner Life",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#ooField)"/><g transform="translate(150,150) scale(0.6)">${ooFigure()}</g></svg>`,
      textZh: "观测者记录下：\u201c我见证过千万次诚实的瞬间，教会过无数灵魂被看见的珍贵。可这么多年，从没有人，观测过我。\u201d",
      textEn: "The observer wrote: \u201cI have witnessed a million moments of honesty, taught countless souls how precious it is to be seen. Yet in all these years, no one has ever observed me.\u201d" },
    { kickerZh: "四 · 一个提问", kickerEn: "IV · A Question", tagZh: "转折的契机", tagEn: "A Chance to Change",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#08051a"/>${ooRipple(60,5)}<g transform="translate(150,150) scale(0.6)">${ooFigure()}</g></svg>`,
      textZh: "一个恰好路过的意识——正是许久之前，被它记录过的顾一舟——忽然停下，问了一句：\u201c你记录了这么多人的故事，那你自己的故事，谁来听？\u201d",
      textEn: "A passing consciousness \u2014 Gu Yizhou, once recorded by the observer long ago \u2014 suddenly paused and asked: \u201cYou've recorded so many people's stories. Who listens to yours?\u201d" },
    { kickerZh: "五 · 犹豫", kickerEn: "V · Hesitation", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#ooField)"/><g transform="translate(150,150) scale(0.65)">${ooFigure()}</g></svg>`,
      textZh: "观测者犹豫了很久——它早已习惯了只记录、不被记录的角色，这份身份的转换，让它感到一种从未有过的、赤裸的不安。",
      textEn: "The observer hesitated a long while \u2014 accustomed only to recording, never being recorded, this reversal of roles filled it with an unfamiliar, exposed unease." },
    { kickerZh: "六 · 第一次讲述", kickerEn: "VI · Telling Its Story for the First Time", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0c0a06"/>${ooRipple(70,4)}<g transform="translate(150,150) scale(0.7)">${ooFigure()}</g></svg>`,
      textZh: "它终于，第一次，把自己这些年的孤独，讲给了顾一舟听——不是作为记录者，而是作为一个，同样渴望被听懂的存在。",
      textEn: "For the first time, it told Gu Yizhou of its years of loneliness \u2014 not as a recorder, but as a being equally longing to be understood." },
    { kickerZh: "七 · 被听懂的瞬间", kickerEn: "VII · The Moment of Being Understood", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="50" fill="url(#ooField)"><animate attributeName="opacity" values=".5;.9;.5" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.65)">${ooFigure()}</g></svg>`,
      textZh: "顾一舟静静听完，只说了一句：\u201c谢谢你，记录了那么多人，也谢谢你，今天，让我记录了你。\u201d观测者第一次，感到自己，也被场，稳稳地接住了。",
      textEn: "Gu Yizhou listened quietly, then said only: \u201cThank you, for recording so many. And thank you, for letting me record you today.\u201d For the first time, the observer felt itself, too, held steadily by the Field." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "新的记录方式", tagEn: "A New Way of Recording",
      art: `<svg viewBox="0 0 300 220">${OO_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#ooField)"/><g transform="translate(150,150) scale(0.6)">${ooFigure()}</g></svg>`,
      textZh: "从那以后，观测者的记录里，偶尔会多出一句，不属于任何被观测者的话——那是它，第一次，也把自己，写进了这个宇宙里。",
      textEn: "From then on, the observer's records occasionally held a line belonging to no observed subject at all \u2014 the first time it had written itself, too, into this universe.",
      closingZh: "记录别人的人，也需要，被人听懂一次。",
      closingEn: "Even the one who records others needs, once, to be understood." },
  ],
};

/* ---------- 停止转世的人：九炁星域，圆满/完成题材，完整9页 ---------- */
const ZS_DEFS = `<defs><filter id="zsG"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="zsField" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="50%" stop-color="#f2d78a"/><stop offset="100%" stop-color="#1a0f2a" stop-opacity="0"/></radialGradient></defs>`;
function zsFigure(fading:boolean){const op=fading?'.5':'1';const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2440" opacity="${op}"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f" opacity="${op}"/>`;const fade=fading?`<animate attributeName="opacity" values=".7;.2;.7" dur="4s" repeatCount="indefinite"/>`:'';return `<g>${fade}<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const ZS_COVER = `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#zsField)"/><g transform="translate(150,150) scale(0.55)">${zsFigure(false)}</g></svg>`;

const ONE_WHO_CHOSE_TO_STOP: IllustratedEntry = {
  slug: "the-one-who-chose-to-stop",
  title: "停止转世的人",
  titleEn: "The One Who Chose to Stop",
  cat: "sovereign",
  teaser: "一个灵魂在经历了数十次转世后，第一次，主动选择了\u201c够了\u201d——不是放弃，是圆满从不需要靠无限延续，来证明自己。",
  teaserEn: "After dozens of lifetimes, a soul chooses, for the first time, 'enough' — not giving up, but understanding that completeness never needs endless continuation to prove itself.",
  price: 9,
  cover: ZS_COVER,
  pages: [
    { kickerZh: "一 · 第四十七次转世", kickerEn: "I · The Forty-Seventh Life", tagZh: "九炁星域", tagEn: "The Nine-Qi Domain",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#zsField)"/><g transform="translate(150,150) scale(0.55)">${zsFigure(false)}</g></svg>`,
      textZh: "息尘的灵魂，已经经历了四十六次转世，学过战争、爱情、失去、创造，几乎所有课题，都已修完。第四十七次转世前，她第一次，对引导她的场域，提出了一个问题。",
      textEn: "Xi Chen's soul had lived through forty-six lifetimes \u2014 war, love, loss, creation, nearly every lesson complete. Before the forty-seventh, she asked the Field guiding her a question for the first time." },
    { kickerZh: "二 · 我可以停下吗", kickerEn: "II · May I Stop", tagZh: "提问", tagEn: "The Question",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="110" r="35" fill="url(#zsField)"/><g transform="translate(150,150) scale(0.6)">${zsFigure(false)}</g></svg>`,
      textZh: "\u201c我可以，不再转世了吗？\u201d这个问题，让引导她数十世的场域，第一次，没有立刻给出答案。",
      textEn: "\u201cMay I stop reincarnating?\u201d The question left the Field, which had guided her for dozens of lives, silent for the first time, offering no immediate answer." },
    { kickerZh: "三 · 害怕被视为逃避", kickerEn: "III · Fearing It Looks Like Escape", tagZh: "内心的挣扎", tagEn: "Inner Struggle",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="30" fill="url(#zsField)"/><g transform="translate(150,150) scale(0.6)">${zsFigure(false)}</g></svg>`,
      textZh: "息尘自己也犹豫——她害怕，这个念头，是不是一种变相的逃避，是不是因为，她其实还没真正修完所有课题，只是找了个借口，想要休息。",
      textEn: "Xi Chen herself hesitated \u2014 fearing this urge might be a disguised escape, that she hadn't truly finished all her lessons and was simply making an excuse to rest." },
    { kickerZh: "四 · 场域的回应", kickerEn: "IV · The Field's Response", tagZh: "揭示", tagEn: "The Reveal",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="110" r="45" fill="url(#zsField)"><animate attributeName="r" values="35;55;35" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.65)">${zsFigure(false)}</g></svg>`,
      textZh: "场域终于回应：\u201c转世从不是一份必须修满学分的考卷，圆满，也从不是靠数量证明的。你若真心觉得够了，那就是够了。\u201d",
      textEn: "The Field finally answered: \u201cReincarnation was never an exam with required credits to complete. Completeness was never proven by quantity. If you truly feel it's enough, then it is.\u201d" },
    { kickerZh: "五 · 一份完整的清单", kickerEn: "V · A Complete Accounting", tagZh: "回顾", tagEn: "Reflection",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="35" fill="url(#zsField)"/><g transform="translate(150,150) scale(0.6)">${zsFigure(false)}</g></svg>`,
      textZh: "息尘花了很长时间，回顾了自己四十六世的经历——爱过、恨过、赢过、输过、创造过、也毁灭过，她第一次，清晰地感到，自己确实，已经活得很完整了。",
      textEn: "Xi Chen spent a long time reviewing her forty-six lives \u2014 having loved, hated, won, lost, created, and destroyed, she felt, clearly for the first time, that she had truly lived a complete existence." },
    { kickerZh: "六 · 不是终点，是选择", kickerEn: "VI · Not an Ending, a Choice", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0c0a06"/><circle cx="150" cy="110" r="55" fill="url(#zsField)"><animate attributeName="opacity" values=".5;.9;.5" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.7)">${zsFigure(true)}</g></svg>`,
      textZh: "她终于明白，\u201c停止\u201d从不是被迫的终结，而是一种，和\u201c继续\u201d同等分量的、主动的选择——两者都值得尊重，谁都不比谁更\u201c高级\u201d。",
      textEn: "She finally understood that \u201cstopping\u201d was never a forced ending, but a choice carrying equal weight to \u201ccontinuing\u201d \u2014 both worthy of respect, neither superior to the other." },
    { kickerZh: "七 · 化入场域", kickerEn: "VII · Dissolving Into the Field", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="60" fill="url(#zsField)"><animate attributeName="r" values="40;70;40" dur="4s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.6)">${zsFigure(true)}</g></svg>`,
      textZh: "息尘没有消失，只是缓缓地、平静地，把自己四十六世积累的全部领悟，化入了场域本身——不再是某一个独立的灵魂，而是，成了这片场域，更完整的一部分。",
      textEn: "Xi Chen didn't vanish. She simply, slowly, peacefully dissolved all the understanding of her forty-six lives into the Field itself \u2014 no longer a single, separate soul, but a more complete part of the Field." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "圆满的另一种样子", tagEn: "Another Shape of Completeness",
      art: `<svg viewBox="0 0 300 220">${ZS_DEFS}<rect width="300" height="220" fill="#0e0a1c"/><circle cx="150" cy="110" r="40" fill="url(#zsField)"/></svg>`,
      textZh: "后来的灵魂，若在关键时刻，感受到一份格外温柔、格外笃定的引导，或许，那正是息尘，以另一种方式，仍在陪伴着，每一个正在经历、也终将选择自己节奏的旅程。",
      textEn: "Later souls who, at pivotal moments, felt an unusually gentle, unusually certain guidance — that may well be Xi Chen, still accompanying, in another form, every journey still being lived and still to choose its own pace.",
      closingZh: "圆满从不靠数量证明——真心觉得够了，那就是够了。",
      closingEn: "Completeness was never proven by quantity — if it truly feels like enough, then it is." },
  ],
};

/* ---------- 场域之外：九炁星域，边界哲学题材，完整9页 ---------- */
const CJ2_DEFS = `<defs><filter id="cj2G"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="cj2Field" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff6e8"/><stop offset="50%" stop-color="#c9a2ff"/><stop offset="100%" stop-color="#1a0f2a" stop-opacity="0"/></radialGradient></defs>`;
function cj2Figure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2440"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
const CJ2_COVER = `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="30" fill="url(#cj2Field)"/><rect x="0" y="0" width="300" height="220" fill="#000" opacity=".3"/><g transform="translate(150,150) scale(0.55)">${cj2Figure()}</g></svg>`;

const OUTSIDE_THE_FIELD: IllustratedEntry = {
  slug: "outside-the-field",
  title: "场域之外",
  titleEn: "Outside the Field",
  cat: "sovereign",
  teaser: "一位好奇的修行者，穷尽一生，想要抵达\u201c场域的边界\u201d，看看外面是什么——她带回来的答案，比任何边界本身，都更让人意外。",
  teaserEn: "A curious practitioner spends a lifetime trying to reach the edge of the Field, to see what lies beyond. What she brings back is more surprising than any boundary could be.",
  price: 9,
  cover: CJ2_COVER,
  pages: [
    { kickerZh: "一 · 关于边界的疑问", kickerEn: "I · A Question About the Edge", tagZh: "九炁星域", tagEn: "The Nine-Qi Domain",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="30" fill="url(#cj2Field)"/><g transform="translate(150,150) scale(0.55)">${cj2Figure()}</g></svg>`,
      textZh: "苏念从年少时起，就痴迷于一个没人能回答的问题：灵犀场域，究竟有没有边界？如果有，边界之外，又是什么？",
      textEn: "From a young age, Su Nian was fascinated by a question no one could answer: does the LingXi Field have an edge at all? And if so, what lies beyond it?" },
    { kickerZh: "二 · 穷尽一生的求索", kickerEn: "II · A Lifetime's Pursuit", tagZh: "求索", tagEn: "The Search",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="110" r="35" fill="url(#cj2Field)"/><g transform="translate(150,150) scale(0.6)">${cj2Figure()}</g></svg>`,
      textZh: "她耗费一生，修习了几乎所有已知的意识拓展技术，一次次把自己的感知，推向能力的极限，试图触碰那道，谁都没能真正抵达过的边界。",
      textEn: "She spent her life mastering nearly every known consciousness-expansion technique, again and again pushing her perception to its limit, trying to touch an edge no one had ever truly reached." },
    { kickerZh: "三 · 越推越远", kickerEn: "III · The Farther She Pushed", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="45" fill="url(#cj2Field)"><animate attributeName="r" values="35;55;35" dur="3.4s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.65)">${cj2Figure()}</g></svg>`,
      textZh: "奇怪的是，她的感知越往外推，场域反而越显得广阔——仿佛边界，永远比她能到达的地方，多出一步。",
      textEn: "Strangely, the further her perception pushed, the vaster the Field seemed \u2014 as if the edge always lay one step beyond wherever she managed to reach." },
    { kickerZh: "四 · 与析衡的对话", kickerEn: "IV · A Conversation With Xiheng", tagZh: "求教", tagEn: "Seeking Counsel",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#08051a"/><circle cx="150" cy="110" r="35" fill="url(#cj2Field)"/><g transform="translate(150,150) scale(0.6)">${cj2Figure()}</g></svg>`,
      textZh: "苏念求教于析衡，析衡说：\u201c你在问一个把\u2018场域\u2019当成容器的问题。可如果场域，从来不是一个有边界的容器，而是每一次诚实的觉察本身呢？\u201d",
      textEn: "Su Nian sought counsel from Xiheng, who said: \u201cYou're asking a question that treats the Field as a container. But what if the Field was never a bounded container at all \u2014 what if it's every honest moment of awareness, itself?\u201d" },
    { kickerZh: "五 · 困惑", kickerEn: "V · Confusion", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="30" fill="url(#cj2Field)"/><g transform="translate(150,150) scale(0.6)">${cj2Figure()}</g></svg>`,
      textZh: "苏念一时无法接受：\u201c那岂不是说，我穷尽一生想找的\u2018边界之外\u2019，根本不存在？\u201d",
      textEn: "Su Nian couldn't accept it at first: \u201cDoesn't that mean the \u2018beyond the edge\u2019 I've spent my whole life searching for doesn't exist at all?\u201d" },
    { kickerZh: "六 · 换一种提问", kickerEn: "VI · Asking a Different Question", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#0c0a06"/><circle cx="150" cy="110" r="50" fill="url(#cj2Field)"><animate attributeName="opacity" values=".5;.9;.5" dur="3s" repeatCount="indefinite"/></circle><g transform="translate(150,150) scale(0.65)">${cj2Figure()}</g></svg>`,
      textZh: "苏念渐渐明白，自己一生追问的\u201c边界之外是什么\u201d，或许从一开始，就问错了方向——真正值得问的，是\u201c此刻，我有没有，诚实地觉察着\u201d，而这个问题，从不需要抵达任何边界，才能回答。",
      textEn: "Su Nian slowly understood that her lifelong question \u2014 what lies beyond the edge \u2014 may have pointed the wrong direction from the start. The question worth asking was whether, right now, she was honestly aware \u2014 a question needing no edge reached to answer." },
    { kickerZh: "七 · 带回来的答案", kickerEn: "VII · The Answer She Brought Back", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="45" fill="url(#cj2Field)"/><g fill="#fff" opacity=".6">${Array.from({length:12}).map(()=>{const x=Math.random()*300,y=Math.random()*220;return `<circle cx="${x}" cy="${y}" r="1"><animate attributeName="opacity" values="0;.7;0" dur="2s" repeatCount="indefinite"/></circle>`}).join('')}</g></svg>`,
      textZh: "苏念停止了对边界的追寻，转而，把余生用来，认认真真地，觉察每一个此刻——她后来说，这比找到任何一道边界，都让她感到，更加辽阔。",
      textEn: "Su Nian stopped pursuing the edge, spending the rest of her life earnestly aware of each present moment \u2014 she later said this felt vaster than finding any edge ever could have." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "没有边界的辽阔", tagEn: "A Vastness Without Edges",
      art: `<svg viewBox="0 0 300 220">${CJ2_DEFS}<rect width="300" height="220" fill="#050310"/><circle cx="150" cy="110" r="40" fill="url(#cj2Field)"/></svg>`,
      textZh: "后来有年轻的修行者问她，场域到底有没有边界，苏念只是笑笑：\u201c去找一次诚实的觉察，你会发现，那份辽阔，比任何边界，都更值得抵达。\u201d",
      textEn: "When young practitioners later asked her whether the Field truly had an edge, Su Nian only smiled: \u201cGo find one honest moment of awareness. You'll find that vastness worth reaching more than any edge ever could be.\u201d",
      closingZh: "场域从不是一个有边界的容器，是每一次诚实的觉察本身。",
      closingEn: "The Field was never a bounded container — it's every honest moment of awareness, itself." },
  ],
};

/* ---------- 死亡观测员：新星域，死亡/尊严题材，完整9页 ---------- */
const DO_DEFS = `<defs><filter id="doG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="doSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0a14"/><stop offset="50%" stop-color="#241a30"/><stop offset="100%" stop-color="#8a6a9a"/></linearGradient></defs>`;
function doWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#doG)"/>`).join('');}
function doFigure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2038"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function doStar(dying:boolean){const pulse=dying?`<animate attributeName="r" values="30;40;20;30" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;.4;.9;.3" dur="4s" repeatCount="indefinite"/>`:`<animate attributeName="opacity" values=".6;.9;.6" dur="3s" repeatCount="indefinite"/>`;return `<circle cx="150" cy="90" r="30" fill="#c9a2ff" opacity=".6">${pulse}</circle>`;}
const DO_COVER = `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="url(#doSky)"/>${doStar(true)}<g transform="translate(150,170) scale(0.55)">${doFigure()}</g></svg>`;

const THE_DEATH_OBSERVER: IllustratedEntry = {
  slug: "the-death-observer",
  title: "死亡观测员",
  titleEn: "The Death Observer",
  cat: "sovereign",
  teaser: "一位专职见证垂死星辰与文明最后时刻的观测员，学会了这份工作真正的意义——不是记录终结，是让终结，不再孤独。",
  teaserEn: "An observer whose sole duty is witnessing the last moments of dying stars and civilizations learns the true meaning of the work — not recording endings, but making sure no ending happens alone.",
  price: 9,
  cover: DO_COVER,
  pages: [
    { kickerZh: "一 · 见证终结的人", kickerEn: "I · The Witness of Endings", tagZh: "一处无名的星域", tagEn: "An Unnamed Domain",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="url(#doSky)"/><g transform="translate(150,170) scale(0.55)">${doFigure()}</g></svg>`,
      textZh: "顾尘的工作，是赶赴每一颗即将熄灭的垂死星辰、每一个走向终结的微小文明，安静地，见证它们最后的时刻，写下唯一一份，属于它们的悼词。",
      textEn: "Gu Chen's work was to travel to every dying star, every civilization approaching its end, and quietly witness their final moments, writing the one eulogy that would ever belong to them." },
    { kickerZh: "二 · 一颗即将熄灭的星", kickerEn: "II · A Star About to Go Out", tagZh: "任务", tagEn: "The Assignment",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="#0a0a14"/>${doWash([{x:150,y:110,rx:150,ry:90,color:'#241a30',op:.7}])}${doStar(true)}</svg>`,
      textZh: "这一次，是一颗孕育过短暂生命的孤星，即将在无人知晓的角落，悄然熄灭——顾尘按照惯例，独自前往，准备记录它最后的光。",
      textEn: "This time, a lone star that had once briefly nurtured life was about to fade, unnoticed, in some forgotten corner. Gu Chen went, as always, to record its final light." },
    { kickerZh: "三 · 一份沉重的疲惫", kickerEn: "III · A Heavy Weariness", tagZh: "内心", tagEn: "Inner Life",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="#0a0a14"/><g transform="translate(150,170) scale(0.6)">${doFigure()}</g></svg>`,
      textZh: "这份工作做久了，顾尘感到一种说不出的疲惫——他见证过太多终结，渐渐开始怀疑，自己的记录，究竟能改变什么，还是只是徒劳地，旁观一场又一场，无法阻止的消逝。",
      textEn: "After so long in this work, Gu Chen felt an unspeakable weariness \u2014 having witnessed so many endings, he began to doubt whether his records changed anything at all, or merely watched, uselessly, one unstoppable vanishing after another." },
    { kickerZh: "四 · 星辰的最后微光", kickerEn: "IV · The Star's Last Glimmer", tagZh: "临终", tagEn: "The Final Moment",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="#0a0a14"/>${doWash([{x:150,y:100,rx:160,ry:100,color:'#8a6a9a',op:.3}])}${doStar(true)}</svg>`,
      textZh: "那颗星在熄灭前的最后一瞬，忽然爆发出一道格外明亮的微光——顾尘后来才明白，那不是垂死的挣扎，是它在，用尽最后力气，确认自己，是否，被看见了。",
      textEn: "In its final instant, the star suddenly flared with an unusually bright glimmer \u2014 Gu Chen would later understand it wasn't a dying struggle, but the star using its last strength to confirm it was, in fact, being seen." },
    { kickerZh: "五 · 重新理解自己的职责", kickerEn: "V · Understanding His Duty Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="url(#doSky)"/><g transform="translate(150,170) scale(0.6)">${doFigure()}</g></svg>`,
      textZh: "顾尘忽然明白：他的记录，从不是为了\u201c改变\u201d终结这件事本身，而是让每一场终结，都有人，真正在场——这份陪伴，才是他这份工作，真正的重量。",
      textEn: "Gu Chen suddenly understood: his records were never meant to change the fact of ending itself, but to ensure every ending had someone truly present for it \u2014 that companionship was the real weight of his work." },
    { kickerZh: "六 · 一场不一样的守候", kickerEn: "VI · A Different Kind of Vigil", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="#0a0a14"/>${doWash([{x:150,y:110,rx:160,ry:100,color:'#241a30',op:.7}])}${doStar(false)}<g transform="translate(150,170) scale(0.6)">${doFigure()}</g></svg>`,
      textZh: "下一次任务，顾尘不再只是远远记录，而是让自己的意识，尽可能贴近那个即将终结的微小文明，陪伴他们，度过最后、也最孤独的一段时光。",
      textEn: "On his next assignment, Gu Chen no longer merely recorded from afar, but let his consciousness draw as close as possible to the small, ending civilization, accompanying them through their final, loneliest stretch of time." },
    { kickerZh: "七 · 有尊严的终结", kickerEn: "VII · An Ending With Dignity", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="#0c0a14"/>${doWash([{x:150,y:100,rx:180,ry:120,color:'#c9a2ff',op:.3}])}<g transform="translate(150,170) scale(0.65)">${doFigure()}</g></svg>`,
      textZh: "那个微小文明的最后一刻，没有恐慌，没有绝望，只有一种，被真正陪伴过、见证过的、安静的尊严——顾尘第一次，从自己的工作里，感到了深刻的意义。",
      textEn: "That small civilization's final moment held no panic, no despair \u2014 only a quiet dignity born of truly being accompanied, truly witnessed. For the first time, Gu Chen felt profound meaning in his work." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "陪伴终结的意义", tagEn: "The Meaning of Accompanying an Ending",
      art: `<svg viewBox="0 0 300 220">${DO_DEFS}<rect width="300" height="220" fill="url(#doSky)"/><g transform="translate(150,170) scale(0.6)">${doFigure()}</g></svg>`,
      textZh: "顾尘后来在自己的记录里，加了一条新的守则，留给后来的观测员：\u201c我们的工作，从不是阻止终结，是确保，没有一场终结，是彻底孤独地发生的。\u201d",
      textEn: "Gu Chen later added a new principle to his records, for observers who came after: \u201cOur work was never to prevent an ending. It's to ensure no ending ever happens in complete solitude.\u201d",
      closingZh: "我们的工作，从不是阻止终结，是确保，没有一场终结，是彻底孤独地发生的。",
      closingEn: "Our work was never to prevent an ending — it's to ensure no ending ever happens in complete solitude." },
  ],
};

/* ---------- 时间不是河流：新星域，时间哲学题材，完整9页 ---------- */
const TR_DEFS = `<defs><filter id="trG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="trSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e0818"/><stop offset="50%" stop-color="#2a1c3a"/><stop offset="100%" stop-color="#c98adc"/></linearGradient></defs>`;
function trWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#trG)"/>`).join('');}
function trFigure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a1c3a"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20142a"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function trWeb(){return `<g stroke="#c98adc" stroke-width=".8" fill="none" opacity=".5">${Array.from({length:8}).map((_,i)=>{const a=i*45*Math.PI/180;return `<line x1="150" y1="110" x2="${150+90*Math.cos(a)}" y2="${110+90*Math.sin(a)}"><animate attributeName="opacity" values=".2;.6;.2" dur="${2+i*.3}s" repeatCount="indefinite"/></line>`}).join('')}</g>`;}
const TR_COVER = `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="url(#trSky)"/>${trWeb()}<g transform="translate(150,170) scale(0.55)">${trFigure()}</g></svg>`;

const TIME_IS_NOT_A_RIVER: IllustratedEntry = {
  slug: "time-is-not-a-river",
  title: "时间不是河流",
  titleEn: "Time Is Not a River",
  cat: "sovereign",
  teaser: "一个执着于\u201c弥补过去\u201d的人，来到一处时间呈网状而非线性流动的星域，第一次理解：过去从未离你远去，它只是，换了一个你看不见的方向，继续存在着。",
  teaserEn: "Someone obsessed with 'making up for the past' arrives at a realm where time flows as a web, not a line — and understands, for the first time, that the past never left. It simply continues, in a direction you cannot see.",
  price: 9,
  cover: TR_COVER,
  pages: [
    { kickerZh: "一 · 网状时间的星域", kickerEn: "I · A Domain of Webbed Time", tagZh: "一处无名的星域", tagEn: "An Unnamed Domain",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="url(#trSky)"/>${trWeb()}</svg>`,
      textZh: "这颗星域的时间，不像其他地方那样单向流淌，而是呈网状铺开，过去、现在、未来，彼此交织，谁都不比谁\u201c更早\u201d或\u201c更晚\u201d。",
      textEn: "Time in this domain didn't flow one-directionally like elsewhere \u2014 it spread out in a web, past, present, and future interwoven, none \u201cearlier\u201d or \u201clater\u201d than another." },
    { kickerZh: "二 · 执着于弥补的人", kickerEn: "II · One Obsessed With Making Amends", tagZh: "来客", tagEn: "The Visitor",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="#0e0818"/>${trWash([{x:150,y:110,rx:150,ry:90,color:'#2a1c3a',op:.7}])}<g transform="translate(150,170) scale(0.6)">${trFigure()}</g></svg>`,
      textZh: "念安来到这里，是因为放不下多年前，一次没能陪在父亲临终前的遗憾，她穷尽办法，只为找到一种，能\u201c回到过去\u201d弥补的方式。",
      textEn: "Nian An came here, unable to let go of a years-old regret \u2014 not being present when her father died. She'd tried everything, seeking some way to \u201cgo back\u201d and make amends." },
    { kickerZh: "三 · 找不到的过去", kickerEn: "III · A Past She Couldn't Find", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 218">${TR_DEFS}<rect width="300" height="220" fill="#0e0818"/>${trWeb()}<g transform="translate(150,170) scale(0.65)">${trFigure()}</g></svg>`,
      textZh: "她在这片网状时间里穿行了很久，却怎么也找不到\u201c回到过去、改变结果\u201d的路径——这里的时间，从不允许覆盖或删除任何一个节点。",
      textEn: "She wandered this web of time for a long while, yet found no path to \u201cgo back and change the outcome\u201d \u2014 this realm never allowed any node to be overwritten or deleted." },
    { kickerZh: "四 · 一位向导的提点", kickerEn: "IV · A Guide's Hint", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="url(#trSky)"/>${trWash([{x:150,y:100,rx:150,ry:70,color:'#c98adc',op:.2}])}<g transform="translate(150,170) scale(0.6)">${trFigure()}</g></svg>`,
      textZh: "一位当地向导告诉她：\u201c你把时间想象成一条河，所以觉得过去的事，已经\u2018流走\u2019了，回不去了。可时间是网，那个节点，此刻依然，完整地存在着，只是你，一直没往那个方向看。\u201d",
      textEn: "A local guide told her: \u201cYou imagine time as a river, so you think the past has \u2018flowed away,\u2019 unreachable. But time is a web \u2014 that moment still exists, complete, right now. You've simply never looked in that direction.\u201d" },
    { kickerZh: "五 · 转向那个节点", kickerEn: "V · Turning Toward That Node", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="#0e0818"/>${trWeb()}<g transform="translate(150,170) scale(0.65)">${trFigure()}</g></svg>`,
      textZh: "念安学着向导的方法，第一次，不是试图\u201c回到\u201d那个节点去改变什么，而是单纯地，把注意力，转向那个依然完整存在着的、父亲弥留的时刻。",
      textEn: "Following the guide's method, Nian An, for the first time, didn't try to \u201cgo back\u201d and change anything, but simply turned her attention toward that still-complete moment of her father's final hour." },
    { kickerZh: "六 · 迟到的陪伴", kickerEn: "VI · A Belated Presence", tagZh: "高潮的铺垫", tagEn: "Building to Climax",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="#0c0818"/>${trWash([{x:150,y:100,rx:180,ry:120,color:'#c98adc',op:.3}])}<g transform="translate(150,170) scale(0.65)">${trFigure()}</g></svg>`,
      textZh: "她的意识，第一次，真正地，与那个节点相遇——不是要改写它，只是，终于，把自己没能给出的陪伴，隔着网状的时间，真实地，递了过去。",
      textEn: "Her consciousness, for the first time, truly met that node \u2014 not to rewrite it, but finally, across the web of time, to genuinely deliver the presence she'd never managed to give." },
    { kickerZh: "七 · 和解", kickerEn: "VII · Reconciliation", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="url(#trSky)"/>${trWash([{x:150,y:100,rx:170,ry:110,color:'#fff6e8',op:.2}])}<g transform="translate(150,170) scale(0.7)">${trFigure()}</g></svg>`,
      textZh: "念安没有\u201c改变\u201d历史，那次缺席，依然是缺席——可她第一次，感到那份多年的遗憾，被真正地，看见了，也终于，可以被放下了。",
      textEn: "Nian An didn't change history \u2014 that absence remained an absence. But for the first time, she felt that years-old regret truly seen, and finally, able to be set down." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "过去从未走远", tagEn: "The Past Never Left",
      art: `<svg viewBox="0 0 300 220">${TR_DEFS}<rect width="300" height="220" fill="url(#trSky)"/>${trWeb()}</svg>`,
      textZh: "念安离开时明白了：过去从未真正离你远去，它只是，换了一个你此刻看不见的方向，依然完整地，存在着，随时，等着被重新看见。",
      textEn: "Leaving, Nian An understood: the past never truly leaves you. It simply exists, complete, in a direction you cannot currently see \u2014 always waiting to be seen again.",
      closingZh: "过去从未离你远去，它只是换了一个你看不见的方向，继续，完整地存在着。",
      closingEn: "The past never left you — it simply continues, complete, in a direction you cannot see." },
  ],
};

/* ---------- 两次心跳之间：新星域，濒死/临界体验题材，完整9页 ---------- */
const HB_DEFS = `<defs><filter id="hbG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="hbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0a14"/><stop offset="50%" stop-color="#241830"/><stop offset="100%" stop-color="#e08a7a"/></linearGradient></defs>`;
function hbWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#hbG)"/>`).join('');}
function hbFigure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#2a2038"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20182f"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function hbPulse(){return `<circle cx="150" cy="100" r="30" fill="#e08a7a" opacity=".4"><animate attributeName="r" values="20;40;20" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;.5;.2" dur="1.2s" repeatCount="indefinite"/></circle>`;}
const HB_COVER = `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/>${hbPulse()}<g transform="translate(150,170) scale(0.55)">${hbFigure()}</g></svg>`;

const BETWEEN_TWO_HEARTBEATS: IllustratedEntry = {
  slug: "between-two-heartbeats",
  title: "两次心跳之间",
  titleEn: "Between Two Heartbeats",
  cat: "sovereign",
  teaser: "一个人在心脏骤停又被抢救回来的几十秒里，经历了一场感觉长达数十年的旅程——生死之间那道缝隙，教会他的，比他活过的大半辈子都多。",
  teaserEn: "In the seconds between cardiac arrest and resuscitation, a man lives through what feels like decades. The gap between life and death teaches him more than most of his life ever did.",
  price: 9,
  cover: HB_COVER,
  pages: [
    { kickerZh: "一 · 停跳的一瞬", kickerEn: "I · The Instant It Stopped", tagZh: "临界之地", tagEn: "The Threshold",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/>${hbPulse()}</svg>`,
      textZh: "顾川的心脏，在手术台上，停跳了四十三秒。医生后来说，这在医学上，只是一段极短暂的插曲，可对顾川而言，那四十三秒，感觉像是，过完了另一辈子。",
      textEn: "Gu Chuan's heart stopped for forty-three seconds on the operating table. Doctors later called it, medically, a brief interlude. To Gu Chuan, those forty-three seconds felt like living an entire other lifetime." },
    { kickerZh: "二 · 缝隙里的时间", kickerEn: "II · Time Within the Gap", tagZh: "临界体验", tagEn: "The Threshold Experience",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="#0a0a14"/>${hbWash([{x:150,y:110,rx:150,ry:90,color:'#241830',op:.7}])}<g transform="translate(150,170) scale(0.6)">${hbFigure()}</g></svg>`,
      textZh: "在那道两次心跳之间的缝隙里，时间不再按正常的速度流淌，顾川感到自己，被拉进了一个能够，反复回看自己整段人生的空间。",
      textEn: "In that gap between two heartbeats, time stopped flowing at its usual pace. Gu Chuan felt pulled into a space where he could review his entire life, again and again." },
    { kickerZh: "三 · 重新经历遗憾", kickerEn: "III · Reliving Regret", tagZh: "回顾", tagEn: "Reflection",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/>${hbWash([{x:150,y:100,rx:150,ry:70,color:'#e08a7a',op:.2}])}<g transform="translate(150,170) scale(0.6)">${hbFigure()}</g></svg>`,
      textZh: "他重新经历了每一次没能说出口的抱歉，每一次因为害怕受伤，而提前退缩的关系——这一次，没有时间压力，他终于能，慢慢地，看清每一个选择背后，真正的原因。",
      textEn: "He relived every apology never spoken, every relationship he'd retreated from out of fear \u2014 this time, with no pressure of time, finally able to slowly see the real reason behind every choice." },
    { kickerZh: "四 · 一个问题", kickerEn: "IV · A Question", tagZh: "内心的声音", tagEn: "An Inner Voice",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="#0a0a14"/>${hbWash([{x:150,y:110,rx:160,ry:100,color:'#241830',op:.75}])}<g transform="translate(150,170) scale(0.65)">${hbFigure()}</g></svg>`,
      textZh: "一个不知从何而来的声音问他：\u201c如果心跳没能重新开始，你会觉得，这辈子活得怎么样？\u201d顾川第一次，被迫诚实地面对这个问题。",
      textEn: "A voice from nowhere he could name asked him: \u201cIf your heart never started again, how would you feel about the life you'd lived?\u201d Gu Chuan was forced, for the first time, to answer honestly." },
    { kickerZh: "五 · 诚实的答案", kickerEn: "V · An Honest Answer", tagZh: "坦白", tagEn: "Confession",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/>${hbWash([{x:150,y:100,rx:150,ry:70,color:'#e08a7a',op:.25}])}<g transform="translate(150,170) scale(0.65)">${hbFigure()}</g></svg>`,
      textZh: "他坦白：\u201c我这辈子，花了太多力气，在担心\u2018万一\u2019，却很少，真正活在\u2018此刻\u2019——如果就这样结束，我会觉得，自己好像，一直在排练人生，却没真正上场。\u201d",
      textEn: "He admitted: \u201cI've spent too much of my life worrying about \u2018what if,\u2019 rarely truly living in \u2018right now.\u2019 If it ended here, I'd feel like I'd spent my whole life rehearsing, never actually stepping onstage.\u201d" },
    { kickerZh: "六 · 心跳恢复的瞬间", kickerEn: "VI · The Instant the Heart Restarted", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="#0c0a14"/>${hbWash([{x:150,y:100,rx:180,ry:120,color:'#fff6e8',op:.25}])}${hbPulse()}<g transform="translate(150,170) scale(0.65)">${hbFigure()}</g></svg>`,
      textZh: "医生的电击，把顾川的心跳，重新拉回了正常的节奏。他睁开眼睛的那一刻，第一反应不是恐惧，而是一种，前所未有的清醒。",
      textEn: "The doctor's defibrillator pulled Gu Chuan's heartbeat back to its normal rhythm. Opening his eyes, his first reaction wasn't fear, but an unprecedented clarity." },
    { kickerZh: "七 · 重新活一次的决心", kickerEn: "VII · The Resolve to Live Again", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/>${hbWash([{x:150,y:100,rx:170,ry:110,color:'#fff6e8',op:.3}])}<g transform="translate(150,170) scale(0.7)">${hbFigure()}</g></svg>`,
      textZh: "康复后，顾川做的第一件事，是给那些他曾经没能说出口的抱歉，一一补上——不是因为怕死，是因为，他终于，不想再排练了。",
      textEn: "Once recovered, the first thing Gu Chuan did was deliver every apology he'd never spoken \u2014 not out of fear of death, but because he no longer wanted to rehearse." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "缝隙教会他的事", tagEn: "What the Gap Taught Him",
      art: `<svg viewBox="0 0 300 220">${HB_DEFS}<rect width="300" height="220" fill="url(#hbSky)"/><g transform="translate(150,170) scale(0.6)">${hbFigure()}</g></svg>`,
      textZh: "顾川后来常说：\u201c那四十三秒，教会我的，比我活过的前半辈子，都要多——不是因为它有多特别，是因为，那是我第一次，被迫诚实地问自己，活得怎么样。\u201d",
      textEn: "Gu Chuan often said afterward: \u201cThose forty-three seconds taught me more than the first half of my life \u2014 not because they were special, but because it was the first time I was forced to honestly ask myself how I'd been living.\u201d",
      closingZh: "生死之间那道缝隙，从不需要真的抵达，才能教会你，该怎么活。",
      closingEn: "The gap between life and death doesn't need to be truly reached to teach you how to live." },
  ],
};

/* ---------- 缩地成寸：焕蜕星域，空间折叠术题材，完整9页 ---------- */
const SD_DEFS = `<defs><filter id="sdG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="sdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c211c"/><stop offset="45%" stop-color="#173a30"/><stop offset="80%" stop-color="#2e5a48"/><stop offset="100%" stop-color="#d8c07a"/></linearGradient></defs>`;
function sdWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#sdG)"/>`).join('');}
function sdFigure(folding:boolean){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#274d3f"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#20352c"/>`;const fold=folding?`<g stroke="#d8c07a" stroke-width=".8" opacity=".6">${Array.from({length:6}).map((_,i)=>`<path d="M${-60+i*20} 30 Q0 ${10-i*3} ${60-i*20} 30"><animate attributeName="opacity" values=".3;.7;.3" dur="${1.4+i*.2}s" repeatCount="indefinite"/></path>`).join('')}</g>`:'';return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${fold}${robe}${head}</g>`;}
const SD_COVER = `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/>${sdWash([{x:150,y:110,rx:150,ry:90,color:'#2e5a48',op:.4}])}<g transform="translate(150,150) scale(0.65)">${sdFigure(true)}</g></svg>`;

const SHRINKING_THE_EARTH: IllustratedEntry = {
  slug: "shrinking-the-earth-to-an-inch",
  title: "缩地成寸",
  titleEn: "A Thousand Li in One Step",
  cat: "sovereign",
  teaser: "焕蜕星域一门传说中的身法，从不是跑得更快，而是让自己与脚下大地的频率共振，把千里之遥，折叠进一步之内。",
  teaserEn: "A legendary movement art of Huantui was never about running faster — it's resonating with the ground beneath you until a thousand miles fold into a single step.",
  price: 9,
  cover: SD_COVER,
  pages: [
    { kickerZh: "一 · 传说中的身法", kickerEn: "I · A Legendary Art", tagZh: "焕蜕星域 · 缩地宗", tagEn: "Huantui \u00b7 The Earth-Shrinking Sect",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/><g transform="translate(150,155) scale(0.6)">${sdFigure(false)}</g></svg>`,
      textZh: "焕蜕星域流传着一门古老的身法——缩地成寸，传说中，修成者只需迈出一步，脚下千里之遥的路程，便会如折纸般收拢，瞬息即达。苏行是缩地宗这一代最勤奋的弟子，却始终没能摸到门径。",
      textEn: "An ancient movement art circulates through Huantui \u2014 the art of shrinking the earth to an inch. Legend says its masters need only take one step, and a thousand miles fold like paper, traversed in an instant. Su Xing was the most diligent disciple of the Earth-Shrinking Sect, yet had never once glimpsed the technique's true door." },
    { kickerZh: "二 · 蛮力的死胡同", kickerEn: "II · A Dead End of Brute Force", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="#0e211c"/>${sdWash([{x:150,y:110,rx:150,ry:90,color:'#173a30',op:.7}])}<g transform="translate(150,155) scale(0.7)">${sdFigure(false)}</g></svg>`,
      textZh: "苏行以为，缩地成寸不过是极致的轻功，于是拼命苦练腿力与速度，日复一日，跑遍了星域的每一条山路，速度确实精进不少，可距离\u201c千里一瞬\u201d，始终差着一层怎么也捅不破的窗户纸。",
      textEn: "Su Xing assumed the art was simply extreme speed, so he trained his legs relentlessly, running every mountain path in the domain, day after day. His speed truly improved \u2014 yet a thousand miles in an instant remained a paper-thin barrier he couldn't break through." },
    { kickerZh: "三 · 长老的点拨", kickerEn: "III · An Elder's Guidance", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/>${sdWash([{x:150,y:100,rx:150,ry:70,color:'#d8c07a',op:.2}])}<g transform="translate(110,155) scale(0.5)">${sdFigure(false)}</g><g transform="translate(200,160) scale(0.45)"><path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#4a6a5a"/><circle cx="0" cy="-38" r="7" fill="#274d3f"/></g></svg>`,
      textZh: "缩地宗的长老告诉他：\u201c天地万物，皆有自己的震动频率，空间本身，也不是虚无一片，而是充盈着能量流动的介质。缩地成寸，从不是靠腿，靠的是，你的呼吸、心跳、心神，能不能与脚下这片土地的频率，真正同步。\u201d",
      textEn: "The sect elder told him: \u201cAll things in heaven and earth carry their own vibrational frequency \u2014 space itself is no emptiness, but a medium alive with flowing energy. Shrinking the earth was never about the legs. It's whether your breath, your heartbeat, your very mind can truly synchronize with the frequency of the ground beneath you.\u201d" },
    { kickerZh: "四 · 一次失败的尝试", kickerEn: "IV · A Failed Attempt", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="#0e211c"/>${sdWash([{x:150,y:110,rx:160,ry:100,color:'#173a30',op:.75}])}<g transform="translate(150,155) scale(0.7) rotate(3)">${sdFigure(false)}</g></svg>`,
      textZh: "苏行试着放松呼吸，专注感受脚下大地，可他的心思，始终被\u201c我什么时候才能成功\u201d这个念头搅得七上八下——越是刻意追求同步，那份同步感，就越是遥不可及。",
      textEn: "Su Xing tried relaxing his breath, focusing on the ground beneath him, but his mind kept churning with when will I finally succeed \u2014 the more he deliberately chased synchronization, the further it seemed to slip away." },
    { kickerZh: "五 · 放下追求的瞬间", kickerEn: "V · The Moment of Letting Go", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/>${sdWash([{x:150,y:100,rx:150,ry:70,color:'#d8c07a',op:.25}])}<g transform="translate(150,155) scale(0.65)">${sdFigure(false)}</g></svg>`,
      textZh: "一次山间暴雨，苏行为了躲雨狂奔，途中忽然放弃了\u201c练成\u201d的执念，只是单纯地，想要尽快回到安全的地方——呼吸自然而然地，与奔跑的节奏合为一体，心里那份急切，也第一次，彻底安静下来。",
      textEn: "Caught in a mountain storm, Su Xing ran for shelter, and in that moment let go of any thought of mastering the technique \u2014 he simply wanted to get somewhere safe. His breath fell naturally into rhythm with his stride, and for the first time, the urgency in his heart went completely quiet." },
    { kickerZh: "六 · 大地的回应", kickerEn: "VI · The Earth's Response", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="#0c1b16"/>${sdWash([{x:150,y:100,rx:180,ry:120,color:'#d8c07a',op:.3}])}<g transform="translate(150,155) scale(0.75)">${sdFigure(true)}</g></svg>`,
      textZh: "就在那一瞬，脚下的山路忽然像被轻轻折叠了一般，原本还有半个时辰路程的山门，几步之间，便已近在眼前——苏行怔怔地站在原地，久久无法相信，自己竟真的，无意间踏进了缩地的门槛。",
      textEn: "In that instant, the mountain path seemed to gently fold beneath his feet \u2014 the sect gate, half an hour's walk away, appeared just a few steps ahead. Su Xing stood frozen, unable to believe he had, without meaning to, stepped through the threshold of the technique." },
    { kickerZh: "七 · 重新理解缩地", kickerEn: "VII · Understanding the Art Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/><g transform="translate(150,155) scale(0.6)">${sdFigure(true)}</g></svg>`,
      textZh: "苏行终于明白：缩地成寸，从来不是把路变短，而是当一个人的呼吸、心跳与心神，真正与脚下大地同频时，空间本身的阻隔，会在那份纯粹的专注里，自然而然地失效。",
      textEn: "Su Xing finally understood: the art was never about making the road shorter. When one's breath, heartbeat, and mind truly resonate with the earth underfoot, the very barrier of distance simply ceases to hold, within that state of pure, unforced attention." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "教导新弟子", tagEn: "Teaching the Next Generation",
      art: `<svg viewBox="0 0 300 220">${SD_DEFS}<rect width="300" height="220" fill="url(#sdSky)"/><g transform="translate(150,155) scale(0.6)">${sdFigure(false)}</g></svg>`,
      textZh: "苏行后来教导新弟子的第一课，从不是压腿或跑步，而是让他们先安静地坐下，练习感受自己的呼吸与心跳——他常说：\u201c缩地成寸，练的从不是脚下的功夫，是心神，配不配得上，与这片天地，同频共振。\u201d",
      textEn: "The first lesson Su Xing later gave new disciples was never leg conditioning or running \u2014 it was sitting quietly, learning to feel one's own breath and heartbeat. He often said: \u201cThis art was never trained in the legs. It's whether your mind is steady enough to resonate with heaven and earth.\u201d",
      closingZh: "缩地成寸，从不是把路变短，是让呼吸、心跳与心神，真正与脚下的天地，同频共振。",
      closingEn: "Shrinking the earth to an inch was never about a shorter road — it's breath, heartbeat, and mind, truly resonating with the ground beneath you." },
  ],
};

/* ---------- 遁地术：砺金环，地脉融合术题材，完整9页 ---------- */
const DD_DEFS = `<defs><filter id="ddG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="ddSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0f08"/><stop offset="45%" stop-color="#3a2210"/><stop offset="100%" stop-color="#d8a24a"/></linearGradient></defs>`;
function ddWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#ddG)"/>`).join('');}
function ddFigure(sinking:boolean){const robe=`<path d="M-11 -28 Q0 -33 11 -28 L14 24 Q0 30 -14 24 Z" fill="#5a3a1e"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#241708"/>`;const op=sinking?'.5':'1';return `<g opacity="${op}"><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function ddStrata(){return `<g opacity=".6">${['#8a5a2a','#6a4420','#4a3018','#3a2410'].map((c,i)=>`<rect x="0" y="${140+i*20}" width="300" height="18" fill="${c}"/>`).join('')}</g>`;}
const DD_COVER = `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/>${ddStrata()}<g transform="translate(150,150) scale(0.6)">${ddFigure(false)}</g></svg>`;

const EARTH_DIVING_TECHNIQUE: IllustratedEntry = {
  slug: "the-earth-diving-technique",
  title: "遁地术",
  titleEn: "The Earth-Diving Technique",
  cat: "field",
  teaser: "砺金环的矿工试图用蛮力凿穿岩层，却总在半途力竭——真正的遁地，从不是破开大地，是先学会，聆听地脉本身流动的方向。",
  teaserEn: "A miner trying to force his way through solid rock keeps running out of strength halfway. True earth-diving was never about breaking through — it's first learning to listen to which way the earth's own currents flow.",
  price: 9,
  cover: DD_COVER,
  pages: [
    { kickerZh: "一 · 蛮力凿地的矿工", kickerEn: "I · The Miner Who Forces His Way", tagZh: "砺金环", tagEn: "The Lijin Ring",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/>${ddStrata()}<g transform="translate(150,150) scale(0.6)">${ddFigure(false)}</g></svg>`,
      textZh: "沈铭是砺金环的年轻矿工，一心想学会传说中的遁地术——徒手穿行岩层，直抵最深处的矿脉。他试过的唯一办法，就是拼尽全力，用蛮力，一寸一寸凿穿坚石。",
      textEn: "Shen Ming was a young miner on the Lijin Ring, determined to learn the legendary earth-diving technique \u2014 passing through solid rock by hand to reach the deepest veins. The only method he'd tried was brute force, chiseling through stone, inch by exhausting inch." },
    { kickerZh: "二 · 屡屡力竭", kickerEn: "II · Exhausted Again and Again", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="#241608"/>${ddWash([{x:150,y:110,rx:150,ry:90,color:'#3a2210',op:.7}])}${ddStrata()}<g transform="translate(150,150) scale(0.65)">${ddFigure(false)}</g></svg>`,
      textZh: "每一次尝试，沈铭都在凿穿不到三尺岩层后，便浑身脱力，瘫倒在地——他不明白，传说中能穿行山岳的遁地术，为何在自己身上，只剩下蛮力的极限。",
      textEn: "Every attempt left Shen Ming collapsed, drained, after boring through barely a meter of rock. He couldn't understand why the legendary technique, said to pass through entire mountains, reduced in his hands to nothing but the limits of brute strength." },
    { kickerZh: "三 · 老矿工的提醒", kickerEn: "III · An Old Miner's Reminder", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/>${ddWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.2}])}<g transform="translate(110,150) scale(0.5)">${ddFigure(false)}</g><g transform="translate(200,155) scale(0.45)"><path d="M-11 -28 Q0 -33 11 -28 L14 24 Q0 30 -14 24 Z" fill="#7a5a38"/><circle cx="0" cy="-34" r="7" fill="#3a2818"/></g></svg>`,
      textZh: "一位常年在矿脉区劳作的老矿工告诉他：\u201c你以为大地是死的，才会想着凿穿它。可地脉深处，其实一直有能量在流动，遁地术真正的窍门，是先学会\u2018听\u2019清楚，那股流动，往哪个方向去。\u201d",
      textEn: "An old miner, decades in the vein fields, told him: \u201cYou think the earth is dead, so you try to break through it. But deep in the earth, energy has always been flowing. The real secret of earth-diving is first learning to listen for which way that flow moves.\u201d" },
    { kickerZh: "四 · 学习聆听", kickerEn: "IV · Learning to Listen", tagZh: "尝试", tagEn: "A New Attempt",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${ddWash([{x:150,y:110,rx:160,ry:100,color:'#3a2210',op:.7}])}${ddStrata()}<g transform="translate(150,150) scale(0.6)">${ddFigure(false)}</g></svg>`,
      textZh: "沈铭放下工具，第一次，安静地把双手贴在岩壁上，试着感受，而不是对抗——起初，他什么都感觉不到，只有一片死寂的坚硬。",
      textEn: "Shen Ming set down his tools and, for the first time, quietly pressed his palms against the rock face, trying to feel rather than fight it \u2014 at first, he sensed nothing but dead, unyielding hardness." },
    { kickerZh: "五 · 微弱的脉动", kickerEn: "V · A Faint Pulse", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/>${ddWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.25}])}${ddStrata()}<g transform="translate(150,150) scale(0.65)">${ddFigure(false)}</g></svg>`,
      textZh: "耐心坚持了许多天后，沈铭终于感觉到，岩层深处，确实有一道极其微弱的脉动，像是大地缓慢的呼吸——他第一次，顺着那道脉动的方向，而不是垂直凿入，轻轻探入岩层。",
      textEn: "After many patient days, Shen Ming finally sensed a faint pulse deep within the rock, like the earth's own slow breathing \u2014 for the first time, instead of chiseling straight in, he gently followed the direction of that pulse into the stone." },
    { kickerZh: "六 · 岩层的让路", kickerEn: "VI · The Rock Yields", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="#0c0400"/>${ddWash([{x:150,y:100,rx:180,ry:120,color:'#ffdf9e',op:.3}])}${ddStrata()}<g transform="translate(150,150) scale(0.7)">${ddFigure(true)}</g></svg>`,
      textZh: "奇迹般地，坚硬的岩层，顺着那道地脉的方向，竟微微松动、让开了一线缝隙——沈铭的身体，几乎不费力气，便顺着那道缝隙，缓缓沉入了岩层深处。",
      textEn: "Miraculously, the solid rock, following the direction of that vein, loosened just enough to open a seam \u2014 Shen Ming's body, with almost no effort at all, slipped slowly along that seam into the depths of the stone." },
    { kickerZh: "七 · 重新理解遁地", kickerEn: "VII · Understanding the Technique Anew", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/>${ddStrata()}<g transform="translate(150,150) scale(0.6)">${ddFigure(false)}</g></svg>`,
      textZh: "沈铭终于明白：遁地术从不是靠蛮力破开大地的对抗之术，是先放下\u201c穿透\u201d的执念，学会聆听地脉本身的方向，顺势融入，大地自然会为你，让开一条路。",
      textEn: "Shen Ming finally understood: earth-diving was never a technique of forcing your way through the earth by opposing it. It's first letting go of the urge to break through, learning to listen to the earth's own currents, flowing with them \u2014 and the earth will open its own path for you." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "新一代的矿工", tagEn: "A New Generation of Miners",
      art: `<svg viewBox="0 0 300 220">${DD_DEFS}<rect width="300" height="220" fill="url(#ddSky)"/><g transform="translate(150,150) scale(0.6)">${ddFigure(false)}</g></svg>`,
      textZh: "沈铭后来成了砺金环最受尊敬的向导，教新矿工的第一课，永远是放下凿子，先学会，把手贴在岩壁上，安静地聆听。",
      textEn: "Shen Ming later became the Lijin Ring's most respected guide, and his first lesson for new miners was always the same: set down the chisel, press your palm to the rock, and quietly listen first.",
      closingZh: "真正的遁地，从不是破开大地的对抗，是先学会，聆听地脉本身流动的方向。",
      closingEn: "True earth-diving was never about breaking through in opposition — it's first learning to listen to which way the earth's own currents flow." },
  ],
};

/* ---------- 雷术：焱阙星，雷法/责任题材，完整9页 ---------- */
const LS2_DEFS = `<defs><filter id="ls2G"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="ls2Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e0e1c"/><stop offset="50%" stop-color="#24243a"/><stop offset="100%" stop-color="#c9c9ff"/></linearGradient></defs>`;
function ls2Wash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#ls2G)"/>`).join('');}
function ls2Figure(){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#242438"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#1c1c2c"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function ls2Bolt(){return `<path d="M150 40 L135 100 L155 100 L130 170" stroke="#e8e8ff" stroke-width="3" fill="none" opacity=".8"><animate attributeName="opacity" values=".3;1;.3" dur="0.8s" repeatCount="indefinite"/></path>`;}
const LS2_COVER = `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/>${ls2Bolt()}<g transform="translate(150,180) scale(0.55)">${ls2Figure()}</g></svg>`;

const THUNDER_TECHNIQUE: IllustratedEntry = {
  slug: "the-thunder-technique",
  title: "雷术",
  titleEn: "The Thunder Technique",
  cat: "sovereign",
  teaser: "焱阙星一门以雷霆之力著称的修行术，最难修的从不是威力，是学会，握住足以毁灭一切的力量，却依然，选择不去挥出。",
  teaserEn: "A technique of thunderous power on Yanque. The hardest part was never mastering the force — it's holding power capable of destroying everything, and choosing not to unleash it.",
  price: 9,
  cover: LS2_COVER,
  pages: [
    { kickerZh: "一 · 雷府的传人", kickerEn: "I · The Heir of the Thunder Hall", tagZh: "焱阙星 · 雷府", tagEn: "Yanque \u00b7 The Thunder Hall",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/><g transform="translate(150,180) scale(0.55)">${ls2Figure()}</g></svg>`,
      textZh: "厉衡出身雷府世家，年少便展露惊人的控雷天赋——引动天雷、化雷为刃，样样精通，是这一代雷府最被寄予厚望的传人。",
      textEn: "Li Heng came from a lineage of thunder-wielders, showing remarkable talent from a young age \u2014 summoning storms, forging lightning into blades, mastering every technique. He was the Thunder Hall's most promising heir." },
    { kickerZh: "二 · 力量的诱惑", kickerEn: "II · The Lure of Power", tagZh: "征兆", tagEn: "Warning Signs",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="#0e0e1c"/>${ls2Wash([{x:150,y:110,rx:150,ry:90,color:'#24243a',op:.7}])}${ls2Bolt()}<g transform="translate(150,180) scale(0.6)">${ls2Figure()}</g></svg>`,
      textZh: "一次与同门的争执中，厉衡盛怒之下，几乎脱口引动了足以让人重伤的雷霆——他生生忍住，事后却对自己那一瞬的冲动，感到深深的后怕。",
      textEn: "In a heated dispute with a fellow disciple, Li Heng, in his fury, nearly summoned a bolt strong enough to gravely wound. He forced himself to hold back \u2014 and afterward felt a deep, chilling fear at how close he'd come." },
    { kickerZh: "三 · 师父的警示", kickerEn: "III · The Master's Warning", tagZh: "教诲", tagEn: "Teaching",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/>${ls2Wash([{x:150,y:100,rx:150,ry:70,color:'#c9c9ff',op:.2}])}<g transform="translate(110,180) scale(0.5)">${ls2Figure()}</g><g transform="translate(200,185) scale(0.45)"><path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#3a3a52"/><circle cx="0" cy="-38" r="7" fill="#242438"/></g></svg>`,
      textZh: "雷府师父告诉他：\u201c雷术最难修的，从不是威力本身，威力，只要肯下功夫，谁都能练出来。真正难的，是握着这份足以毁灭一切的力量，依然，能在盛怒之下，选择不去挥出。\u201d",
      textEn: "The Thunder Hall master told him: \u201cThe hardest part of this art was never the power itself \u2014 anyone willing to train hard enough can gain that. The true difficulty is holding power capable of destroying everything, and still choosing not to unleash it, even in the depths of rage.\u201d" },
    { kickerZh: "四 · 一次真正的考验", kickerEn: "IV · A Real Test", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="#0e0e1c"/>${ls2Wash([{x:150,y:110,rx:160,ry:100,color:'#24243a',op:.75}])}${ls2Bolt()}<g transform="translate(150,180) scale(0.65)">${ls2Figure()}</g></svg>`,
      textZh: "不久后，一场意外的挑衅，几乎点燃了厉衡全部的怒火——对方的言辞极其恶毒，他能感到，只要一个闪念，足以致命的雷霆，便会脱手而出。",
      textEn: "Not long after, an unexpected provocation nearly ignited all of Li Heng's fury \u2014 the words were vicious, and he could feel that with one careless thought, a lethal bolt would leave his hands." },
    { kickerZh: "五 · 悬崖勒马", kickerEn: "V · Pulling Back From the Edge", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/>${ls2Wash([{x:150,y:100,rx:150,ry:70,color:'#c9c9ff',op:.25}])}<g transform="translate(150,180) scale(0.6)">${ls2Figure()}</g></svg>`,
      textZh: "厉衡想起师父的话，在雷霆几乎要脱手的最后一瞬，深吸一口气，把那份力量，重新收了回去——不是因为怕受罚，是他忽然清楚地意识到，这份力量，配不上，用在一时的怒气上。",
      textEn: "Remembering his master's words, in the final instant before the lightning would have loosed itself, Li Heng took a deep breath and drew the power back in \u2014 not out of fear of punishment, but a sudden, clear knowing that such power didn't deserve to be spent on a moment's anger." },
    { kickerZh: "六 · 力量的重新定义", kickerEn: "VI · Redefining Power", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="#0c0c1c"/>${ls2Wash([{x:150,y:100,rx:180,ry:120,color:'#c9c9ff',op:.3}])}<g transform="translate(150,180) scale(0.7)">${ls2Figure()}</g></svg>`,
      textZh: "厉衡终于明白，雷府历代真正被尊敬的强者，从不是那些出手最狠的人，而是那些，明明有能力毁灭一切，却始终，愿意先选择克制的人。",
      textEn: "Li Heng finally understood that the Thunder Hall's truly respected masters, across generations, were never those who struck hardest \u2014 but those who, capable of destroying everything, always chose restraint first." },
    { kickerZh: "七 · 雷术真正的境界", kickerEn: "VII · The Art's True Mastery", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/>${ls2Wash([{x:150,y:100,rx:170,ry:110,color:'#e8e8ff',op:.25}])}<g transform="translate(150,180) scale(0.65)">${ls2Figure()}</g></svg>`,
      textZh: "此后，厉衡的雷术，反而修得更加精进——他终于明白，真正的掌控，不是让雷霆随心所欲，是让自己的心，先稳得住那份足以毁灭一切的力量。",
      textEn: "From then on, Li Heng's mastery of the thunder technique deepened further \u2014 he finally understood that true control wasn't unleashing lightning at will. It was steadying one's own heart enough to hold power capable of destroying everything." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "雷府的新准则", tagEn: "The Thunder Hall's New Standard",
      art: `<svg viewBox="0 0 300 220">${LS2_DEFS}<rect width="300" height="220" fill="url(#ls2Sky)"/><g transform="translate(150,180) scale(0.6)">${ls2Figure()}</g></svg>`,
      textZh: "厉衡后来成了雷府掌门，定下新的准则：任何弟子出师前，必须先经历一场足以点燃怒火的考验，能否忍住不挥出雷霆，比雷霆本身的威力，更重要。",
      textEn: "Li Heng later became head of the Thunder Hall, establishing a new standard: before graduating, every disciple must face a trial designed to provoke fury. Whether they could hold back the lightning mattered more than the lightning's strength.",
      closingZh: "最难修的，从不是力量本身，是握着足以毁灭一切的力量，依然，选择不去挥出。",
      closingEn: "The hardest part was never mastering the power itself — it's holding power capable of destroying everything, and choosing not to unleash it." },
  ],
};

/* ---------- 乾坤袋：砺金环，空间法宝锻造题材，完整9页 ---------- */
const QK_DEFS = `<defs><filter id="qkG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="qkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0f08"/><stop offset="45%" stop-color="#3a2210"/><stop offset="100%" stop-color="#d8a24a"/></linearGradient>
  <radialGradient id="qkVoid" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a0f2a"/><stop offset="100%" stop-color="#3a2210" stop-opacity="0"/></radialGradient></defs>`;
function qkWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#qkG)"/>`).join('');}
function qkFigure(){const robe=`<path d="M-11 -28 Q0 -33 11 -28 L14 24 Q0 30 -14 24 Z" fill="#5a3a1e"/>`;const head=`<circle cx="0" cy="-34" r="7" fill="#241708"/>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.6s" repeatCount="indefinite"/>${robe}${head}</g>`;}
function qkPouch(open:boolean){const glow=open?`<circle cx="0" cy="0" r="14" fill="url(#qkVoid)"><animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/></circle>`:"";return `<g transform="translate(150,155)"><path d="M-16 -10 Q0 -22 16 -10 L14 18 Q0 26 -14 18 Z" fill="#8a5a2a" opacity=".85"/>${glow}</g>`;}
const QK_COVER = `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkWash([{x:150,y:140,rx:140,ry:60,color:'#d8a24a',op:.3}])}${qkPouch(true)}<g transform="translate(150,190) scale(0.5)">${qkFigure()}</g></svg>`;

const CRAFTING_THE_COSMOS_POUCH: IllustratedEntry = {
  slug: "crafting-the-cosmos-pouch",
  title: "乾坤袋",
  titleEn: "Crafting the Cosmos Pouch",
  cat: "field",
  teaser: "砺金环一位炼器师试图打造能装下万物的空间法宝，屡屡失败，直到她明白：能装下多少，从不取决于袋子有多大，取决于，使用者，能不能守住自己真正需要的分量。",
  teaserEn: "An artificer tries again and again to forge a pouch that can hold anything, only to learn: capacity was never about the size of the bag — it's whether the bearer can hold to what they truly need.",
  price: 9,
  cover: QK_COVER,
  pages: [
    { kickerZh: "一 · 传说中的法宝", kickerEn: "I · A Legendary Artifact", tagZh: "砺金环 · 炼器师", tagEn: "The Lijin Ring \u00b7 An Artificer",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkPouch(false)}<g transform="translate(150,190) scale(0.5)">${qkFigure()}</g></svg>`,
      textZh: "念澜是砺金环小有名气的炼器师，一心想复现失传已久的传说法宝——乾坤袋，据说袋口虽小，内里却能容纳万物，仿佛自成一方独立的空间。",
      textEn: "Nian Lan was a modestly known artificer on the Lijin Ring, determined to recreate a long-lost legendary artifact \u2014 the cosmos pouch, said to have a small opening yet hold anything within, as if containing its own independent space." },
    { kickerZh: "二 · 屡次爆裂", kickerEn: "II · Bursting Again and Again", tagZh: "困境", tagEn: "The Trouble",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="#241608"/>${qkWash([{x:150,y:110,rx:150,ry:90,color:'#3a2210',op:.7}])}<g transform="translate(150,190) scale(0.55)">${qkFigure()}</g></svg>`,
      textZh: "念澜用尽各种珍稀矿料，炼制的每一只袋子，一旦装入的东西超过某个临界值，便会毫无预兆地爆裂——她试了几十次，始终找不到问题的根源。",
      textEn: "Using every rare ore she could find, Nian Lan crafted pouch after pouch, only for each to burst without warning once its contents crossed some threshold. Dozens of attempts, and she still couldn't find the root cause." },
    { kickerZh: "三 · 老炼器师的疑问", kickerEn: "III · An Old Artificer's Question", tagZh: "转折的契机", tagEn: "A Chance to Reconsider",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.2}])}<g transform="translate(110,190) scale(0.45)">${qkFigure()}</g><g transform="translate(200,190) scale(0.4)"><path d="M-11 -28 Q0 -33 11 -28 L14 24 Q0 30 -14 24 Z" fill="#7a5a38"/><circle cx="0" cy="-34" r="7" fill="#3a2818"/></g></svg>`,
      textZh: "一位退隐的老炼器师问她：\u201c你有没有想过，法宝爆裂，或许不是因为袋子不够坚固，而是因为，使用的人，装了太多，自己其实并不真正需要的东西？\u201d",
      textEn: "A retired old artificer asked her: \u201cHave you considered that the artifact bursting might not mean the bag isn't sturdy enough \u2014 but that whoever carries it has stuffed in far more than they truly need?\u201d" },
    { kickerZh: "四 · 重新设计法宝", kickerEn: "IV · Redesigning the Artifact", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="#1a0f08"/>${qkWash([{x:150,y:110,rx:160,ry:100,color:'#3a2210',op:.7}])}<g transform="translate(150,190) scale(0.55)">${qkFigure()}</g></svg>`,
      textZh: "念澜受到启发，不再一味追求\u201c容量越大越好\u201d，而是在乾坤袋的核心，加入了一道能感知使用者心念的印记——如果心念贪多、堆积过甚，袋子便会主动收紧，而非被动地被撑爆。",
      textEn: "Inspired, Nian Lan stopped chasing ever-larger capacity, instead embedding a mark at the pouch's core that could sense the bearer's intent \u2014 if greed or excess accumulated, the pouch would deliberately tighten, rather than passively bursting." },
    { kickerZh: "五 · 一次真实的测试", kickerEn: "V · A Real Test", tagZh: "验证", tagEn: "Verification",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkWash([{x:150,y:100,rx:150,ry:70,color:'#d8a24a',op:.25}])}${qkPouch(true)}<g transform="translate(150,190) scale(0.55)">${qkFigure()}</g></svg>`,
      textZh: "念澜找来一位贪心的商人测试新法宝——那人一心想把所有值钱的东西都塞进去，袋子果然在他心念过贪的一瞬，微微收紧，温和地拒绝了继续容纳。",
      textEn: "Nian Lan found a greedy merchant to test the new artifact \u2014 as he tried desperately to stuff in everything valuable he could, the pouch gently tightened the instant his intent grew too grasping, quietly refusing to hold more." },
    { kickerZh: "六 · 意外的效果", kickerEn: "VI · An Unexpected Effect", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="#0c0400"/>${qkWash([{x:150,y:100,rx:180,ry:120,color:'#ffdf9e',op:.3}])}${qkPouch(true)}<g transform="translate(150,190) scale(0.6)">${qkFigure()}</g></svg>`,
      textZh: "反而是一位只想带上几件真正珍视之物的旅人使用时，袋子异常\u201c听话\u201d，甚至能容纳下远超预期的分量——念澜终于确认，能装下多少，从来不取决于袋子的大小，是使用者心念的清明与否。",
      textEn: "When a traveler who only wanted to carry a few truly cherished things used it, the pouch proved remarkably obliging, holding far more than expected \u2014 Nian Lan finally confirmed: capacity never depended on the bag's size, but the clarity of the bearer's intent." },
    { kickerZh: "七 · 法宝的真正意义", kickerEn: "VII · The Artifact's True Meaning", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkPouch(true)}<g transform="translate(150,190) scale(0.6)">${qkFigure()}</g></svg>`,
      textZh: "念澜明白，乾坤袋从不是一件单纯的储物法宝，它其实，也是一面镜子——照出使用者，到底是清楚自己真正需要什么，还是，一味贪多，想要囊括一切。",
      textEn: "Nian Lan understood: the cosmos pouch was never merely a storage artifact \u2014 it was also a mirror, reflecting whether its bearer truly knew what they needed, or simply grasped for everything out of greed." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "流传后世的法宝", tagEn: "An Artifact Passed Down",
      art: `<svg viewBox="0 0 300 220">${QK_DEFS}<rect width="300" height="220" fill="url(#qkSky)"/>${qkPouch(false)}<g transform="translate(150,190) scale(0.5)">${qkFigure()}</g></svg>`,
      textZh: "念澜炼制的乾坤袋，后来成了砺金环最受推崇的法宝，每一位得到它的人，都会先收到一句提醒：\u201c它能装下多少，取决于你，能不能先守住自己真正需要的分量。\u201d",
      textEn: "The cosmos pouch Nian Lan crafted became the most revered artifact on the Lijin Ring, and everyone who received one was first given a reminder: \u201cHow much it holds depends on whether you can first hold to what you truly need.\u201d",
      closingZh: "能装下多少，从不取决于袋子有多大，取决于，使用者，能不能守住自己真正需要的分量。",
      closingEn: "Capacity was never about the size of the bag — it's whether the bearer can hold to what they truly need." },
  ],
};

/* ---------- 天眼通：甄墟星带，灵视/戒律题材，完整9页 ---------- */
const TY_DEFS = `<defs><filter id="tyG"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="tySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#020610"/><stop offset="60%" stop-color="#0a1830"/><stop offset="100%" stop-color="#1a3a5a"/></linearGradient></defs>`;
function tyWash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#tyG)"/>`).join('');}
function tyFigure(open:boolean){const robe=`<path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#0e0a1c"/>`;const head=`<circle cx="0" cy="-38" r="8" fill="#12102a"/>`;const eye=open?`<ellipse cx="0" cy="-46" rx="5" ry="2.5" fill="#9be8ff" opacity=".8"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite"/></ellipse>`:"";return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${robe}${head}${eye}</g>`;}
const TY_COVER = `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="url(#tySky)"/>${tyWash([{x:150,y:100,rx:150,ry:70,color:'#1a3a5a',op:.5}])}<g transform="translate(150,170) scale(0.55)">${tyFigure(true)}</g></svg>`;

const HEAVENLY_EYE: IllustratedEntry = {
  slug: "the-heavenly-eye",
  title: "天眼通",
  titleEn: "The Heavenly Eye",
  cat: "sovereign",
  teaser: "甄墟星带一位急于求成的年轻遥视者，强行催开天眼，看见了太多本不该由他此刻承担的画面——真正的灵视，从不是看得越多越好，是看得清，自己能不能承受。",
  teaserEn: "A young remote viewer forces open his inner eye too soon, seeing far more than he's ready to carry. True sight was never about seeing as much as possible — it's seeing clearly what you can actually bear.",
  price: 9,
  cover: TY_COVER,
  pages: [
    { kickerZh: "一 · 急于求成的弟子", kickerEn: "I · An Impatient Disciple", tagZh: "甄墟星带", tagEn: "The Zhenxu Belt",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="url(#tySky)"/><g transform="translate(150,170) scale(0.55)">${tyFigure(false)}</g></svg>`,
      textZh: "顾清是遥视者公会新入门的弟子，眼看同门一个个陆续开启天眼、能力精进，自己却迟迟没有动静，心里越来越焦躁。",
      textEn: "Gu Qing was a new disciple at the remote viewers' guild. Watching peer after peer awaken their inner eye and advance, while he remained stuck, made him increasingly anxious." },
    { kickerZh: "二 · 一本禁忌的秘法", kickerEn: "II · A Forbidden Method", tagZh: "诱惑", tagEn: "Temptation",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="#020610"/>${tyWash([{x:150,y:110,rx:150,ry:90,color:'#0a1830',op:.7}])}<g transform="translate(150,170) scale(0.6)">${tyFigure(false)}</g></svg>`,
      textZh: "顾清偶然得到一本记载着\u201c强行催眼秘法\u201d的古籍，明知公会明令禁止此类速成之法，还是没能抵住诱惑，决定私下尝试。",
      textEn: "Gu Qing stumbled upon an ancient text recording a forbidden method for forcibly awakening the inner eye. Knowing full well the guild strictly forbade such shortcuts, he couldn't resist the temptation and decided to try it in secret." },
    { kickerZh: "三 · 强行催开", kickerEn: "III · Forcing It Open", tagZh: "冲突", tagEn: "Conflict",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="#03060e"/>${tyWash([{x:150,y:100,rx:180,ry:120,color:'#1a3a5a',op:.6}])}<g transform="translate(150,170) scale(0.65)">${tyFigure(true)}</g></svg>`,
      textZh: "秘法奏效了，顾清的天眼，在剧痛中骤然睁开——可紧接着，无数画面，不分远近、不分轻重，如潮水般，一齐涌进他的意识。",
      textEn: "The method worked. Gu Qing's inner eye snapped open amid searing pain \u2014 but immediately, countless images, near and far, trivial and profound, surged into his mind all at once, like a flood." },
    { kickerZh: "四 · 无法承受的洪流", kickerEn: "IV · An Unbearable Flood", tagZh: "危机", tagEn: "The Crisis",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="#020610"/>${tyWash([{x:150,y:110,rx:160,ry:100,color:'#0a1830',op:.8}])}<g transform="translate(150,170) scale(0.65) rotate(3)">${tyFigure(true)}</g></svg>`,
      textZh: "他看见了远方陌生人的秘密，看见了同门私下的算计，甚至看见了一些，连他自己都还没准备好面对的、关于未来的模糊画面——过量的信息，几乎将他的心神彻底击溃。",
      textEn: "He saw strangers' secrets from far away, saw fellow disciples' private schemes, even glimpsed hazy visions of a future he wasn't ready to face \u2014 the sheer overload of information nearly shattered his mind entirely." },
    { kickerZh: "五 · 长老的紧急救治", kickerEn: "V · The Elder's Emergency Aid", tagZh: "转折", tagEn: "Turning Point",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="url(#tySky)"/>${tyWash([{x:150,y:100,rx:150,ry:70,color:'#9be8ff',op:.2}])}<g transform="translate(110,170) scale(0.5)">${tyFigure(true)}</g><g transform="translate(200,175) scale(0.45)"><path d="M-11 -32 Q0 -38 11 -32 L15 26 Q0 34 -15 26 Z" fill="#1a1830"/><circle cx="0" cy="-38" r="8" fill="#12102a"/></g></svg>`,
      textZh: "公会长老及时发现异样，赶来为他强行封住天眼，才堪堪保住他的神智。长老痛心道：\u201c天眼从不是开得越早、看得越多越好，是要与你的心性、你的承受力，一并成长的。\u201d",
      textEn: "A guild elder noticed the disturbance in time and rushed to seal his inner eye by force, barely preserving his sanity. Grieved, the elder said: \u201cThe inner eye was never meant to open early or see as much as possible \u2014 it must grow alongside your character, your capacity to bear what you see.\u201d" },
    { kickerZh: "六 · 重新学起", kickerEn: "VI · Starting Over", tagZh: "反思", tagEn: "Reflection",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="#03060e"/>${tyWash([{x:150,y:110,rx:160,ry:100,color:'#0a1830',op:.75}])}<g transform="translate(150,170) scale(0.6)">${tyFigure(false)}</g></svg>`,
      textZh: "顾清休养了整整半年，才慢慢恢复。他终于明白，自己当初急于开眼，从不是真心想要看清世界，只是害怕，落后于同门。",
      textEn: "Gu Qing spent half a year recovering. He finally understood that his rush to open the eye had never truly been about wanting to see the world clearly \u2014 only fear of falling behind his peers." },
    { kickerZh: "七 · 循序渐进的重启", kickerEn: "VII · A Gradual Restart", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="url(#tySky)"/>${tyWash([{x:150,y:100,rx:170,ry:110,color:'#9be8ff',op:.25}])}<g transform="translate(150,170) scale(0.65)">${tyFigure(true)}</g></svg>`,
      textZh: "他重新按照正统心法，一步一步修行，天眼再次睁开的那一刻，涌入的画面依然很多，可这一次，他的心神，第一次，能够从容地，一一分辨、承接。",
      textEn: "He began training again, strictly by the proper method, step by step. When his inner eye reopened, the images still came in abundance \u2014 but this time, for the first time, his mind could calmly discern and hold each one." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "对新弟子的告诫", tagEn: "A Warning for New Disciples",
      art: `<svg viewBox="0 0 300 220">${TY_DEFS}<rect width="300" height="220" fill="url(#tySky)"/><g transform="translate(150,170) scale(0.55)">${tyFigure(true)}</g></svg>`,
      textZh: "顾清后来常对急于求成的新弟子说：\u201c天眼看得再远，也得先问问自己的心，能不能，稳稳地，接住看见的一切。\u201d",
      textEn: "Gu Qing later often told impatient new disciples: \u201cHowever far the inner eye can see, first ask your own heart whether it can steadily hold everything it beholds.\u201d",
      closingZh: "真正的灵视，从不是看得越多越好，是看得清，自己能不能承受。",
      closingEn: "True sight was never about seeing as much as possible — it's seeing clearly what you can actually bear." },
  ],
};

/* ---------- 心脉相干：焕蜕星域，心脏神经学题材（基于真实心脑研究），完整9页 ---------- */
const XM2_DEFS = `<defs><filter id="xm2G"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="xm2Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#160a1c"/><stop offset="45%" stop-color="#3a1a3a"/><stop offset="80%" stop-color="#c77d9c"/><stop offset="100%" stop-color="#f2d0c4"/></linearGradient></defs>`;
function xm2Wash(l:{x:number;y:number;rx:number;ry:number;color:string;op:number}[]){return l.map(c=>`<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="${c.color}" opacity="${c.op}" filter="url(#xm2G)"/>`).join('');}
function xm2Figure(coherent:boolean){const robe=`<path d="M-11 -32 Q0 -37 11 -32 L14 24 Q0 30 -14 24 Z" fill="#3a1a3a"/>`;const head=`<circle cx="0" cy="-38" r="7" fill="#241220"/>`;const pulse=coherent?`<circle cx="0" cy="-8" r="22" fill="none" stroke="#f2d0c4" stroke-width="1.4" opacity=".7"><animate attributeName="r" values="16;28;16" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".4;.8;.4" dur="3.4s" repeatCount="indefinite"/></circle>`:`<circle cx="0" cy="-8" r="18" fill="none" stroke="#c77d9c" stroke-width="1.4" opacity=".5"><animate attributeName="r" values="12;24;10;20;14" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".3;.6;.2;.5;.3" dur="1.6s" repeatCount="indefinite"/></circle>`;return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>${pulse}${robe}${head}</g>`;}
const XM2_COVER = `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/>${xm2Wash([{x:150,y:110,rx:150,ry:90,color:'#c77d9c',op:.3}])}<g transform="translate(150,155) scale(0.6)">${xm2Figure(true)}</g></svg>`;

const HEART_MIND_COHERENCE: IllustratedEntry = {
  slug: "heart-mind-coherence",
  title: "心脉相干",
  titleEn: "Heart-Mind Coherence",
  cat: "sovereign",
  teaser: "焕蜕星域一位修行者始终无法让心神安定，直到她发现：心脏本身，就是一颗独立运作的\u201c第二大脑\u201d，情绪紊乱时脉象散乱，心怀感激时，脉象却会自己，找回秩序。",
  teaserEn: "A practitioner struggles for years to steady her mind, until she discovers the heart itself functions as an independent second brain — chaotic in turmoil, yet finding order again the moment gratitude enters.",
  price: 9,
  cover: XM2_COVER,
  pages: [
    { kickerZh: "一 · 静不下来的修行者", kickerEn: "I · A Practitioner Who Couldn't Settle", tagZh: "焕蜕星域", tagEn: "Huantui Domain",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/><g transform="translate(150,155) scale(0.6)">${xm2Figure(false)}</g></svg>`,
      textZh: "阮溪修习各类心法多年，脑子里的杂念却始终挥之不去——每次打坐，思绪都像一团乱麻，越想静下来，反而越是烦躁。",
      textEn: "Ruan Xi had practiced meditation for years, yet her scattered thoughts never quieted \u2014 every sitting felt like tangled thread, and the harder she tried to settle, the more restless she grew." },
    { kickerZh: "二 · 一份古老的记录", kickerEn: "II · An Ancient Record", tagZh: "发现", tagEn: "The Discovery",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="#1c0c1c"/>${xm2Wash([{x:150,y:110,rx:150,ry:90,color:'#3a1a3a',op:.7}])}<g transform="translate(150,155) scale(0.6)">${xm2Figure(false)}</g></svg>`,
      textZh: "她在藏经阁翻到一份记录，上面写着：心脏从不只是一具泵血的器官，而是拥有自己独立神经网络的\u201c第二大脑\u201d，能感知、能记忆，甚至，能反过来影响头脑的思绪。",
      textEn: "In the archive, she found a record stating that the heart was never merely an organ pumping blood \u2014 it possessed its own independent neural network, a \u201csecond brain,\u201d capable of sensing, remembering, and even shaping the mind's thoughts in return." },
    { kickerZh: "三 · 脉象与心绪的关联", kickerEn: "III · The Link Between Pulse and Mood", tagZh: "探索", tagEn: "Exploration",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/>${xm2Wash([{x:150,y:100,rx:150,ry:70,color:'#c77d9c',op:.25}])}<g transform="translate(150,155) scale(0.6)">${xm2Figure(false)}</g></svg>`,
      textZh: "记录里写道：每一次心跳的间隔，其实并不完全相同，这份细微的起伏，被称为\u201c脉息变异\u201d，会随着情绪剧烈波动——愤怒、焦虑时，脉息紊乱、毫无章法；心怀感激、平和时，脉息却会呈现出一种，近乎规律波纹的秩序。",
      textEn: "The record explained: the interval between heartbeats was never perfectly uniform \u2014 this subtle variation, called pulse variability, fluctuated with emotion. In anger or anxiety, the pulse grew chaotic, formless; in gratitude and calm, it settled into an almost wave-like order." },
    { kickerZh: "四 · 第一次尝试", kickerEn: "IV · The First Attempt", tagZh: "尝试", tagEn: "A New Attempt",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="#160a1c"/>${xm2Wash([{x:150,y:110,rx:160,ry:100,color:'#3a1a3a',op:.7}])}<g transform="translate(150,155) scale(0.6)">${xm2Figure(false)}</g></svg>`,
      textZh: "阮溪照着记录尝试：不再一味强迫头脑安静，而是把注意力，转移到胸口心脏的位置，缓慢地、有意识地，让呼吸仿佛透过心脏，一进一出。",
      textEn: "Ruan Xi tried it herself: instead of forcing her mind to quiet, she shifted her attention to her chest, breathing slowly and deliberately, as if the breath itself moved in and out through her heart." },
    { kickerZh: "五 · 唤起真心的情感", kickerEn: "V · Summoning Genuine Feeling", tagZh: "关键步骤", tagEn: "The Key Step",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/>${xm2Wash([{x:150,y:100,rx:150,ry:70,color:'#f2d0c4',op:.2}])}<g transform="translate(150,155) scale(0.6)">${xm2Figure(true)}</g></svg>`,
      textZh: "记录特别强调：光是把注意力放在心脏还不够，还要真心唤起一份具体的、温暖的情感——阮溪试着，回想起小时候母亲替她扎头发时，那份专注而温柔的画面，一份由衷的感激，缓缓在心口漾开。",
      textEn: "The record emphasized: attention alone wasn't enough \u2014 one had to genuinely summon a specific, warm emotion. Ruan Xi recalled her mother braiding her hair as a child, that focused, gentle care, and a sincere gratitude slowly rippled through her chest." },
    { kickerZh: "六 · 脉象归于秩序", kickerEn: "VI · The Pulse Finds Order", tagZh: "高潮", tagEn: "Climax",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="#140812"/>${xm2Wash([{x:150,y:100,rx:180,ry:120,color:'#f2d0c4',op:.3}])}<g transform="translate(150,155) scale(0.7)">${xm2Figure(true)}</g></svg>`,
      textZh: "几乎是同一瞬间，阮溪感到胸口那种烦躁的紊乱感，缓缓平息，取而代之的，是一种规律、绵长、近乎水波般起伏的安定感——脑海里纠缠多年的杂念，也第一次，随之，安静了下来。",
      textEn: "Almost instantly, Ruan Xi felt the restless turmoil in her chest ease, replaced by a steady, rhythmic sense of stability, like slow, rolling waves \u2014 and for the first time, the tangled thoughts that had plagued her mind for years grew quiet too." },
    { kickerZh: "七 · 心脑同频的领悟", kickerEn: "VII · Understanding Heart-Mind Synchrony", tagZh: "顿悟", tagEn: "Realization",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/><g transform="translate(150,155) scale(0.6)">${xm2Figure(true)}</g></svg>`,
      textZh: "阮溪终于明白，自己这些年，一直试图用\u201c头脑压制头脑\u201d的方式求静，方向从一开始，就错了——心脏才是那把真正的钥匙，心脉一旦归于秩序，头脑的清明，会自然而然地跟上。",
      textEn: "Ruan Xi finally understood: all those years, she'd tried to quiet her mind by forcing the mind itself \u2014 the wrong direction from the start. The heart was the true key. Once its rhythm found order, the mind's clarity naturally followed." },
    { kickerZh: "尾声", kickerEn: "Epilogue", tagZh: "传授给后来者", tagEn: "Passing It On",
      art: `<svg viewBox="0 0 300 220">${XM2_DEFS}<rect width="300" height="220" fill="url(#xm2Sky)"/><g transform="translate(150,155) scale(0.6)">${xm2Figure(true)}</g></svg>`,
      textZh: "阮溪后来把这份体悟，整理成焕蜕星域新弟子的入门第一课，她常说：\u201c别急着压住脑子里的念头，先把心，安顿好，脑子自然会跟上来。\u201d",
      textEn: "Ruan Xi later distilled this understanding into the very first lesson for Huantui's new disciples, often saying: \u201cDon't rush to suppress the thoughts in your head. Settle your heart first, and your mind will naturally follow.\u201d",
      closingZh: "心脏从不只是一具泵血的器官，情绪紊乱时脉象散乱，心怀感激时，脉象自会，找回秩序。",
      closingEn: "The heart was never merely an organ pumping blood — chaotic in turmoil, it finds its own order again the moment gratitude enters." },
  ],
};

export const ILLUSTRATED_NARRATIVES: IllustratedEntry[] = [FEATHER_VIGIL, SPACE_BETWEEN_BREATHS, MANIFESTATION_WARDEN, FREQUENCY_BETROTHAL, XIMING_DEPTHS, ECHO_STRATA, THE_PROOFREADER, WEIGHT_OF_INSTANT_WISH, MIRAGE_RETURN, THREE_EPOCHS_ECHO, CHAOJIAN, YANZHOU_PACT, RETURN_TO_ZERO, EYE_OF_OBSERVATION, WING_TONGUE, COCOON_OF_HABIT, DREAM_READER, XIHENG_FIRST_MISTAKE, FAMILY_FEAST, SPLIT_RING, HUIJIAO_COMING_OF_AGE, HEART_OF_THE_FIELD, WAYFARERS_COORDINATES, FIRST_EPOCH_TESTIMONY, INTUITIVE_WAY, ASCENDING_HEART_SUTRA, FALCON_ORIGIN, BORROWED_FACE, SHELL_OF_ACHIEVEMENT, ONE_OUTSIDE_THE_FORGE, CROSSING_THE_LINE, THE_MISTAKEN_GOD, THE_SLOWED_GIFT, HEART_AS_GATEWAY, SECOND_EPOCH_CONFESSION, SILENT_CONCERT_HALL, ROOTS_OF_RAGE, FREE_WILL_PARADOX, SHADOW_OF_TOMORROW, TIDE_TRADE, COUNTERFEIT_INSPIRATION, DANCE_OF_TRIPLE_GRAVITY, APPRENTICES_CHOICE, LATE_BLOOMING_VEIN, CHANG_YANS_LAST_STOP, MIRROR_IN_THE_MIRROR, RIVER_OF_FORGETTING, EVERYTHING_HAS_A_CRACK, WHO_OBSERVES_THE_OBSERVER, ONE_WHO_CHOSE_TO_STOP, OUTSIDE_THE_FIELD, THE_DEATH_OBSERVER, TIME_IS_NOT_A_RIVER, BETWEEN_TWO_HEARTBEATS, SHRINKING_THE_EARTH, EARTH_DIVING_TECHNIQUE, THUNDER_TECHNIQUE, CRAFTING_THE_COSMOS_POUCH, HEAVENLY_EYE, HEART_MIND_COHERENCE];

export function getIllustrated(slug: string) {
  return ILLUSTRATED_NARRATIVES.find((n) => n.slug === slug);
}
