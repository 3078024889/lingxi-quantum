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
      textZh: "一位云游至此的旅人恰好路过——族人都叫他长晏，据说他走过很多星域，只在有人卡在坎上时，恰好出现。\n\n他看了折微练功片刻，只说了一句：\u201c你在跟那道隙较劲，可它从来不是用来\u2018跨过\u2019的，是用来\u2018待\u2019着的。\u201d",
      textEn: "A wandering traveler happened to pass through \u2014 the locals called him Chang Yan. They said he only appeared wherever someone was stuck at a threshold.\n\nHe watched Zhe Wei practice, then said only this: \u201cYou\u2019re wrestling with the gap. But it was never something to cross \u2014 it\u2019s something to stay in.\u201d",
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

export const ILLUSTRATED_NARRATIVES: IllustratedEntry[] = [FEATHER_VIGIL, SPACE_BETWEEN_BREATHS, MANIFESTATION_WARDEN, FREQUENCY_BETROTHAL, XIMING_DEPTHS, ECHO_STRATA, THE_PROOFREADER, WEIGHT_OF_INSTANT_WISH, MIRAGE_RETURN, THREE_EPOCHS_ECHO, CHAOJIAN, YANZHOU_PACT, RETURN_TO_ZERO, EYE_OF_OBSERVATION, WING_TONGUE, COCOON_OF_HABIT, DREAM_READER, XIHENG_FIRST_MISTAKE, FAMILY_FEAST, SPLIT_RING, HUIJIAO_COMING_OF_AGE, HEART_OF_THE_FIELD, WAYFARERS_COORDINATES, FIRST_EPOCH_TESTIMONY];

export function getIllustrated(slug: string) {
  return ILLUSTRATED_NARRATIVES.find((n) => n.slug === slug);
}
