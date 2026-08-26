// 灵犀场 · 关系共振产品配置矩阵 (v300 终极定版)
export const RELATIONSHIP_PRODUCTS = {
  romantic: {
    id: 'romantic',
    name: '【镜像之桥 · 亲密共振档案】',
    subtitle: 'Soul Mirror: Deep Relationship Resonance Archive',
    description: '解码两人能量场的宿命纠缠、深水区摩擦与无条件之爱的边界。',
    price: 68
  },
  business: {
    id: 'business',
    name: '【谐波同盟 · 商业共创矩阵】',
    subtitle: 'Harmonic Alliance: Business Co-Creation Matrix',
    description: '洞察合伙人之间的结构互补、决策摩擦与商业能量的最高放大率。',
    price: 68
  },
  general: {
    id: 'general',
    name: '【多维交织 · 普遍共振谱系】',
    subtitle: 'Multidimensional Weaving: Universal Resonance Lineage',
    description: '解析任意两人在群体或日常交集中的频率碰撞与深层灵性契约。',
    price: 68
  }
};

// 供后端或前端调取的安全映射函数
export function getRelationshipProductMeta(type: string) {
  return RELATIONSHIP_PRODUCTS[type as keyof typeof RELATIONSHIP_PRODUCTS] || RELATIONSHIP_PRODUCTS.romantic;
}
