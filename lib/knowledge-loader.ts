import fs from 'fs';
import path from 'path';

// 定义知识库节点的结构
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
  action_dendrite?: {
    student?: string;
    working_adult?: string;
    entrepreneur?: string;
    romantic?: string;
    business?: string;
    general?: string;
    default: string;
  };
  growthDirection?: {
    student?: string;
    working_adult?: string;
    entrepreneur?: string;
    default: string;
  };
}

// 缓存机制：确保只读取一次文件，0 延迟应对两万人并发
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
    console.error(`[灵犀场架构预警] 无法加载知识库文件: ${category}/${filename}`, error);
    return null;
  }
}

// 核心封装：直接生成关系共振 5 章静态报告
export function generateStaticRelationshipReport(resonanceData: any, relationType: string = 'romantic') {
  const combosData = loadJsonFile('relationship', 'combos.json');
  const combos = combosData?.relationship_nodes || [];

  // 辅助函数：根据维度和类型找文案
  const findCombo = (type: string, dim: string) => {
    return combos.find((c: any) =>
      c.type === type &&
      (c.condition?.dimension === dim ||
       (c.condition?.dimensionPair && c.condition.dimensionPair.includes(dim)))
    );
  };

  let resonantText = "";
  let complementaryText = "";
  let frictionText = "";
  let actionText = "";

  // 第1章: 吸引来源 (Resonant)
  if (resonanceData.resonant && resonanceData.resonant.length > 0) {
    const topRes = resonanceData.resonant[0];
    const node = findCombo('resonant', topRes.dim);
    if (node) {
      resonantText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `\n\n${node.action_dendrite?.[relationType as keyof typeof node.action_dendrite] || node.action_dendrite?.default || ''}`;
    } else {
      resonantText = `你们在【${topRes.labelZh}】上产生了极强的同频共振。这构成了你们关系中天然的吸引力底座。`;
    }
  } else {
     resonantText = "你们的能量场呈现出一种罕见的独立性。你们的吸引力不来自于相似，而来自于对彼此未知维度的探索欲望。";
  }

  // 第2章: 关系动力 (Complementary)
  if (resonanceData.complementary && resonanceData.complementary.length > 0) {
    const topComp = resonanceData.complementary[0];
    const dim = topComp.pairA.dim; 
    const node = findCombo('complementary', dim);
    if (node) {
      complementaryText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `\n\n${node.action_dendrite?.[relationType as keyof typeof node.action_dendrite] || node.action_dendrite?.default || ''}`;
    } else {
      complementaryText = `你们在【${topComp.labelZh}】形成了一组精妙的互补谐波。一方的收摄与另一方的扩张，构成了你们最坚固的关系动力。`;
    }
  } else {
     complementaryText = "你们在多数维度上保持着平行的频率，这意味着你们极少试图去控制或改变对方，你们的动力来源于并肩同行。";
  }

  // 第3章: 冲突地图 (Friction)
  if (resonanceData.friction && resonanceData.friction.length > 0) {
    const topFric = resonanceData.friction[0];
    const dim = topFric.pairA.dim;
    const node = findCombo('friction', dim);
    if (node) {
      frictionText = `${node.title}\n\n${node.full_narrative}`;
      actionText += `\n\n${node.action_dendrite?.[relationType as keyof typeof node.action_dendrite] || node.action_dendrite?.default || ''}`;
    } else {
      frictionText = `你们在【${topFric.labelZh}】上存在能量摩擦。两个高强度的主权意识在这里发生了碰撞，这是你们关系中需要重点调音的区域。`;
    }
  } else {
     frictionText = "在灵犀场的观测中，你们的场域非常稳定，几乎没有核爆级的能量摩擦。这为你们提供了极大的安全感。";
  }

  // 组装最终报告 (严格匹配前端的 5 章结构 ===01=== 等)
  let finalReport = "";
  finalReport += "===01===\n" + resonantText.trim() + "\n";
  finalReport += "===02===\n" + complementaryText.trim() + "\n";
  finalReport += "===03===\n" + frictionText.trim() + "\n";
  finalReport += "===04===\n在时间的长河中，这段关系不是为了束缚，而是为了让你们在这面镜子里，重新忆起自己灵魂原本的模样。保持你们的连贯性（Coherence），关系自然会走向它最高维的形态。\n";
  finalReport += "===05===\n【场域专属行动指令】\n" + actionText.trim() + "\n";

  return finalReport;
}
