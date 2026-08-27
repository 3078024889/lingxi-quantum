/**
 * Lingxi Copernican Dendrite Engine
 *
 * The Mini Program assessment is intentionally independent from the web
 * astronomical engine. It treats each answer as an observation that activates
 * one or more knowledge nodes; repeated co-activation grows weighted dendrite
 * edges, then a bounded propagation pass reveals the current structure.
 * No language model, random draw, horoscope, or prediction is involved.
 */

export type DendriteOption = { id: string; zh: string; en: string; activates: Record<string, number> };
export type DendriteQuestion = { id: string; zh: string; en: string; options: DendriteOption[] };
export type DendriteProduct = {
  productId: string; nameZh: string; nameEn: string; leadZh: string; leadEn: string;
  nodes: { id: string; zh: string; en: string }[];
  questions: DendriteQuestion[];
};

type ProductSeed = Omit<DendriteProduct, "questions"> & { prompts: Array<[string, string]> };

const seeds: ProductSeed[] = [
  { productId:"life-map-report", nameZh:"生命图谱", nameEn:"Life Blueprint", leadZh:"从现实选择中照见你的生命结构", leadEn:"See your life structure through lived choices", nodes:[
    {id:"origin",zh:"本源驱动",en:"Origin"},{id:"adaptation",zh:"适应模式",en:"Adaptation"},{id:"expression",zh:"表达路径",en:"Expression"},{id:"relation",zh:"关系位置",en:"Relating"},{id:"creation",zh:"创造方式",en:"Creation"},{id:"integration",zh:"整合能力",en:"Integration"}], prompts:[
      ["面对全新的环境，你通常先从哪里进入？","When entering a new environment, where do you begin?"],["重要选择出现时，什么最能让你确认方向？","What most helps you confirm an important direction?"],["被现实打断后，你通常怎样重新组织自己？","How do you reorganize after reality interrupts you?"],["什么状态最接近你真正有生命力的时候？","When do you feel most alive?"],["回看近一年，哪种模式最常重复？","Which pattern repeated most over the past year?"]]},
  { productId:"relationship-resonance", nameZh:"关系共振", nameEn:"Relationship Resonance", leadZh:"照见两个生命如何靠近、回应与形成边界", leadEn:"See how two lives approach, respond, and form boundaries", nodes:[
    {id:"approach",zh:"靠近方式",en:"Approach"},{id:"emotion",zh:"情感流动",en:"Emotion"},{id:"safety",zh:"安全感",en:"Safety"},{id:"boundary",zh:"边界",en:"Boundary"},{id:"repair",zh:"修复",en:"Repair"},{id:"co-create",zh:"共同创造",en:"Co-creation"}], prompts:[
      ["关系出现距离时，你最先注意到什么？","When distance appears, what do you notice first?"],["一次分歧之后，你更自然的回应是什么？","What is your natural response after disagreement?"],["你最容易通过什么感受到被重视？","How do you most readily feel valued?"],["关系需要前进时，你倾向承担哪个位置？","What role do you take when a relationship needs to move?"],["此刻这段连接最需要被看见的是什么？","What most needs to be seen in this connection now?"]]},
  { productId:"resilience-report", nameZh:"生命韧性指数", nameEn:"Life Resilience Index", leadZh:"照见变化发生时系统如何接住自己", leadEn:"See how your system catches itself through change", nodes:[
    {id:"absorb",zh:"冲击承接",en:"Absorption"},{id:"recover",zh:"恢复节律",en:"Recovery"},{id:"adapt",zh:"变化适应",en:"Adaptation"},{id:"support",zh:"支持连接",en:"Support"},{id:"restart",zh:"重新启动",en:"Restart"},{id:"stabilize",zh:"稳定整合",en:"Stabilization"}], prompts:[
      ["计划突然偏转时，你的第一反应更接近什么？","What is your first response when plans abruptly shift?"],["一段消耗结束后，什么最能帮助你回来？","What most helps you return after depletion?"],["连续压力出现时，你更容易卡在哪里？","Where do you tend to get stuck under repeated pressure?"],["需要重新开始时，你通常依靠什么启动？","What helps you restart?"],["此刻你的系统最需要哪一种支持？","What support does your system need now?"]]},
  { productId:"romance-report", nameZh:"桃花磁场指数", nameEn:"Romance Resonance Index", leadZh:"照见你的吸引、靠近与回应方式", leadEn:"See how you attract, approach, and respond", nodes:[
    {id:"presence",zh:"存在感",en:"Presence"},{id:"warmth",zh:"情感温度",en:"Warmth"},{id:"depth",zh:"深度连接",en:"Depth"},{id:"signal",zh:"表达信号",en:"Signal"},{id:"boundary",zh:"关系边界",en:"Boundary"},{id:"response",zh:"真实回应",en:"Response"}], prompts:[
      ["遇到有好感的人时，你最自然的状态是什么？","What comes naturally around someone you like?"],["你通常通过什么确认彼此正在靠近？","How do you recognize mutual closeness?"],["关系尚未明确时，什么最容易消耗你？","What drains you most before a relationship is defined?"],["你的吸引力最容易在哪种场景中流露？","Where does your attraction show most naturally?"],["此刻你希望关系世界怎样感受到你？","How do you want the relational world to feel you now?"]]},
  { productId:"wealth-report", nameZh:"财富创造地图", nameEn:"Wealth Creation Map", leadZh:"照见价值如何被发现、创造、连接与放大", leadEn:"See how value is discovered, created, connected, and amplified", nodes:[
    {id:"insight",zh:"价值发现",en:"Insight"},{id:"create",zh:"价值创造",en:"Creation"},{id:"connect",zh:"资源连接",en:"Connection"},{id:"mastery",zh:"深化推进",en:"Mastery"},{id:"amplify",zh:"价值放大",en:"Amplification"},{id:"capacity",zh:"承接容量",en:"Capacity"}], prompts:[
      ["机会刚出现时，你通常最先做什么？","What do you do first when an opportunity appears?"],["一件事从想法走向现实，哪一步最像你的优势？","Which step from idea to reality is most natural to you?"],["资源有限时，你会优先把力量放在哪里？","Where do you place energy when resources are limited?"],["价值无法继续流动时，你最常遇到什么阻力？","What most often blocks value flow?"],["下一阶段，你最想加强哪一种创造能力？","Which creative capacity do you most want to strengthen next?"]]},
  { productId:"daily-tide-report", nameZh:"今日潮汐", nameEn:"Today’s Tide", leadZh:"读取此刻的状态节律，不预测事件", leadEn:"Read your present rhythm without predicting events", nodes:[
    {id:"energy",zh:"能量",en:"Energy"},{id:"clarity",zh:"清晰度",en:"Clarity"},{id:"emotion",zh:"情绪流动",en:"Emotion"},{id:"connection",zh:"连接意愿",en:"Connection"},{id:"action",zh:"行动窗口",en:"Action"},{id:"rest",zh:"回收窗口",en:"Rest"}], prompts:[
      ["此刻身体的能量更接近哪种状态？","How does your physical energy feel now?"],["今天思绪的清晰度如何？","How clear are your thoughts today?"],["面对他人时，你更想靠近还是保留空间？","Do you want closeness or space today?"],["今天最需要推进的是什么？","What most needs movement today?"],["今天最值得为自己保留的是什么？","What is most worth protecting today?"]]},
  { productId:"tarot-reading", nameZh:"灵犀量子生命镜像", nameEn:"Lingxi Quantum Life Mirror", leadZh:"在过往、当下与展开中看见此刻", leadEn:"See this moment through past, present, and unfolding", nodes:[
    {id:"trace",zh:"过往痕迹",en:"Past Trace"},{id:"present",zh:"当下回应",en:"Present Response"},{id:"tension",zh:"核心张力",en:"Core Tension"},{id:"choice",zh:"可见选择",en:"Visible Choice"},{id:"possibility",zh:"展开可能",en:"Possibility"},{id:"witness",zh:"自我确认",en:"Self-witness"}], prompts:[
      ["最近反复回到心里的是什么？","What has repeatedly returned to mind?"],["此刻最真实的感受是什么？","What feeling is most real now?"],["你正在两个什么方向之间停留？","Between which directions are you pausing?"],["如果不需要立刻给答案，你愿意先看见什么？","What could you see before demanding an answer?"],["下一步最小而真实的选择是什么？","What is the smallest real next choice?"]]},
  { productId:"qian-reading", nameZh:"灵犀生命灵签", nameEn:"Lingxi Life Oracle", leadZh:"读取源流、灵魂与行者三层生命原型", leadEn:"Read Source, Soul, and Wayfarer archetype layers", nodes:[
    {id:"source",zh:"源流背景",en:"Source"},{id:"soul",zh:"灵魂模式",en:"Soul"},{id:"walker",zh:"行者选择",en:"Wayfarer"},{id:"recurring",zh:"重复主题",en:"Recurring Theme"},{id:"transition",zh:"正在变化",en:"Transition"},{id:"embody",zh:"现实落点",en:"Embodiment"}], prompts:[
      ["哪种长期主题最像你的生命背景？","Which long-term theme feels like your background?"],["什么最近反复请求你看见？","What has recently asked to be seen again?"],["面对变化，你正在学习哪一种回应？","What response are you learning through change?"],["哪个选择最需要被带进现实？","Which choice most needs embodiment?"],["你希望三重生命原型照见什么？","What do you want the three archetypes to illuminate?"]]},
  { productId:"life-archetype", nameZh:"生命原型", nameEn:"Life Archetype", leadZh:"让八个场域节点汇入此刻的主、隐、行三重原型", leadEn:"Let eight field nodes converge into your Main, Hidden, and Action archetypes", nodes:[
    {id:"blueprint",zh:"生命图谱",en:"Blueprint"},{id:"resonance",zh:"关系共振",en:"Resonance"},{id:"resilience",zh:"生命韧性",en:"Resilience"},{id:"romance",zh:"桃花磁场",en:"Romance"},{id:"wealth",zh:"财富创造",en:"Wealth"},{id:"tide",zh:"今日潮汐",en:"Tide"},{id:"mirror",zh:"生命镜像",en:"Mirror"},{id:"oracle",zh:"生命灵签",en:"Oracle"}], prompts:[
      ["此刻最占据你注意力的是哪一片生命场域？","Which life field holds most of your attention now?"],["哪一部分表面平静、内里却持续活动？","What looks quiet but remains active underneath?"],["接下来七天，什么最需要成为行动？","What most needs to become action in the next seven days?"],["最近的重复经验正在指向哪里？","Where are recent repetitions pointing?"],["你希望此刻的生命原型帮助你确认什么？","What do you want your current archetype to help confirm?"]]},
];

function makeQuestions(seed: ProductSeed): DendriteQuestion[] {
  return seed.prompts.map(([zh, en], questionIndex) => {
    const offset = questionIndex % seed.nodes.length;
    const selected = [0, 1, 2, 3].map((step) => seed.nodes[(offset + step) % seed.nodes.length]);
    return {
      id: `q${questionIndex + 1}`, zh, en,
      options: selected.map((node, optionIndex) => {
        const companion = seed.nodes[(offset + optionIndex + 2) % seed.nodes.length];
        return {
          id: `${questionIndex + 1}-${optionIndex + 1}`,
          zh: `更接近「${node.zh}」`, en: `Closer to ${node.en}`,
          activates: { [node.id]: 1, [companion.id]: 0.32 },
        };
      }),
    };
  });
}

export const DENDRITE_PRODUCTS: DendriteProduct[] = seeds.map((seed) => ({ ...seed, questions: makeQuestions(seed) }));
export const DENDRITE_PRODUCT_IDS = new Set(DENDRITE_PRODUCTS.map((item) => item.productId));

export function getDendriteProduct(productId: string) {
  return DENDRITE_PRODUCTS.find((item) => item.productId === productId);
}

export type DendriteResult = {
  algorithm: "copernican-dendrite-v1";
  nodes: Array<{ id: string; zh: string; en: string; score: number }>;
  dominant: Array<{ id: string; zh: string; en: string; score: number }>;
  edges: Array<{ from: string; to: string; weight: number }>;
  titleZh: string; titleEn: string; insightZh: string; insightEn: string;
  archetypeCardIndexes?: number[];
  cardRolesZh?: string[];
  cardRolesEn?: string[];
};

export function archetypeCardIndexesFor(nodes: Array<{ id: string; score: number }>) {
  return nodes.slice(0, 3).map((node, index) => {
    const seed = `${node.id}:${node.score}:${index}`;
    return [...seed].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) % 64, 17);
  });
}

function oracleCardIndexesFor(nodes: Array<{ id: string; score: number }>) {
  const hash = (node: { id: string; score: number }, index: number, size: number) =>
    [...`${node.id}:${node.score}:${index}`].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % size, 11);
  return [hash(nodes[0], 0, 24), 24 + hash(nodes[1], 1, 24), 48 + hash(nodes[2], 2, 16)];
}

export function calculateDendrite(product: DendriteProduct, responses: Record<string, string>): DendriteResult {
  const activation = Object.fromEntries(product.nodes.map((node) => [node.id, 0])) as Record<string, number>;
  const edgeMap = new Map<string, number>();
  let previous: string[] = [];
  for (const question of product.questions) {
    const option = question.options.find((candidate) => candidate.id === responses[question.id]);
    if (!option) throw new Error(`missing response: ${question.id}`);
    const active = Object.keys(option.activates);
    for (const [node, weight] of Object.entries(option.activates)) activation[node] += weight;
    for (const from of previous) for (const to of active) {
      if (from === to) continue;
      const key = [from, to].sort().join("|");
      edgeMap.set(key, (edgeMap.get(key) ?? 0) + 0.35);
    }
    previous = active;
  }
  const edges = [...edgeMap.entries()].map(([key, weight]) => {
    const [from, to] = key.split("|"); return { from, to, weight };
  });
  for (let pass = 0; pass < 3; pass += 1) {
    const delta: Record<string, number> = {};
    for (const edge of edges) {
      delta[edge.to] = (delta[edge.to] ?? 0) + activation[edge.from] * edge.weight * 0.18;
      delta[edge.from] = (delta[edge.from] ?? 0) + activation[edge.to] * edge.weight * 0.18;
    }
    for (const [node, value] of Object.entries(delta)) activation[node] += value;
  }
  const max = Math.max(...Object.values(activation), 1);
  const nodes = product.nodes.map((node) => ({ ...node, score: Math.max(8, Math.round((activation[node.id] / max) * 100)) }))
    .sort((a, b) => b.score - a.score);
  const dominant = nodes.slice(0, 3);
  const titleZh = `${dominant[0].zh} × ${dominant[1].zh} × ${dominant[2].zh}`;
  const titleEn = `${dominant[0].en} × ${dominant[1].en} × ${dominant[2].en}`;
  const result: DendriteResult = {
    algorithm: "copernican-dendrite-v1", nodes, dominant, edges,
    titleZh, titleEn,
    insightZh: `此刻最清晰的结构从「${dominant[0].zh}」开始，经由「${dominant[1].zh}」与「${dominant[2].zh}」形成联锁。这不是命运结论，而是由本次真实选择激活的当前结构。`,
    insightEn: `The clearest current structure begins with ${dominant[0].en}, linked through ${dominant[1].en} and ${dominant[2].en}. This is not a prediction, but a present structure activated by your responses.`,
  };
  if (product.productId === "life-archetype") {
    result.archetypeCardIndexes = archetypeCardIndexesFor(dominant);
    result.cardRolesZh = ["主原型", "隐藏原型", "行动原型"];
    result.cardRolesEn = ["Main Archetype", "Hidden Archetype", "Action Archetype"];
  } else if (product.productId === "qian-reading") {
    result.archetypeCardIndexes = oracleCardIndexesFor(dominant);
    result.cardRolesZh = ["源流签", "灵魂签", "行者签"];
    result.cardRolesEn = ["Source Sign", "Soul Sign", "Wayfarer Sign"];
  }
  return result;
}
