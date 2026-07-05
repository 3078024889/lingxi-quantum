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

export const ILLUSTRATED_NARRATIVES: IllustratedEntry[] = [FEATHER_VIGIL, SPACE_BETWEEN_BREATHS, MANIFESTATION_WARDEN, FREQUENCY_BETROTHAL, XIMING_DEPTHS, ECHO_STRATA, THE_PROOFREADER, WEIGHT_OF_INSTANT_WISH];

export function getIllustrated(slug: string) {
  return ILLUSTRATED_NARRATIVES.find((n) => n.slug === slug);
}
