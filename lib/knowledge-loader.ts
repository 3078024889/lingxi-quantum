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
// 1. 关系共振图谱引擎
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
    } else {
      resonantText = `你们在【${resonanceData.resonant[0].labelZh}】上产生了极强的同频共振，这是你们天然的吸引力底座。`;
    }
  }

  if (resonanceData.complementary?.[0]) {
    const node = findCombo('complementary', resonanceData.complementary[0].pairA.dim);
    if (node) {
      complementaryText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `【互补指令】\n${node.action_dendrite?.[relationType] || node.action_dendrite?.default || ''}\n\n`;
    } else {
      complementaryText = `你们在【${resonanceData.complementary[0].labelZh}】形成了一组精妙的互补谐波。`;
    }
  }

  if (resonanceData.friction?.[0]) {
    const node = findCombo('friction', resonanceData.friction[0].pairA.dim);
    if (node) {
      frictionText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `【摩擦调音】\n${node.action_dendrite?.[relationType] || node.action_dendrite?.default || ''}\n\n`;
    } else {
      frictionText = `你们在【${resonanceData.friction[0].labelZh}】上存在能量摩擦，需要重点调音。`;
    }
  }

  return `===01===\n${resonantText || '（暂缺场域数据）'}\n===02===\n${complementaryText || '（平行的灵魂轨迹）'}\n===03===\n${frictionText || '（极其稳定的场域）'}\n===04===\n在时间的长河中，这段关系不是为了束缚，而是为了让你们在这面镜子里，重新忆起自己灵魂原本的模样。保持你们的连贯性（Coherence），关系自然会走向它最高维的形态。\n===05===\n【场域专属行动指令】\n${actionText.trim()}`;
}

// ==========================================
// 2. 生命图谱引擎 (Life Map)
// ==========================================
export function generateStaticLifeMapReport(calcData: any, userStatus: string = 'default') {
  const { topTraits, conflicts, wealth, resilience } = calcData;
  const nodesData = loadJsonFile('life-map', 'nodes.json')?.nodes || [];
  const combosData = loadJsonFile('life-map', 'combos.json')?.combos || [];

  // --- 01. 核心矛盾场域 (Conflicts) ---
  let conflictText = "";
  if (conflicts && conflicts.length > 0) {
    const conflictId = `freedom_vs_stability`; // 优先匹配底层定义好的矛盾ID，这里做动态匹配
    const comboNode = combosData.find((c: any) => c.condition?.conflict === `${conflicts[0].a}_vs_${conflicts[0].b}`) 
                   || combosData[0]; // 兜底抓取第一个
    if (comboNode) {
      conflictText = `${comboNode.title}\n\n${comboNode.full_narrative}\n\n【场域调音指令】\n${comboNode.growthDirection?.[userStatus] || comboNode.growthDirection?.default}`;
    }
  }

  // --- 02. 财富显化原型 (Wealth) ---
  let wealthText = "";
  if (wealth && wealth.type) {
    const wNode = nodesData.find((n: any) => n.dimension === 'wealth_archetype' && n.archetype === wealth.type)
               || nodesData.find((n: any) => n.dimension === 'wealth_archetype'); // 兜底
    if (wNode) {
      wealthText = `${wNode.full_narrative}\n\n【财富显化动作】\n${wNode.growthDirection?.[userStatus] || wNode.growthDirection?.default}`;
    }
  }

  // --- 03. 生命韧性与高敏雷达 (Resilience) ---
  let resText = "";
  const rNode = nodesData.find((n: any) => n.dimension === 'resilience' && n.band === 'vlow') 
             || nodesData.find((n: any) => n.dimension === 'fusion_need'); // 兜底节点
  if (rNode) {
    resText = `${rNode.full_narrative || rNode.fieldText?.zh}\n\n【高敏雷达护城河】\n${rNode.growthDirection?.[userStatus] || rNode.growthDirection?.default}`;
  }

  // 拼接 13 章完整生命图谱 PDF 骨架
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
