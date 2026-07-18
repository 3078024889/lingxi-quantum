export type TarotCard = {
  key: string;
  nameZh: string; nameEn: string;
  glyph: string; // 简单符号，配合卡面视觉
  meaningZh: string; meaningEn: string;
  // 配色主题（两个颜色做渐变/光晕）+ 图腾类型（对应 TarotCardArt.tsx
  // 里的简单符号图形）——让22张牌各自有可辨识的视觉身份，不是同一个
  // 卡壳换个数字。配色大致对应塔罗传统里每张牌关联的元素/星体：
  // 火（琥珀/玫瑰）、水（青绿/靛蓝）、土（金/绿）、风（紫罗兰/银）。
  theme: { c1: string; c2: string; icon: TarotIcon };
};

export type TarotIcon =
  | "trail" | "infinity" | "crescent" | "bloom" | "throne" | "pillars" | "venn"
  | "chariot" | "wave" | "lantern" | "wheel" | "scales" | "invert" | "spiral"
  | "streams" | "invertTriangle" | "lightning" | "starburst" | "moon" | "sunrays"
  | "trumpet" | "wreath";

// 大阿尔卡那22张——每日一卡只用这22张（不含小阿尔卡那56张），是塔罗
// 里最常见的"每日一卡"做法，牌义也更容易讲清楚，不需要区分花色。
export const TAROT_MAJOR_ARCANA: TarotCard[] = [
  { key: "fool", nameZh: "愚者", nameEn: "The Fool", glyph: "0", meaningZh: "一个全新的开始，还没有被过去的经验限定住。今天适合往前迈一步，哪怕还看不清落脚点在哪。", meaningEn: "A fresh start, not yet shaped by past experience. Today favors taking a step forward, even before you can see exactly where you'll land.", theme: { c1: "#E8B765", c2: "#FF8FD1", icon: "trail" } },
  { key: "magician", nameZh: "魔术师", nameEn: "The Magician", glyph: "I", meaningZh: "你已经拥有需要的一切工具，缺的不是资源，是把它们摆到一起、真正开始用的那个决定。", meaningEn: "You already have every tool you need. What's missing isn't resources — it's the decision to bring them together and actually begin.", theme: { c1: "#C79CFF", c2: "#8CD2FF", icon: "infinity" } },
  { key: "high-priestess", nameZh: "女祭司", nameEn: "The High Priestess", glyph: "II", meaningZh: "有些答案，今天不在外面找得到，是需要安静下来，听自己内在已经知道的那个声音。", meaningEn: "Some answers aren't out there to be found today — they're already known within, waiting for enough quiet to be heard.", theme: { c1: "#7CE0D3", c2: "#5B7FE0", icon: "crescent" } },
  { key: "empress", nameZh: "女皇", nameEn: "The Empress", glyph: "III", meaningZh: "滋养、丰盛、创造力正在流动的一天。今天适合照顾自己或身边的人，而不是逼自己完成什么。", meaningEn: "A day of nourishment, abundance, and flowing creativity. Today favors caring for yourself or someone close, rather than pushing to finish something.", theme: { c1: "#7FE7C4", c2: "#E8B765", icon: "bloom" } },
  { key: "emperor", nameZh: "皇帝", nameEn: "The Emperor", glyph: "IV", meaningZh: "结构和边界今天会帮到你，而不是限制你。适合把一件事的规则定清楚，而不是先冲了再说。", meaningEn: "Structure and boundaries help you today rather than hold you back. A good day to define the rules of something clearly before diving in.", theme: { c1: "#E8B765", c2: "#C79CFF", icon: "throne" } },
  { key: "hierophant", nameZh: "教皇", nameEn: "The Hierophant", glyph: "V", meaningZh: "今天更适合参考已经被验证过的方法，而不是从零发明一套。传统或前人的经验，值得多看一眼。", meaningEn: "Today favors leaning on methods already proven to work rather than reinventing from scratch. Tradition or someone else's experience is worth a second look.", theme: { c1: "#D8CDFF", c2: "#E8B765", icon: "pillars" } },
  { key: "lovers", nameZh: "恋人", nameEn: "The Lovers", glyph: "VI", meaningZh: "一个关于选择、也关于连接的日子。今天面对的选项，可能没有绝对正确的一个，重要的是它是不是真的对齐你的价值观。", meaningEn: "A day about choice, and about connection. The options in front of you today may have no single \"correct\" answer — what matters is whether it truly aligns with your values.", theme: { c1: "#FF8FD1", c2: "#E8B765", icon: "venn" } },
  { key: "chariot", nameZh: "战车", nameEn: "The Chariot", glyph: "VII", meaningZh: "两股方向不同的力量，今天需要你去驾驭、而不是选边站。专注和意志力，是今天最需要的东西。", meaningEn: "Two forces pulling in different directions today need steering, not picking a side. Focus and willpower are what today calls for.", theme: { c1: "#8CD2FF", c2: "#C79CFF", icon: "chariot" } },
  { key: "strength", nameZh: "力量", nameEn: "Strength", glyph: "VIII", meaningZh: "真正的力量今天不是靠强攻，是靠温柔而坚定的坚持。对自己、对别人，都不需要用蛮力。", meaningEn: "Real strength today isn't force — it's gentle, steady persistence. No need for brute force, with yourself or with anyone else.", theme: { c1: "#E8B765", c2: "#FF8FD1", icon: "wave" } },
  { key: "hermit", nameZh: "隐士", nameEn: "The Hermit", glyph: "IX", meaningZh: "今天更适合往内走，而不是往外求。一个人安静待一会儿，可能比找人商量更有用。", meaningEn: "Today favors turning inward rather than seeking answers from outside. A little quiet solitude may serve you better than asking around.", theme: { c1: "#E8B765", c2: "#7CE0D3", icon: "lantern" } },
  { key: "wheel", nameZh: "命运之轮", nameEn: "Wheel of Fortune", glyph: "X", meaningZh: "有些事情今天不在你的掌控范围里，这是提醒你放松抓握，而不是更用力去控制。", meaningEn: "Some things today are simply outside your control — a reminder to loosen your grip rather than tighten it.", theme: { c1: "#C79CFF", c2: "#E8B765", icon: "wheel" } },
  { key: "justice", nameZh: "正义", nameEn: "Justice", glyph: "XI", meaningZh: "今天适合把话说清楚、把账算明白。公平不是别人给的，是你今天愿不愿意先诚实面对。", meaningEn: "Today favors saying things plainly and settling accounts clearly. Fairness isn't handed to you — it starts with your own honesty today.", theme: { c1: "#8CD2FF", c2: "#D8CDFF", icon: "scales" } },
  { key: "hanged-man", nameZh: "倒吊人", nameEn: "The Hanged Man", glyph: "XII", meaningZh: "换一个角度看同一件事，今天可能会看到完全不同的答案。暂停，有时候比继续推进更有用。", meaningEn: "Looking at the same thing from a different angle may reveal a completely different answer today. Pausing can sometimes serve you better than pushing on.", theme: { c1: "#7CE0D3", c2: "#C79CFF", icon: "invert" } },
  { key: "death", nameZh: "死神", nameEn: "Death", glyph: "XIII", meaningZh: "不是字面意义的坏事——是一个阶段真正结束了，才能给下一个阶段腾出空间。今天适合正式告别某件事。", meaningEn: "Not literal — a phase is genuinely ending, making room for the next one. Today is a good day to formally let something go.", theme: { c1: "#5B7FE0", c2: "#C79CFF", icon: "spiral" } },
  { key: "temperance", nameZh: "节制", nameEn: "Temperance", glyph: "XIV", meaningZh: "今天不需要走极端。把两个看起来矛盾的东西，慢慢调和在一起，比二选一更适合今天。", meaningEn: "No need for extremes today. Slowly blending two seemingly opposite things serves you better than picking one over the other.", theme: { c1: "#7CE0D3", c2: "#FF8FD1", icon: "streams" } },
  { key: "devil", nameZh: "恶魔", nameEn: "The Devil", glyph: "XV", meaningZh: "今天适合诚实面对一个自己一直不太想承认的执念或习惯——看清它，是松开它的第一步。", meaningEn: "Today favors being honest about a habit or attachment you haven't wanted to admit to. Seeing it clearly is the first step to loosening its grip.", theme: { c1: "#FF8FD1", c2: "#5B7FE0", icon: "invertTriangle" } },
  { key: "tower", nameZh: "高塔", nameEn: "The Tower", glyph: "XVI", meaningZh: "一个建立在不稳固基础上的东西，今天可能会松动。这不是惩罚，是给你机会，重新建一个更结实的。", meaningEn: "Something built on shaky ground may come loose today. Not a punishment — a chance to rebuild something sturdier.", theme: { c1: "#FF8FD1", c2: "#E8B765", icon: "lightning" } },
  { key: "star", nameZh: "星星", nameEn: "The Star", glyph: "XVII", meaningZh: "经历过低谷之后的一点希望和平静，今天比较容易被感受到。允许自己相信事情会慢慢好起来。", meaningEn: "A little hope and calm after a hard stretch is easier to feel today. Let yourself believe things are slowly getting better.", theme: { c1: "#7CE0D3", c2: "#D8CDFF", icon: "starburst" } },
  { key: "moon", nameZh: "月亮", nameEn: "The Moon", glyph: "XVIII", meaningZh: "今天有些事情可能看不太清楚，感觉比逻辑更可靠一些。不确定的时候，先别急着下结论。", meaningEn: "Some things may not be fully clear today — instinct may serve better than logic. When uncertain, hold off on conclusions.", theme: { c1: "#5B7FE0", c2: "#7CE0D3", icon: "moon" } },
  { key: "sun", nameZh: "太阳", nameEn: "The Sun", glyph: "XIX", meaningZh: "清晰、活力、被看见的一天。今天适合把一直藏着的东西，拿到阳光下让别人也看见。", meaningEn: "A day of clarity, vitality, and being seen. Today favors bringing something you've kept hidden out into the light.", theme: { c1: "#E8B765", c2: "#FF8FD1", icon: "sunrays" } },
  { key: "judgement", nameZh: "审判", nameEn: "Judgement", glyph: "XX", meaningZh: "回头看一段过去，今天可能会有新的理解——不是为了评判自己，是为了带着这份理解往前走。", meaningEn: "Looking back at something past may bring new understanding today — not to judge yourself, but to carry that understanding forward.", theme: { c1: "#C79CFF", c2: "#8CD2FF", icon: "trumpet" } },
  { key: "world", nameZh: "世界", nameEn: "The World", glyph: "XXI", meaningZh: "一个完整的循环走到了收尾，值得停下来认可自己走过的这一程，再开始下一个。", meaningEn: "A full cycle is coming to a close — worth pausing to acknowledge how far you've come before starting the next one.", theme: { c1: "#7FE7C4", c2: "#C79CFF", icon: "wreath" } },
];
