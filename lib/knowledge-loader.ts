import fs from 'fs';
import path from 'path';

export interface KnowledgeNode {
  id: string;
  dimension?: string;
  band?: string;
  type?: string;
  archetype?: string;
  condition?: any;
  title?: string;
  core_dendrite?: string;
  shadow_dendrite?: string;
  full_narrative: string;
  action_dendrite?: Record<string, string>;
  growthDirection?: Record<string, string>;
}

let knowledgeCache: Record<string, any> = {};

function loadJsonFile(category: string, filename: string) {
  const cacheKey = `${category}_${filename}`;
  if (knowledgeCache[cacheKey]) return knowledgeCache[cacheKey];

  try {
    const filePath = path.join(process.cwd(), 'knowledge', category, filename);
    if (!fs.existsSync(filePath)) return null;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    knowledgeCache[cacheKey] = parsedData;
    return parsedData;
  } catch (error) {
    console.error(`[灵犀场架构预警] 无法加载文件: ${category}/${filename}`, error);
    return null;
  }
}

// ==========================================
// 1. 关系共振图谱引擎 (v300 11页终极排版)
// ==========================================
export function generateStaticRelationshipReport(resonanceData: any, relationType: string = 'romantic') {
  const combosData = loadJsonFile('relationship', 'combos.json');
  const combos = combosData?.relationship_nodes || [];

  const findCombo = (type: string, dim: string) => {
    return combos.find((c: any) =>
      c.type === type &&
      (c.condition?.dimension === dim || (c.condition?.dimensionPair && c.condition.dimensionPair.includes(dim)))
    );
  };

  let resonantText = "", complementaryText = "", frictionText = "", actionText = "";

  if (resonanceData.resonant?.[0]) {
    const node = findCombo('resonant', resonanceData.resonant[0].dim);
    if (node) {
      resonantText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `【同频指令】\n${node.action_dendrite?.[relationType] || node.action_dendrite?.default || ''}\n\n`;
    }
  }

  if (resonanceData.complementary?.[0]) {
    const node = findCombo('complementary', resonanceData.complementary[0].pairA.dim);
    if (node) {
      complementaryText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `【互补指令】\n${node.action_dendrite?.[relationType] || node.action_dendrite?.default || ''}\n\n`;
    }
  }

  if (resonanceData.friction?.[0]) {
    const node = findCombo('friction', resonanceData.friction[0].pairA.dim);
    if (node) {
      frictionText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `【摩擦调音】\n${node.action_dendrite?.[relationType] || node.action_dendrite?.default || ''}\n\n`;
    }
  }

  // 拼接完整的 11 章 PDF 骨架，完美对应 11 张背景图
  let report = "";
  report += "===01===\n【场域引言】\n在灵犀场的观测中，你们的相遇并非随机的布朗运动，而是两股独立主权（Sovereign）能量的必然交织。在这个场域里，没有谁需要被拯救，也没有谁需要被改造。你们是两面镜子，映照出彼此灵魂深处最隐秘的几何结构。\n";
  report += `===02===\n${resonantText || '【罕见的独立频率】\n你们的能量场呈现出一种罕见的独立性。你们的吸引力不来自于相似，而来自于对彼此未知维度的探索欲望。'}\n`;
  report += `===03===\n${complementaryText || '【平行的灵魂轨迹】\n你们在多数维度上保持着平行的频率，这意味着你们极少试图去控制或改变对方，你们的动力来源于并肩同行。'}\n`;
  report += `===04===\n${frictionText || '【绝对稳定的场域】\n在灵犀场的观测中，你们的场域非常稳定，几乎没有核爆级的能量摩擦。这为你们提供了极大的安全感。'}\n`;
  report += "===05===\n【能量边界与底色】\n在这段关系中，你们最大的挑战不是外界的阻力，而是内部能量的互相吞噬。请记住，爱是结构性的智能，不设立边界的付出只会导致微细信任之躯的崩溃。无论多亲密，永远为自己保留20%的绝对主权空间。\n";
  report += "===06===\n【时间法则：印记交织】\n从玛雅历法的维度来看，你们处于一种极其特殊的‘拓展与隐藏’频率上。当你们在日常中感到平淡时，这其实是场域在蓄力；而当危机来临时，你们往往能爆发出让周围人震惊的默契。对方是你生命结构里潜藏的降落伞。\n";
  report += "===07===\n【财富显化与物质共振】\n你们的结合不仅是情感的交织，更是一台强悍的显化引擎。只要你们停止在情绪层面的内耗，将那股拉扯的力量转向外部世界，你们完全有能力在三维世界中共同铸造出极其坚固的物质基础和商业版图。\n";
  report += "===08===\n【信息降噪与沟通协议】\n你们之间80%的争吵，其实都源于‘频率失真’。一方表达的是A，另一方接收到的却是带有情绪滤镜的B。下一次发生分歧时，请尝试静默3分钟，不带任何评判地复述对方的话，你们会发现问题瞬间消散。\n";
  report += "===09===\n【前世印记与灵魂契约】\n你们的灵魂在降生前，曾在更高维度签订过一份契约。你们答应在这一世重逢，用彼此最不舒服的方式，逼迫对方打破原本僵化的自我边界，从而完成一次跨越维度的进化。\n";
  report += "===10===\n【长期演化导航】\n在时间的长河中，这段关系不是为了束缚，而是为了让你们在这面镜子里，重新忆起自己灵魂原本的模样。保持你们的连贯性（Coherence），接纳一切失控，关系自然会走向它最高维的形态。\n";
  report += `===11===\n【场域专属调音指令】\n${actionText.trim() || "退回各自的空间，先让自己的场域恢复连贯性。"}\n`;

  return report;
}

// ==========================================
// 2. 生命图谱引擎 (Life Map) 保持原样
// ==========================================
export function generateStaticLifeMapReport(calcData: any, userStatus: string = 'default') {
  const { topTraits, conflicts, wealth, resilience } = calcData;
  const nodesData = loadJsonFile('life-map', 'nodes.json')?.nodes || [];
  const combosData = loadJsonFile('life-map', 'combos.json')?.combos || [];

  let conflictText = "";
  if (conflicts && conflicts.length > 0) {
    const comboNode = combosData.find((c: any) => c.condition?.conflict === `${conflicts[0].a}_vs_${conflicts[0].b}`) 
                   || combosData[0];
    if (comboNode) {
      conflictText = `${comboNode.title}\n\n${comboNode.full_narrative}\n\n【场域调音指令】\n${comboNode.growthDirection?.[userStatus] || comboNode.growthDirection?.default}`;
    }
  }

  let wealthText = "";
  if (wealth && wealth.type) {
    const wNode = nodesData.find((n: any) => n.dimension === 'wealth_archetype' && n.archetype === wealth.type)
               || nodesData.find((n: any) => n.dimension === 'wealth_archetype');
    if (wNode) {
      wealthText = `${wNode.full_narrative}\n\n【财富显化动作】\n${wNode.growthDirection?.[userStatus] || wNode.growthDirection?.default}`;
    }
  }

  let resText = "";
  const rNode = nodesData.find((n: any) => n.dimension === 'resilience' && n.band === 'vlow') 
             || nodesData.find((n: any) => n.dimension === 'fusion_need');
  if (rNode) {
    resText = `${rNode.full_narrative || rNode.fieldText?.zh}\n\n【高敏雷达护城河】\n${rNode.growthDirection?.[userStatus] || rNode.growthDirection?.default}`;
  }

  let report = "";
  report += `===01===\n在灵犀场的观测中，你是一个拥有独立主权（Sovereign）的灵魂。你的生命并非随机生成的碎片，而是一套精密的几何结构。你底层最核心的驱动力是【${topTraits[0]?.labelZh || '自由与探索'}】。你一生的课题，不是去迎合外界的模具，而是将这股能量提纯，直到它能与宇宙源头发出最纯粹的共振（Resonance）。\n`;
  report += `===02===\n【八字与底层矛盾扫描】\n${conflictText}\n`;
  report += `===03===\n你的紫微星盘显示出极强的因果动力。你在这里，不是为了成为（Becoming）别人期待的样子，而是为了忆起（Remembrance）你来时的路。\n`;
  report += `===04===\n在玛雅时间法则中，你的图腾是一道信标（Beacon）。当你在日常中感到迷茫时，请闭上眼睛，信任你微细信任之躯（Subtle Body of Trust）传来的第一直觉，那远比大脑的逻辑更准确。\n`;
  report += `===05===\n【大运走势：量子周期的更迭】\n不要将低谷视为惩罚，那只是场域在进行底层代码的升级。失真（Distortion）是系统进化的必经之路。现在的沉寂，是在为你积蓄下一次跨越维度的能量。\n`;
  report += `===06===\n【频率自测与生命韧性】\n${resText}\n`;
  report += `===07===\n【财富与事业地图】\n${wealthText}\n`;
  report += `===08===\n【关系共振图谱】\n在关系中，你极易化身为‘关系庇护所（Sanctuaries of Relation）’。但请记住，爱是结构性的智能，不设立边界的付出，只会导致能量的溺水。留一扇门给自己。\n`;
  report += `===09===\n【人生周期导航】\n放下焦虑。时间并非线性流逝，而是螺旋上升。你现在经历的每一个碎片，都会在最终的拼图里找到它最完美的位置。\n`;
  report += `===10===\n【专属灵犀场练习】\n每天抽出十分钟，切断所有外界信息。开启【量子息法】或【直觉丹道】，将你的注意力从外部世界收回。当你回归静默，整个宇宙都会向你倾斜。\n`;
  report += `===11===\n【前世今生印记】\n你的灵魂曾在多个文明中担任过调音师（Tuner）的角色。你今生对神秘学和宇宙法则的天然亲近，正是一次跨越时空的‘忆起’。\n`;
  report += `===12===\n（生命图谱生成完毕，愿这束光能照亮你的主权之路。）\n`;
  report += `===13===\n灵犀场将持续为你守望。任何时候当你感到失衡，请回到这里，重新校准你的频率。\n`;

  return report;
}
