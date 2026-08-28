export type ReportSignal = {
  id: string;
  zh: string;
  en: string;
  score: number;
  meaningZh: string;
  meaningEn: string;
  actionZh: string;
  actionEn: string;
};

export type DendriteReportEntry = {
  id: string;
  chapterId: string;
  chapterZh: string;
  chapterEn: string;
  titleZh: string;
  titleEn: string;
  evidenceNodeIds: string[];
  confidence: "clear" | "developing" | "open";
  structureZh: string;
  structureEn: string;
  mechanismZh: string;
  mechanismEn: string;
  realityZh: string;
  realityEn: string;
  costZh?: string;
  costEn?: string;
  strengthZh?: string;
  strengthEn?: string;
  actionZh: string;
  actionEn: string;
  observationZh: string;
  observationEn: string;
};

type EntryBlueprint = { chaptersZh: string[]; chaptersEn: string[]; titlesZh: string[] };

const split = (value: string) => value.split("|");
const blueprint = (chaptersZh: string, chaptersEn: string, titlesZh: string): EntryBlueprint => ({
  chaptersZh: split(chaptersZh), chaptersEn: split(chaptersEn), titlesZh: split(titlesZh),
});

const BLUEPRINTS: Record<string, EntryBlueprint> = {
  "life-map-report": blueprint(
    "生命底色|现实适应|生命偏移|行动结构|连接与边界|当前生命位置",
    "Life Ground|Reality Adaptation|Structural Drift|Action Structure|Connection and Boundary|Present Position",
    "最自然的运行方式|真正让生命有感觉的东西|稳定来自哪里|自主的真实程度|为了适应现实，改变了多少自己|最常扮演的现实角色|能做得很好，却并不真正属于自己的部分|长期适应的隐形成本|当前离自己的自然结构有多远|偏移发生在哪一个生活区域|哪些偏移是必要的|哪些偏移已经不再需要|怎样真正开始|什么最容易让行动中断|怎样完成长期事情|行动过快或过慢背后的机制|关系在生命结构中占多大位置|什么时候容易失去自己的节奏|独处真正恢复什么|怎样的连接最能支持生命展开|当前最活跃的生命向量|当前正在收缩的部分|正在重新靠近自己的地方|接下来最值得回到哪一个位置"
  ),
  "relationship-resonance:deep": blueprint(
    "靠近|表达|安全|边界|冲突|修复", "Approach|Expression|Safety|Boundary|Conflict|Repair",
    "真正喜欢一个人时怎样靠近|关系越重要，为什么反而越谨慎|靠近速度与安全感之间的关系|什么时候开始把对方真正放进自己的世界|真正重要的话通常怎样说出口|表达了多少，对方真正接收到多少|为什么有些需要总要等对方发现|沉默在这段关系里承担什么功能|什么让关系真正稳定下来|哪些变化最容易触发警觉|安全感来自回应、行动还是空间|关系稳定后为什么仍然无法完全放松|亲近以后还剩多少自己|什么时候容易过度理解对方|关系中的让步到底是选择还是习惯|个人空间如何不被误读为疏远|冲突发生时第一反应是什么|为什么一个人越追，一个人越退|意见不同为何容易变成关系问题|真正卡住冲突的不是内容，而是什么|冲突结束以后内部真的回来了吗|谁通常承担修复启动|怎样的修复才真正有效|这段关系最值得建立的一条新机制"
  ),
  "relationship-resonance:business": blueprint(
    "共同目标|决策权|价值贡献|资源与利益|压力与冲突|长期合作", "Shared Aim|Decision Rights|Value Contribution|Resources and Interest|Pressure and Conflict|Long-term Partnership",
    "双方真正想建立的是同一件事吗|愿景一致，现实优先级是否一致|短期收益与长期价值如何排序|什么时候方向一致只是表面一致|谁天然更容易发起|谁在关键时刻真正拍板|意见不同如何形成最终决定|决策速度差如何影响合作|双方真正不可替代的价值分别是什么|隐形贡献是否被看见|谁在创造，谁在承接|能力互补还是工作重叠|资源投入是否真正对称|钱、时间、人脉和风险如何被衡量|利益分配中的真实敏感点|什么情况下容易产生我承担更多的感觉|压力上升后谁会改变工作方式|失败发生时责任如何被解释|冲突是在解决问题还是保护立场|商业分歧如何避免进入人格冲突|这段合作真正靠什么维持|什么时候应该分工，什么时候应该共同判断|当前最大的合作摩擦成本|最值得建立的一条合伙机制"
  ),
  "relationship-resonance:other": blueprint(
    "关系位置|互动距离|支持方式|边界与责任|误解与张力|关系更新", "Relationship Position|Interaction Distance|Support Language|Boundary and Duty|Misreading and Tension|Relationship Renewal",
    "这个人在生命里实际处于什么位置|关系重要程度是否与现实投入一致|双方对关系的定义是否相同|这段关系真正依靠什么维持|双方舒服的距离是否一致|联系频率怎样影响关系感受|一方靠近时另一方为什么会退|什么时候空间成为误解|真正需要支持时谁能接得住|建议、陪伴、行动、空间，哪一种真正有效|支持为什么有时越给越累|谁承担更多情绪劳动|哪些事情其实不属于自己的责任|拒绝为什么如此困难或容易|关系中的责任是否发生漂移|帮助与过度承担之间的边界|最容易互相误读什么|没有说出口的期待有哪些|关系里的旧角色是否还在继续|表面和谐下面真正存在什么差异|这段关系现在还需要原来的方式吗|什么值得继续保留|什么已经可以结束|下一阶段最适合怎样重新连接"
  ),
  "resilience-report": blueprint(
    "冲击|恢复|适应|反弹|长期承载|恢复成本", "Impact|Recovery|Adaptation|Rebound|Long-term Capacity|Recovery Cost",
    "突发事件发生时系统先做什么|危机里真正可靠的能力|为什么有时越危急反而越清醒|冲击过去以后真正留下了什么|恢复到底需要多久|看起来恢复与真正恢复的差距|恢复通常依赖什么资源|最快的恢复方式是否也是最耗能的方式|计划被打乱后怎样重新组织|变化越多时哪里最容易失控|适应是弹性还是压住自己的反应|什么变化真正需要重新建立结构|失败以后多久能重新启动|第二次尝试会更谨慎还是更准确|重复失败最容易损伤什么|什么时候坚持已经变成消耗|低反馈环境中靠什么继续|长期压力下最先损失什么|稳定与麻木之间的区别|真正可持续的承载上限|每次撑过来到底付出了什么|哪些能力正在被过度调用|系统真正需要补回的资源|下一阶段最值得保护的恢复入口"
  ),
  "romance-report": blueprint(
    "被看见|吸引表达|信号接收|回应|筛选|现实连接", "Visibility|Attraction Expression|Signal Reception|Response|Selection|Real Connection",
    "真实特质有多少进入外部世界|别人最先注意到什么|吸引力是否被现实场景真正看见|现实入口够不够|最自然的吸引表达是什么|真正有兴趣时外部会发生什么变化|神秘感与不可读之间的差别|独立感什么时候会被误读成拒绝|别人靠近时最先看见什么|哪些信号容易被低估|哪些信号容易被过度解释|真实兴趣与普通友好如何区分|内部有兴趣，外部表达了多少|回应为什么总比感受慢一步|什么时候会等待对方持续主动|连接最容易在哪一步停住|真正筛选的是人，还是风险|标准高与判断过早的区别|哪些条件实际上不可妥协|哪些条件来自过去经验而非当前现实|为什么有吸引却没有进入关系|连接机会不足还是回应不足|当前最明显的吸引场断点|下一步最值得增加的真实连接信号"
  ),
  "wealth-report": blueprint(
    "发现价值|创造|连接|深化|放大|承接", "Value Discovery|Creation|Connection|Deepening|Amplification|Capacity",
    "最容易看见什么价值|哪些机会别人还没看见|洞察什么时候只停留在想法|真正值得投入的机会如何被识别|怎样把想法做成现实|什么最容易让创造停在半途|完美标准如何影响完成|新想法过多是否正在稀释成果|价值怎样被别人看见|表达价值时最容易缺哪一步|为什么好东西没有进入交换|人脉与真实连接能力之间的区别|什么值得长期积累|专业深度如何真正形成壁垒|什么时候该继续深化，什么时候该放大|重复劳动有没有形成可复用资产|价值如何突破个人时间上限|曝光、传播与成交之间卡在哪里|放大为什么可能反而增加混乱|哪些结构已经具备规模化条件|收入或机会增加以后能否真正接住|资源扩大后最容易先崩哪一环|当前财富路径最大的阻塞|下一步最值得打开的价值流动节点"
  ),
  "daily-tide-report": blueprint(
    "能量|情绪负荷|专注|连接容量|节律|今日入口", "Energy|Emotional Load|Focus|Connection Capacity|Rhythm|Today's Entrance",
    "今天真实可用的能量|能量是在不足还是被切碎|什么正在持续消耗|当前最适合推进还是恢复|今天内部承载了多少未处理信息|情绪来自事件还是累积|哪些东西仍停留在身体和注意力里|当前最需要释放的负荷类型|专注是真正不足还是被不断打断|当前注意力被什么占据|最适合完成什么类型任务|今天不适合做什么|今天真正想与人连接多少|社交是否正在补充还是消耗|什么关系最影响今天状态|当前边界需要怎样调整|最近状态正在上升、下降还是震荡|压力影响是否存在延迟|恢复为什么总慢于事件结束|目前最明显的状态周期|今天真正值得保护的资源|今天最重要的一件事|今天最应该减少的一件事|今天的现实节律建议"
  ),
  "tarot-reading": blueprint(
    "事件表层|经验回声|内部结构|外部牵引|路径展开|现实校准", "Event Surface|Experience Echo|Inner Structure|External Pull|Path Unfolding|Reality Calibration",
    "现在真正发生了什么|事实与解释分别是什么|当前最强的外部变量|哪些信息仍然未知|过去经验正在怎样影响现在|哪些反应比当前事件本身更大|熟悉的模式是否再次出现|过去有效的方法现在是否还有效|真正卡住的内在位置|想改变与不愿失去之间的关系|当前最强的内部阻力|哪些判断来自恐惧，哪些来自现实|他人期待正在影响多少|现实资源真正允许什么|哪些条件无法由自己控制|外部压力是否正在替自己做决定|维持现状会发生什么结构延续|只改变一个变量会打开什么空间|暂停是否比继续更有价值|当前最具杠杆效应的变量|现在已经足够清楚的部分|仍然不需要急着决定的部分|下一步最小验证动作|现实反馈回来后最值得重新观察什么"
  ),
  "qian-reading": blueprint(
    "源流|当下|镜面|张力|行者|回响", "Source|Present|Mirror|Tension|Wayfarer|Echo",
    "当前主题从哪里开始聚集|背景中一直存在的牵引|最近反复出现的生命主题|被忽略但持续影响的源点|此刻真正需要看见什么|最明显的意识焦点|当前正在增强的力量|当前最容易回避的位置|外部事件正在映照什么|哪些感受属于现实，哪些属于解释|什么正在被重复读取|当前最值得换一个角度看的地方|两股力量正在拉向哪里|真正的犹豫来自什么|继续与停止分别保护什么|当前最难放下的东西|现实中已经可以做什么|第一步应该小到什么程度|什么行动能带回真实信息|什么时候该行动，什么时候该继续观察|这次结果与近期记录哪里重复|哪些信号第一次出现|这次最值得留下的一句话|未来几天真正值得观察什么"
  ),
};

function confidenceFor(score: number): DendriteReportEntry["confidence"] {
  return score >= 72 ? "clear" : score >= 48 ? "developing" : "open";
}

export function buildReportEntries(productId: string, relationshipType: "deep" | "business" | "other" | undefined, ordered: ReportSignal[]): DendriteReportEntry[] {
  const key = productId === "relationship-resonance" ? `${productId}:${relationshipType ?? "deep"}` : productId;
  const spec = BLUEPRINTS[key];
  if (!spec || ordered.length < 3) return [];
  return spec.titlesZh.map((titleZh, index) => {
    const primary = ordered[index % ordered.length];
    const support = ordered[(index * 3 + 1) % ordered.length];
    const counter = ordered[(ordered.length - 1 - (index % ordered.length) + ordered.length) % ordered.length];
    const chapterIndex = Math.floor(index / 4);
    const evidenceNodeIds = [...new Set([primary.id, support.id, counter.id])];
    const hasCost = primary.score >= 68 && counter.score <= 46;
    return {
      id: `${key}-${String(index + 1).padStart(2, "0")}`,
      chapterId: `${key}-chapter-${chapterIndex + 1}`,
      chapterZh: spec.chaptersZh[chapterIndex],
      chapterEn: spec.chaptersEn[chapterIndex],
      titleZh,
      titleEn: `${spec.chaptersEn[chapterIndex]} · Observation ${String(index + 1).padStart(2, "0")}`,
      evidenceNodeIds,
      confidence: confidenceFor(Math.round((primary.score + support.score) / 2)),
      structureZh: `本次多题证据首先指向「${primary.zh}」，并由「${support.zh}」决定它怎样进入现实；「${counter.zh}」目前参与较弱，因此这里呈现的是当前结构，而不是固定人格。`,
      structureEn: `${primary.en} leads the cross-question evidence, while ${support.en} shapes how it reaches reality. ${counter.en} participates less, so this is a present structure rather than a fixed identity.`,
      mechanismZh: `${primary.meaningZh}当它与「${support.zh}」在不同情境重复相连时，系统才把这组信号纳入本条目；单独一道题不会直接产生结论。`,
      mechanismEn: `${primary.meaningEn} This entry appears only when it repeatedly connects with ${support.en} across contexts; no single answer creates the conclusion.`,
      realityZh: `现实中可观察的是：需要调用「${primary.zh}」时，你是否也为「${support.zh}」留下了可见接口；两者不同步时，行动、关系或状态会在中途失去传递。`,
      realityEn: `Observe whether ${support.en} has a visible interface when ${primary.en} is needed. When they lose sequence, action, relationship, or state stops transmitting midway.`,
      ...(hasCost ? {
        costZh: `当前代价不来自「${primary.zh}」本身，而来自它持续高强度运行、同时「${counter.zh}」没有进入承接位置。`,
        costEn: `The current cost does not come from ${primary.en} itself, but from its sustained intensity while ${counter.en} remains outside the capacity position.`,
      } : {}),
      ...(primary.score >= 64 ? {
        strengthZh: `结构优势在于「${primary.zh}」已经可以被稳定调用，并由「${support.zh}」把洞察转成可被现实接收的形式。`,
        strengthEn: `${primary.en} is already reliably available, while ${support.en} translates insight into a form reality can receive.`,
      } : {}),
      actionZh: `${primary.actionZh}只做一次，并记录它是否让「${support.zh}」更容易被现实看见。`,
      actionEn: `${primary.actionEn} Do it once and record whether it makes ${support.en} more visible in reality.`,
      observationZh: `下一次相似情境出现时，观察「${primary.zh}」与「${support.zh}」谁先启动，以及「${counter.zh}」是否获得了真实参与空间。`,
      observationEn: `In the next similar situation, observe whether ${primary.en} or ${support.en} starts first, and whether ${counter.en} receives real room to participate.`,
    };
  });
}
