export type Gate = {
  id: string;
  title: string;
  titleEn: string;
  glyph: string;
  image: string | null; // null 表示用矢量网格组件
  line: string;
  lineEn: string;
  intro: string;
  introEn: string;
  prompts: string[]; // 邀请池：页面每次随机抽 3 句
  promptsEn?: string[];
};

export const gates: Gate[] = [
  {
    id: "origin",
    // v273：门名从「出身」改为「来处」。「出身」在中文里带阶层含义
    // （出身好／出身不好），用户一进门就先被戳一下；而这道门的引言
    // 说的其实是「你来自哪里」，是来处，不是身份。「来处」更轻、更准，
    // 也与最后一道门「扎根」成对：来处是给定的，扎根是选的。
    // 路由 id 保留 origin 不动，已收录链接不受影响。
    title: "来处",
    titleEn: "Origin",
    glyph: "源",
    image: null,
    line: "你来自哪里，从不决定你能去到哪里。",
    lineEn: "Where you come from never decides where you can go.",
    intro:
      "来处是起点坐标，不是边界。早年被放在哪里、被反复告知你是谁，会变成一套默认设置——它不像限制，它像事实，所以很难被看见。这道门做的事只有一件：把「我从哪里来」和「我能去到哪里」分开。看清那套设置从谁那里来，你就不必再替它继续运行下去。",
    introEn:
      "Where you come from is a starting coordinate, not a boundary. Where you were placed early on, and what you were repeatedly told you were, becomes a set of defaults — it doesn't feel like a limit, it feels like fact, which is why it stays unseen. This gate does one thing: it separates where I came from from where I can go. Once you see whose settings these were, you no longer have to keep running them.",
    prompts: [
      "如果出身不再定义我，我会如何描述此刻的自己？",
      "我从家族那里继承的信念里，哪些是我真正想保留的？",
      "本源的我，本来就拥有的是什么？",
      "若我先于一切标签而存在，那个「我」是什么样子？",
      "哪一条「我从哪里来」的旧故事，今天可以松开了？",
      "如果起点只是坐标、不是边界，我想往哪里走？",
      "我愿意把哪一份家族的爱，继续带在身上？",
      "此刻，我能感谢自己来路上的哪一段？",
      "回到本源的我，最想先放下的重量是什么？",
    ],
  },
  {
    id: "relation",
    title: "关系",
    titleEn: "Relationship",
    glyph: "络",
    image: null,
    line: "每一段连接，都是晶格里的一条共振线。",
    lineEn: "Every connection is a resonance line in the lattice.",
    intro:
      "在这道活的晶格中，你与每一个人、每一个生命都由共振线相连。关系不是占有，而是频率的相遇。当你回到自己的连贯与对齐，你周围的关系场会随之重新校准。",
    introEn:
      "In this living lattice, you are joined to every person and every life by lines of resonance. Relationship is not possession but a meeting of frequencies. When you return to your own coherence and alignment, the relational field around you retunes in kind.",
    prompts: [
      "我希望与重要的人之间，流动着怎样的频率？",
      "哪一段关系，正在邀请我先回到自己的中心？",
      "今天，我可以向谁传递一点真实的善意？",
      "如果每段连接都是共振，我此刻想调到哪个频率？",
      "哪一个人，值得我先在心里与之和解？",
      "我能在哪段关系里，少一点占有、多一点流动？",
      "此刻，我最想对谁说一句真心话？",
      "我愿意先给出怎样的对待，来吸引同频的相遇？",
      "哪一份界限，是我此刻需要温柔守住的？",
    ],
  },
  {
    id: "wealth",
    title: "金钱",
    titleEn: "Wealth",
    glyph: "流",
    image: null,
    line: "丰盛是一种对齐的状态，不是追逐的结果。",
    lineEn: "Abundance is a state of alignment, not the fruit of chasing.",
    intro:
      "金钱是能量的流动，是覆盖整个地球的能量网格中的一条金色之流。丰盛不来自追逐，而来自对齐——当你的存在状态与你想要的现实同频，物质层面的指引便会向你流来。",
    introEn:
      "Money is a flow of energy — a golden current within the energy grid that covers the whole Earth. Abundance comes not from chasing but from alignment: when your state of being shares a frequency with the reality you want, material guidance flows toward you.",
    prompts: [
      "进入「已经丰盛」的状态，此刻的我有什么感受？",
      "如果金钱只是流动的能量，我愿意如何与它共处？",
      "我今天可以为「已经拥有」的生活，做哪一件小事？",
      "当我不再追逐、只是对齐，丰盛会以什么方式靠近？",
      "哪一个关于「钱不够」的旧信念，今天可以改写？",
      "如果丰盛是一种状态，我现在就能选择它吗？",
      "我愿意以怎样的频率，去迎接那条金色之流？",
      "此刻，我能为之感恩的丰盛，已经有哪些？",
      "那个「已经富足的我」，今天会怎样度过这一天？",
    ],
  },
  {
    id: "health",
    title: "健康",
    titleEn: "Health",
    glyph: "息",
    image: null,
    line: "身体记得你忘记的一切，先回到呼吸里。",
    lineEn: "The body remembers all you forget; return first to the breath.",
    intro:
      "身体是你在物质维度的仪器，它忠实地记录着你的状态。回到呼吸，就是回到当下，回到那条连接地球核心与无限的垂直之线。健康，始于你愿意重新聆听身体。",
    introEn:
      "The body is your instrument in the material dimension, faithfully recording your state. To return to the breath is to return to the present — to that vertical line joining the Earth's core to the infinite. Health begins the moment you are willing to listen to the body again.",
    prompts: [
      "此刻，我的身体最想对我说什么？",
      "我可以用怎样的节奏，温柔地照顾这具仪器？",
      "进入「我是健康的」状态，我的一天会如何展开？",
      "如果回到呼吸就是回到当下，我现在愿意深呼吸几次吗？",
      "身体在用哪一种方式，提醒我慢下来？",
      "我能给自己哪一个微小而具体的善待？",
      "当我聆听而非对抗身体，它会引导我去哪里？",
      "今天，我想为这具身体补上的是什么？",
      "那条连接地心与无限的垂直之线，此刻感觉如何？",
    ],
  },
  {
    id: "mind",
    title: "心灵",
    titleEn: "Spirit",
    glyph: "忆",
    image: null,
    line: "向内探索，知晓内在全部真相。",
    lineEn: "Look within, and know the whole truth inside.",
    intro:
      "修炼的目的，是忆起本源自己，向内探索，知晓内在的全部真相。心灵不是要被修正的问题，而是等待被记起的家。在这道门里，你不向外求，只向内忆。",
    introEn:
      "The purpose of practice is to remember the source self — to look within and know the whole truth inside. The spirit is not a problem to be corrected but a home waiting to be remembered. In this gate, you do not seek outward; you only remember inward.",
    prompts: [
      "如果答案一直在我之内，我现在想问自己什么？",
      "哪一个长久以来的念头，可以在此刻被温柔放下？",
      "本源的我，一直都知道的真相是什么？",
      "此刻最吵的那个念头，它其实想保护我什么？",
      "如果向内就能抵达，我愿意先安静地待多久？",
      "我忘记了、却一直都拥有的，是哪一种力量？",
      "哪一个真相，我已经准备好对自己承认？",
      "当我不再向外求，内在最先浮现的是什么？",
      "今天，我想忆起的那个「家」，是什么感觉？",
    ],
  },
  {
    id: "destiny",
    // v273：门名从「命运」改为「扎根」。原因：「命运」暗示已被写定，
    // 与灵犀场「不做任何宿命预判」的立场冲突，也跟这道门自己的引言
    // （保持对齐、保持连贯）对不上——它讲的从来不是命运，是持续对齐。
    // 「扎根」与第一道门「来处」形成对照：来处是给定的，扎根是选的。
    // 路由 id 保留 destiny 不动，避免已收录的链接失效。
    title: "扎根",
    titleEn: "Rooting",
    glyph: "锚",
    image: null,
    line: "保持对齐，保持信任与连贯，显化便会发生。",
    lineEn: "Stay aligned, keep trust and coherence, and manifestation unfolds.",
    intro:
      "扎根，是你选择把自己立在哪里。来处是给定的，扎根不是——它是你此刻决定要对齐的那个方向，以及愿不愿意每天回到它上面。显化与时间无关，与连贯相关：不是等它来，是让每一步都从同一个地方出发。根扎得住，路自然长出来。",
    introEn:
      "Rooting is where you choose to stand. Where you came from was given; this is not — it is the direction you decide to align with now, and whether you return to it daily. Manifestation has nothing to do with time and everything to do with coherence: not waiting for it to arrive, but letting each step depart from the same place. Roots that hold, grow the path.",
    prompts: [
      "如果我完全信任正在展开的路径，下一步是什么？",
      "我愿意为之保持对齐的，是怎样的未来？",
      "今天，我可以如何活得更像那个已经到达的自己？",
      "当我把「掌控」换成「对齐」，会松开什么？",
      "那个已经显化的我，正过着怎样的生活？",
      "哪一处不连贯，正在等我重新校准？",
      "如果命运由我书写，我想写下的下一句是什么？",
      "我愿意信任的那个未知指引，此刻在说什么？",
      "保持信任与连贯，我今天先做哪一件对齐的小事？",
    ],
  },
];

export function getGate(id: string) {
  return gates.find((g) => g.id === id);
}
