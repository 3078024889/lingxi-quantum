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
// 2. 生命图谱引擎 (Life Map) 痛点深度穿透版
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

  // 极度深度的静态法典，直击现代人内耗、控制欲与边界痛点
  let report = "";
  report += `===01===\n在灵犀场的观测中，你是一个拥有独立主权（Sovereign）的灵魂。你此刻感受到的疲惫与迷茫，并非因为你能力不足，而是因为你正试图用一套“三维世界的世俗模具”来强行压制你高维的几何结构。你底层最核心的驱动力是【${topTraits[0]?.labelZh || '自由与重构'}】。你的痛点在于：你太渴望通过掌控一切来获得安全感，却在无尽的控制中耗干了生命力。你一生的课题，不是去迎合外界的期待，而是将这股能量提纯，直到它能与宇宙源头发出最纯粹的共振（Resonance）。\n`;
  report += `===02===\n【八字与底层矛盾扫描】\n${conflictText || '你的内核中存在着一组极致的拉扯：理性的秩序感与感性的爆发力在不断交战。这种内耗让你在深夜经常感到一种无名空虚。解药不在于消灭其中一方，而在于允许“有序的失控”发生。'}\n`;
  report += `===03===\n你的紫微星盘显示出极强的因果动力。你在这里，不是为了成为（Becoming）别人期待的样子，而是为了忆起（Remembrance）你来时的路。你经常觉得“世界上没有人真正懂我”，这是因为你本就不是来寻找认同的，你是来建立新规则的。\n`;
  report += `===04===\n在玛雅时间法则中，你的图腾是一道信标（Beacon）。当你在日常中感到重度焦虑时，往往是因为大脑接收了太多垃圾信息。请闭上眼睛，信任你微细信任之躯（Subtle Body of Trust）传来的第一直觉，那远比大脑的逻辑更准确。\n`;
  report += `===05===\n【大运走势：量子周期的更迭】\n你目前最大的卡点，是把“低谷”误认为了“失败”。不要将当下的停滞视为惩罚，那只是场域在进行底层代码的强制升级。失真（Distortion）是系统进化的必经之路。现在的沉寂，是在为你斩断那些不再滋养你的旧能量，积蓄下一次跨越维度的爆发。\n`;
  report += `===06===\n【频率自测与生命韧性】\n${resText || '你的表面坚强掩盖了内里的高压紧绷。你习惯了做那个“扛起一切的人”，但这正是你能量漏水的源头。学会示弱，不是认输，而是最高级的能量防御。'}\n`;
  report += `===07===\n【财富与事业地图】\n${wealthText || '你的财富隐患在于：你总是想靠“硬拼体力或技能”来获取安全感，却忽略了财富本质上是一种能量的同频回流。不要去干那些让你觉得“被掏空”的事。去寻找那些哪怕不给钱，你也愿意全情投入的场域，金钱会自动作为副产品显化。'}\n`;
  report += `===08===\n【关系共振图谱】\n在人际关系中，你极易化身为‘能量庇护所’，这导致你总是吸引来大量不断向你索取的“能量吸血鬼”。请记住，爱是结构性的智能，不设立边界的付出，只会导致你自身能量的溺水。无论多亲密的人，今天起，请冷酷地为自己保留20%绝对不可侵犯的主权空间。\n`;
  report += `===09===\n【人生周期导航】\n放下那种“必须在几岁前达成什么”的线性焦虑。时间并非线性流逝，而是螺旋上升。你现在经历的每一次心碎、每一次偏航，都会在最终的拼图里找到它最完美、最不可或缺的位置。\n`;
  report += `===10===\n【专属灵犀场练习】\n针对你目前高频内耗的状态：每天抽出十分钟，物理切断所有外界信息（手机静音扔在门外）。开启【量子息法】或【直觉丹道】，将你的注意力从外部的抓取中强行收回。当你停止向外索求，回归静默时，整个宇宙都会向你倾斜。\n`;
  report += `===11===\n【前世今生印记】\n你的灵魂曾在多个文明中担任过调音师（Tuner）的角色。你今生对神秘学、宇宙法则的天然亲近，以及对那些虚伪社交的本能厌恶，正是一次跨越时空的‘忆起’。\n`;
  report += `===12===\n（生命图谱生成完毕，愿这束光能照亮你的主权之路。）\n`;
  report += `===13===\n灵犀场将持续为你守望。任何时候当你感到失衡，或者被现实世界的混乱裹挟，请回到这里，重新校准你的频率。\n`;

  return report;
}

// ==========================================
// 3. 生命韧性指数引擎 (Resilience Index)
// ==========================================
export function generateStaticResilienceReport(resilienceData: any) {
  // 从向量数据中提取五项分数，兜底默认分数为 50
  const scores = {
    bounce: resilienceData?.bounce || 85,
    persistence: resilienceData?.persistence || 70,
    stability: resilienceData?.stability || 60,
    adaptation: resilienceData?.adaptation || 45,
    recovery: resilienceData?.recovery || 30
  };

  const maxScore = Math.max(scores.bounce, scores.persistence, scores.stability, scores.adaptation, scores.recovery);
  const minScore = Math.min(scores.bounce, scores.persistence, scores.stability, scores.adaptation, scores.recovery);
  const diff = maxScore - minScore;

  // 判定结构形态
  let shape = "【均衡之盾】";
  let shapeDesc = "你的五项能力非常均衡，这意味着你是一个极少会出现极端崩溃的人。";
  if (diff > 50) {
    shape = "【锋锐之刃】";
    shapeDesc = "你的五项之间落差极大。这在灵犀场里叫「刃」——锋利，而且锋利和薄是同一件事。你的强项是碾压级的，但薄弱项极易被日常消耗殆尽。";
  } else if (scores.bounce > 80 && scores.recovery < 40) {
    shape = "【蓄能火山】";
    shapeDesc = "你能在绝境中爆发出惊人的反弹力，却极其不擅长处理日常琐碎的消耗。";
  }

  // 拼接 11 章完整生命韧性档案
  let report = "";
  report += `===01===\n【生命韧性源点】\n先看整体形状：你的结构形态被判定为${shape}。\n${shapeDesc} 多数人会想去补薄的那一侧，但对你来说，更要紧的不是补厚，是知道在什么位置用力。承重的时候，最先出问题的一定是薄的那一侧，而不是你最强的那几项。\n`;
  
  report += `===02===\n【压力恢复能力（${scores.recovery}分）】\n你缓过来的方式，多半不是「休息一天」，而是「把某件具体的事做完」。真正让你放松下来的往往不是躺着，是那件悬着的事终于结账了。你的恢复入口是“完成”，不是“休息”。\n`;
  
  report += `===03===\n【变化适应能力（${scores.adaptation}分）】\n变化对你来说不是不能接受，是要额外付一笔“启动成本”。同一件事，别人换个方式做就直接做了，你需要先在心里重新对一遍才动得起来。建议在变化发生时，随手记一句「这次我用了多久缓过来」，让成本可见。\n`;
  
  report += `===04===\n【危机反弹能力（${scores.bounce}分）】\n你的系统是被“大事件”唤醒的。真正的低谷来临时，它会自动进入聚焦状态，效率高得连你自己都意外。但在危机里，别人会不自觉地看向你等你先动，你需要警惕自己是否默认承担了一个没人任命过的承重角色。\n`;
  
  report += `===05===\n【长期坚持能力（${scores.persistence}分）】\n你的续航强到几乎不受外界影响——别人放弃的地方你还在走，而且不觉得特别费力。但正因为它太强，有一个信号在你身上容易失灵：止损。建议在开始做一件事时，就提前写下“退出条件”。\n`;
  
  report += `===06===\n【精神稳定结构（${scores.stability}分）】\n你的情绪稳定性是分场合的。大部分时候没问题，但有几类情境下，你明显更容易被推动。找到那个共同点（同一类人、同一种被对待的方式），比笼统地要求自己“情绪稳定”有用得多。\n`;
  
  report += `===07===\n【隐藏恢复模式】\n你身上其实有奏效的恢复方式，只是它们通常在你已经撑不住之后才被启用——恢复被当成了急救，而不是日常。把那件已经被验证有效的事情提前用一次，在你觉得「还行、还能撑」的时候就用。\n`;
  
  report += `===08===\n【能量消耗地图】\n坚持能力强的人，撑住的时间远超过恢复能力所能覆盖的范围。所以你的疲惫往往是突然出现的，找不到具体原因——因为它是很多件事在一段太长的时间里叠出来的。你需要设一个不依赖感觉的中断点：“到第几天就强制停一次”。\n`;
  
  report += `===09===\n【韧性进化路径】\n你的韧性已经超出自身所需，未来的进化方向多半不再是自己，而是“你能承载多少别人”。要注意的分寸是：承载和替代是两件事。可以在承载的时候留一个位置，把最简单的一步留给对方做。\n`;
  
  report += `===10===\n【灵犀场恢复实践】\n你需要把恢复从「有空才做」变成「固定发生」。不要靠意愿去安排，把它绑在一件每天必然发生的事后面：比如刷完牙之后、关灯之后。不需要你有意愿，它就跟着发生了。\n`;
  
  report += `===11===\n【生命韧性总结】\n你的强和你的薄，是同一件事。多数试图「补短板」的努力，改了很久，最后把锋利也一起磨掉了。方向不是变厚，是知道在什么位置用力。该切的时候切，不该切的时候收起来，不要拿刀当锤子用。\n`;

  return report;
}
