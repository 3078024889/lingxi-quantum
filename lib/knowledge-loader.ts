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
  if (knowledgeCache[cacheKey]) {
    return knowledgeCache[cacheKey];
  }

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

// 提取《生命图谱》的高维语料，并自动映射用户场景
export function getLifeMapNode(dimension: string, bandOrArchetype: string, userStatus: string = 'default') {
  const data = loadJsonFile('life-map', 'nodes.json');
  if (!data || !data.nodes) return null;

  const node = data.nodes.find((n: KnowledgeNode) => 
    n.dimension === dimension && (n.band === bandOrArchetype || n.archetype === bandOrArchetype)
  );

  if (!node) return null;

  // 动态场景分叉（Context Mapping）
  const contextualDirection = node.growthDirection ? 
    (node.growthDirection[userStatus as keyof typeof node.growthDirection] || node.growthDirection.default) 
    : null;

  return {
    ...node,
    dynamic_instruction: contextualDirection
  };
}

// 提取《关系共振图谱》的高维语料
export function getRelationshipCombo(type: string, relationType: string = 'romantic') {
  const data = loadJsonFile('relationship', 'combos.json');
  if (!data || !data.relationship_nodes) return null;

  const combo = data.relationship_nodes.find((n: KnowledgeNode) => n.type === type);
  
  if (!combo) return null;

  const contextualAction = combo.action_dendrite ? 
    (combo.action_dendrite[relationType as keyof typeof combo.action_dendrite] || combo.action_dendrite.default) 
    : null;

  return {
    ...combo,
    dynamic_instruction: contextualAction
  };
}
