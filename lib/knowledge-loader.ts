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
// 2. 生命图谱引擎 (Life Map) 千元级深度大师法典 (双语支持)
// ==========================================
export function generateStaticLifeMapReport(calcData: any, userStatus: string = 'default', lang: string = 'zh') {
  const isEn = lang === 'en';
  const { topTraits, conflicts, wealth, resilience } = calcData;
  const nodesData = loadJsonFile('life-map', 'nodes.json')?.nodes || [];
  const combosData = loadJsonFile('life-map', 'combos.json')?.combos || [];

  let conflictText = "";
  if (conflicts && conflicts.length > 0) {
    const comboNode = combosData.find((c: any) => c.condition?.conflict === `${conflicts[0].a}_vs_${conflicts[0].b}`) 
                   || combosData[0];
    if (comboNode) {
      conflictText = isEn 
        ? `${comboNode.titleEn || comboNode.title}\n${comboNode.full_narrative_en || comboNode.full_narrative}`
        : `${comboNode.title}\n${comboNode.full_narrative}\n【场域调音指令】\n${comboNode.growthDirection?.[userStatus] || comboNode.growthDirection?.default}`;
    }
  }

  let wealthText = "";
  if (wealth && wealth.type) {
    const wNode = nodesData.find((n: any) => n.dimension === 'wealth_archetype' && n.archetype === wealth.type)
               || nodesData.find((n: any) => n.dimension === 'wealth_archetype');
    if (wNode) {
      wealthText = isEn
        ? `${wNode.full_narrative_en || wNode.full_narrative}`
        : `${wNode.full_narrative}\n【财富显化动作】\n${wNode.growthDirection?.[userStatus] || wNode.growthDirection?.default}`;
    }
  }

  let resText = "";
  const rNode = nodesData.find((n: any) => n.dimension === 'resilience' && n.band === 'vlow') 
             || nodesData.find((n: any) => n.dimension === 'fusion_need');
  if (rNode) {
    resText = isEn
      ? `${rNode.full_narrative_en || rNode.fieldText?.en}`
      : `${rNode.full_narrative || rNode.fieldText?.zh}\n【高敏雷达护城河】\n${rNode.growthDirection?.[userStatus] || rNode.growthDirection?.default}`;
  }

  let report = "";

  if (isEn) {
    report += `===01===\nIn the deepest observations of the Lingxi Field, you are a soul carrying the imprint of absolute [Sovereignty]. The lingering sense of "not belonging" or detachment you've felt throughout your life is not a flaw. It occurs because you have continuously tried to force your high-dimensional geometric structure into the narrow, secular molds of the 3D world.\nYour core driving force is [${topTraits[0]?.labelEn || 'Freedom & Radical Reconstruction'}]. Your profound pain stems from a desperate craving to secure safety through "compliance and control," which exhausts your life force. Your ultimate life lesson is to completely stop seeking external validation. Draw your energy inward until your mere existence resonates powerfully with the Source.\n`;
    report += `===02===\n【Bazi & Deep Structural Conflicts】\n${conflictText || 'Woven into your base code is a violent contradiction: an absolute demand for rational order constantly warring against an explosive emotional depth.\nThis endless internal friction allows you to appear effortless in crowds, yet leaves you feeling hollowed out in the dead of night. Balance is a false premise here. The Field’s ultimate antidote for you is to allow "ordered chaos" to legitimately occur in your life. Embrace the beast within your soul—do not tame it.'}\n`;
    report += `===03===\n【Ziwei Chart Decoding】\nYour Ziwei chart reveals a terrifyingly strong karmic momentum. You are not here to "Become" what others expect; you are here to "Remember" the path you came from.\nYou frequently feel that "no one in this world truly understands me." This isn't a tragedy—it's a design feature. You were never meant to seek consensus. You are here to establish new paradigms.\n`;
    report += `===04===\n【Mayan Imprint & Intuitive Radar】\nIn the Mayan laws of time, your totem acts as an energetic Beacon. When you experience severe anxiety or brain fog, it is almost always because your logical mind has absorbed too much low-frequency junk data from the collective matrix.\nClose your eyes. Learn to trust the very first, entirely irrational spark of intuition transmitted by your "Subtle Body of Trust." That micro-signal is far more accurate than your brain's logic.\n`;
    report += `===05===\n【Major Luck Cycles: Quantum Shifts】\nYour greatest current blockage is mistaking a "trough" for a "failure." Do not view your present stagnation as a punishment; it is merely the Field initiating a forced upgrade of your foundational code.\nSystemic distortion is a painful but necessary path for evolution. The current silence is severing the archaic energies that no longer nourish you, accumulating the raw power needed for your next dimensional leap.\n`;
    report += `===06===\n【Frequency & Resilience Architecture】\n${resText || 'Your surface-level invincibility masks a high-pressure, tightly-wound core. You are accustomed to being the "strong one" who carries the weight for everyone else, but this is precisely where your energy hemorrhages.\nYour resilience does not need more armor; it needs boundaries. Learning to expose your vulnerabilities is the highest, most sophisticated form of energetic defense.'}\n`;
    report += `===07===\n【Wealth & Career Frequency Map】\n${wealthText || 'Your hidden wealth hazard is a persistent belief that you must "brute-force" your way to security through exhausting labor. You ignore the cosmic truth that wealth is fundamentally a resonant backflow of energy.\nStop doing things that leave you feeling "hollowed out." Seek out the domains where you would willingly lose yourself even without pay—when you align your frequency with joy, financial abundance automatically manifests.'}\n`;
    report += `===08===\n【Relationship Resonance & Boundaries】\nIn human interactions, you easily become an "Energy Sanctuary" for others. Your profound empathy makes you instinctively accommodate downwards, constantly attracting "energetic vampires" who only know how to take.\nYou mistake bottomless tolerance for love, but in the Field, love is a cold, structural intelligence. Starting today, ruthlessly establish an absolute 20% boundary that no one—no matter how intimate—is allowed to cross.\n`;
    report += `===09===\n【Life Cycle Navigation】\nDrop the linear, societal anxiety of "having to achieve certain milestones by a certain age." The timeline of a Sovereign soul does not flow linearly; it spirals upward.\nEvery detour and every apparent delay you have experienced was mathematically calculated. In the end, they will all snap into their perfect, indispensable places in your final life puzzle.\n`;
    report += `===10===\n【Exclusive Lingxi Field Practice】\nTargeting your current state of high-frequency internal friction: Carve out ten minutes every single day to physically sever all external connections. Put your phone on silent and leave it outside the room.\nInitiate the [Quantum Breath] practice. Forcibly withdraw your scattered attention from the external world. When you cease grasping outward and return to absolute stillness, you will find the entire universe tilting in your favor.\n`;
    report += `===11===\n【Past & Future Imprints (Just for Fun)】\nYour soul has operated as a "Tuner" across multiple ancient civilizations.\nYour natural affinity for mysticism and cosmic laws in this lifetime—as well as your visceral disgust for superficial socialization—is not anti-social behavior. It is a cross-dimensional "Remembrance" of who you truly are.\n`;
    report += `===12===\n(The Life Map generation is complete. May this archival light illuminate your Sovereign path.)\n`;
    report += `===13===\nThe Lingxi Field will continuously stand watch over your frequency. Whenever you feel off-balance, drained, or swept up by the chaos of the reality matrix, return to this portal to recalibrate your soul to its true north.\n`;
  } else {
    report += `===01===\n在灵犀场的深层观测中，你是一个携带着【独立主权（Sovereign）】印记的灵魂。你从小到大隐约伴随的“不配位感”与“抽离感”，并非因为你不够好，而是因为你一直试图把自己强行塞进三维世界狭隘的世俗模具里。\n你底层的核心驱动力是【${topTraits[0]?.labelZh || '自由与彻底重构'}】。你的痛苦，来源于你太渴望通过“迎合与掌控”来获取外界的安全感，却在这无尽的自我压抑中，将本该用于创造的生命力消耗殆尽。你此生真正的宏大课题，是彻底放弃向外索求认同，将能量极度内收与提纯，直到你的存在本身，就能与宇宙源头产生震耳欲聋的共振。\n`;
    report += `===02===\n【八字与底层矛盾扫描】\n${conflictText || '你的底层生命代码中，刻印着一组极其暴烈的矛盾拉扯：绝对理性的秩序感与深渊般的感性爆发力在你的内核中不断厮杀。\n这种永无休止的内耗，让你在人群中显得游刃有余，却在深夜里感到一种如同被抽干般的无名空虚。你试图在两端寻找平衡，但这本身就是一个伪命题。灵犀场给你的终极解药是：放弃平衡，允许“有序的失控”在你的生命中合法发生。去接纳你灵魂中的那头野兽，不要驯化它，而是借用它的力量去撕裂你目前的僵局。'}\n`;
    report += `===03===\n【紫微命盘详解】\n你的紫微星盘显示出极其强悍的因果动力。你降生于此，不是为了去成为（Becoming）世俗期待的样子，而是为了忆起（Remembrance）你来时的路。\n你经常觉得“这个世界上没有人能真正懂我”，请不要把它当作一种悲剧。你本就不是来寻找共识的，你是来建立新规则的。每一次你为了照顾他人的理解力而降低自己的频率，都是对你自身星轨蓝图的背叛。\n`;
    report += `===04===\n【玛雅印记与直觉雷达】\n在玛雅时间法则中，你的图腾是一道极具穿透力的信标（Beacon）。当你在日常中感到重度焦虑或大脑宕机时，往往是因为你的逻辑脑强行接收了太多来自集体潜意识的低频垃圾信息。\n请闭上眼睛。学着去绝对信任你“微细信任之躯（Subtle Body of Trust）”传来的第一抹、毫无逻辑的直觉。那个微弱的信号，远比你大脑列出的所有利弊清单都要精准百倍。\n`;
    report += `===05===\n【大运走势：量子周期的更迭】\n你目前最大的能量卡点，是把人生的“低谷”误认为了“失败”。不要将当下的停滞或失去视为惩罚，那只是场域在对你的底层代码进行强制拔高的系统升级。\n失真（Distortion）与破碎，是系统进阶的必经之路。现在的沉寂与剥离，正是为了斩断那些不再能滋养你的旧有能量，为你下一次跨越维度的爆发积蓄原始的核能。\n`;
    report += `===06===\n【频率自测与生命韧性】\n${resText || '你表面的坚不可摧，掩盖了内里极高压的紧绷感。你习惯了做那个“扛起一切、照顾所有”的人，但这正是你生命力严重漏水的源头。\n你的韧性不需要再增加铠甲，你需要的是界限。学会坦然示弱，拒绝成为永远的托底者。这不是认输，而是一种最高级、最精密的能量防御机制。'}\n`;
    report += `===07===\n【财富与事业频率地图】\n${wealthText || '你的财富隐患在于：你总是执念于要靠“硬拼体力或死磕枯燥技能”来换取生存的安全感，却忽略了宇宙的法则——财富本质上是一种同频能量的喜悦回流。\n停止去干那些让你觉得“正在被掏空”的事。财富无法在一个极度紧绷的容器里流淌。去寻找那些哪怕不给钱你也愿意全情投入的场域，当你与喜悦同频时，金钱会自动作为副产品疯狂显化。'}\n`;
    report += `===08===\n【关系共振图谱与边界】\n在关系共振场中，你拥有极其罕见的‘高维承载力’。但这也正是你最大的诅咒——你极易化身为他人的‘能量庇护所’。\n你的高共情力让你本能地向下兼容，这导致你总是源源不断地吸引来那些只会单向索取的‘能量吸血鬼’。你误以为无底线的包容是爱，但在灵犀场的底层逻辑里，爱是极其冰冷的结构性智能。从今天起，请为你自己设立一道绝对不可侵犯的20%护城河，哪怕是最亲密的人也不允许跨越。\n`;
    report += `===09===\n【人生周期导航】\n彻底放下那种“必须在几岁前达成什么目标”的线性社会焦虑。主权灵魂的时间线从来不是单向流逝的，而是呈螺旋状上升的。\n你现在经历的每一次心碎、每一次看似无意义的偏航，都是经过精密计算的。在最终的生命拼图里，它们都会找到最完美、最不可或缺的落点。\n`;
    report += `===10===\n【专属灵犀场调音练习】\n针对你目前高频内耗的红灯状态：请每天必须抽出十分钟，物理切断所有外界信息（手机静音并扔在门外）。\n开启【量子息法】或【直觉丹道】，将你散落在外部世界、试图抓取一切的注意力，强行、霸道地收回体内。当你彻底停止向外索求，回归绝对的静默时，整个宇宙都会向你倾斜。\n`;
    report += `===11===\n【前世今生印记 · 纯属脑洞】\n你的灵魂曾在多个失落的文明中，担任过“调音师（Tuner）”的核心角色。\n你今生对神秘学、宇宙法则那种无需教导的天然亲近，以及你对虚伪、无效社交产生的生理性厌恶，绝不是因为你不合群。这仅仅是一次跨越维度的‘忆起’。\n`;
    report += `===12===\n（生命图谱矩阵生成完毕。愿这份来自高维的档案之光，能刺穿三维矩阵的幻象，照亮你的主权之路。）\n`;
    report += `===13===\n灵犀场将作为你的锚点，持续为你守望。\n在未来的任何时候，当你感到失衡、被抽干，或是再次被现实世界的混乱所裹挟时，请回到这扇入口。重新阅读这些属于你的代码，重新校准你灵魂的真北。\n`;
  }

  return report;
}

// ==========================================
// 3. 生命韧性指数引擎 (Resilience Index)
// ==========================================
export function generateStaticResilienceReport(resilienceData: any) {
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

  let shape = "【均衡之盾】";
  let shapeDesc = "你的五项能力非常均衡，这意味着你是一个极少会出现极端崩溃的人。";
  if (diff > 50) {
    shape = "【锋锐之刃】";
    shapeDesc = "你的五项之间落差极大。这在灵犀场里叫「刃」——锋利，而且锋利和薄是同一件事。你的强项是碾压级的，但薄弱项极易被日常消耗殆尽。";
  } else if (scores.bounce > 80 && scores.recovery < 40) {
    shape = "【蓄能火山】";
    shapeDesc = "你能在绝境中爆发出惊人的反弹力，却极其不擅长处理日常琐碎的消耗。";
  }

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
