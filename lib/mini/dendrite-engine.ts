import { getFieldProductCopy, type FieldProductCopy, type FieldResultMode } from "@/lib/mini/field-product-copy";

/**
 * Lingxifield Dendritic Assessment Engine v2
 *
 * The Mini Program reads lived choices, behaviour and present state. Each
 * response activates product-specific knowledge nodes; adjacent activations
 * grow edges and a bounded propagation pass reveals the current structure.
 * It is deterministic, local, zero-token and independent from the website's
 * astronomical/temporal calculation.
 */

export type DendriteOption = { id: string; zh: string; en: string; activates: Record<string, number> };
export type DendriteQuestion = { id: string; sectionZh: string; sectionEn: string; zh: string; en: string; options: DendriteOption[] };
export type DendriteNode = { id: string; zh: string; en: string; meaningZh: string; meaningEn: string; actionZh: string; actionEn: string };
export type DendriteProduct = FieldProductCopy & {
  productId: string; leadZh: string; leadEn: string;
  sourceZh: string; sourceEn: string; nodes: DendriteNode[]; questions: DendriteQuestion[];
};

type Prompt = [sectionZh: string, sectionEn: string, zh: string, en: string, nodeIds?: string[]];
type Seed = Omit<DendriteProduct, "questions"> & { prompts: Prompt[] };

const node = (id: string, zh: string, en: string, meaningZh: string, meaningEn: string, actionZh: string, actionEn: string): DendriteNode =>
  ({ id, zh, en, meaningZh, meaningEn, actionZh, actionEn });

const lifeNodes = [
  node("exploration","探索驱动","Exploration","你从未知、变化与新可能中获得生命感。","You gain aliveness through the unknown, change and possibility.","为探索设置一个可回收的小范围。","Give exploration a small, reversible boundary."),
  node("stability","稳定承载","Stability","秩序、连续性与可预期性帮助你形成承载。","Order, continuity and predictability create capacity.","先守住一个稳定支点，再推进变化。","Protect one stable anchor before moving change."),
  node("agency","自主决定","Agency","你需要亲自确认方向，并为选择承担位置。","You need to confirm direction and own the choice.","把外部意见与自己的决定分开记录。","Separate external advice from your own decision."),
  node("connection","关系连接","Connection","关系回应与共同经历会放大你的感知。","Relational response and shared experience amplify perception.","提出一个具体、可回应的连接请求。","Make one concrete, answerable request for connection."),
  node("depth","深度觉察","Depth","你倾向进入经验背后的意义与内在结构。","You move toward the meaning and structure beneath experience.","在解释之前，先写下真实感受与事实。","Record feelings and facts before interpreting."),
  node("activation","行动启动","Activation","清晰往往在行动与反馈中形成。","Clarity often forms through action and feedback.","选择一个二十分钟内能完成的起步动作。","Choose a starting action that fits within twenty minutes."),
  node("organization","结构组织","Organization","你通过规划、分类与整合建立秩序。","You create order through planning, grouping and integration.","把当前复杂问题拆成三层。","Split the current complexity into three layers."),
  node("permeability","感受通透","Permeability","你能接收环境与他人的细微信号，也需要筛选。","You receive subtle environmental and relational signals and need filtering.","区分哪些感受来自自己，哪些来自场域。","Separate what is yours from what came from the field."),
];
const relationshipNodes = [
  node("approach","靠近方式","Approach","你如何发起、接住与调节关系距离。","How you initiate, receive and regulate distance.","用一次低压力靠近代替猜测。","Replace guessing with one low-pressure approach."),
  node("expression","情感表达","Expression","感受能否被准确说出并被对方理解。","Whether feelings can be expressed and understood accurately.","使用“我感到、我需要、我希望”表达。","Use: I feel, I need, I hope."),
  node("security","安全回应","Security","一致性、可预期回应与可信行动形成安全感。","Consistency, reliable response and trustworthy action create safety.","确认一个双方都能做到的稳定约定。","Confirm one reliable agreement both can keep."),
  node("boundary","边界位置","Boundary","亲近与自我空间之间需要清晰位置。","Closeness and personal space need clear positions.","说清一个可以与一个不可以。","Name one yes and one no clearly."),
  node("conflict","张力承接","Tension","差异出现时，系统如何承接而不升级。","How the system holds difference without escalation.","先降低强度，再讨论内容。","Lower intensity before discussing content."),
  node("repair","修复能力","Repair","关系能否在受伤、误解或中断后重新连接。","Whether connection can reform after hurt or rupture.","完成一次具体承认、回应和后续行动。","Complete one acknowledgment, response and follow-through."),
  node("vigilance","关系警觉","Vigilance","你会提前扫描拒绝、失控或不一致的信号。","You scan early for rejection, loss of control or inconsistency.","把事实、推测和旧经验分成三栏。","Separate facts, assumptions and old experience."),
  node("selfhold","自我持守","Self-holding","你在连接中保留自己的感受、节奏与选择。","You retain your feelings, pace and choices in connection.","靠近之前先确认自己的真实意愿。","Confirm your real willingness before moving closer."),
];
const resilienceNodes = [
  node("recovery","恢复节律","Recovery","消耗之后回到可用状态的速度与方式。","How you return to usable capacity after depletion.","为恢复安排真实空间，而非剩余时间。","Schedule real recovery space, not leftover time."),
  node("rebound","重新启动","Rebound","停顿、失败或偏转之后重新开始的能力。","Ability to restart after pause, failure or deviation.","把重新开始缩小成一个最低可行动作。","Shrink restart to one minimum viable action."),
  node("adaptability","变化适应","Adaptability","面对未知时调整策略而不失去方向。","Adjusting strategy without losing direction.","保留目标，允许路径更新。","Keep the aim and let the route change."),
  node("endurance","持续承压","Endurance","在长周期压力中维持投入的能力。","Ability to sustain engagement through prolonged pressure.","明确承压期限与退出条件。","Define the pressure window and exit condition."),
  node("stability","稳定支点","Stability","秩序、身体与关系支持形成回稳底座。","Order, body and relational support form a stabilizing base.","先恢复睡眠、饮食或日程中的一个支点。","Restore one anchor in sleep, food or schedule."),
  node("cost","恢复成本","Recovery Cost","表面恢复后仍可能残留情绪、身体或注意力成本。","Emotional, physical or attention cost may remain after apparent recovery.","把隐性恢复成本写进计划。","Include hidden recovery cost in the plan."),
];
const romanceNodes = [
  node("visibility","可感知度","Visibility","你的存在如何自然地被他人感受到。","How your presence is naturally perceived.","在适合的场景中增加一次真实露出。","Create one authentic moment of visibility."),
  node("expression","吸引表达","Expression","好感与兴趣如何被清晰传递。","How interest and attraction are communicated.","发出清晰但不越界的兴趣信号。","Send a clear, bounded signal of interest."),
  node("approach","靠近节奏","Approach","从注意到靠近之间的速度与方式。","The pace and way attention becomes approach.","选择与自己舒适度一致的靠近速度。","Choose a pace aligned with your comfort."),
  node("reception","接收能力","Reception","你是否允许自己接住赞赏、靠近与善意。","Whether you allow yourself to receive appreciation and approach.","接到善意时先不否定、不回避。","Receive kindness without dismissing or deflecting it."),
  node("response","真实回应","Response","互动出现后，你能否持续给出真实反馈。","Whether you sustain authentic feedback after contact begins.","用一个真实回应代替策略性沉默。","Replace strategic silence with one authentic response."),
  node("selection","关系选择","Selection","你如何辨认适合自己的连接。","How you discern fitting connection.","用价值一致性而非短期强度筛选。","Filter by value alignment, not short-term intensity."),
  node("exposure","情感暴露","Exposure","被看见、被拒绝与失控感带来的张力。","Tension around being seen, rejected or losing control.","只增加一级可承受的真实暴露。","Increase authentic exposure by one tolerable degree."),
  node("ambiguity","暧昧承压","Ambiguity","未定义关系中的耐受与消耗。","Tolerance and cost within undefined connection.","为模糊状态设置确认节点。","Set a checkpoint for ambiguity."),
  node("filtering","边界筛选","Filtering","吸引发生后对边界、意图与现实条件的辨认。","Discernment of boundaries, intent and reality after attraction.","观察行动连续性，而非只听表达。","Observe consistency of action, not words alone."),
  node("conversion","连接转化","Conversion","吸引是否能进入稳定、双向的真实关系。","Whether attraction can become stable mutual connection.","让下一步变得具体且双方可参与。","Make the next step concrete and mutual."),
];
const wealthNodes = [
  node("insight","价值洞察","Insight","发现未被看见的需求、结构与机会。","Seeing unmet needs, structures and opportunities.","验证一个真实需求，而非只验证想法。","Validate one real need, not only the idea."),
  node("creation","价值创造","Creation","把洞察转化为可使用、可交换的成果。","Turning insight into usable, exchangeable outcomes.","完成一个可以被体验的最小成果。","Complete one smallest experienceable outcome."),
  node("connection","资源连接","Connection","让人、信息、渠道与资源形成流动。","Making people, information, channels and resources flow.","连接两个原本分散但互补的资源。","Connect two separated but complementary resources."),
  node("mastery","专业深化","Mastery","通过长期积累形成可信能力与壁垒。","Building trusted capability through long-term accumulation.","选择一项值得连续深化的核心能力。","Choose one core capability for sustained depth."),
  node("amplification","价值放大","Amplification","通过系统、品牌与传播扩大成果影响。","Scaling impact through systems, brand and distribution.","把一次性成果变成可复用结构。","Turn a one-off result into a reusable structure."),
  node("capacity","承接容量","Capacity","承接机会、责任、现金流与复杂度的能力。","Capacity to hold opportunity, responsibility, cash flow and complexity.","先补足交付与边界，再扩大入口。","Strengthen delivery and boundaries before widening intake."),
];
const tideNodes = [
  node("energy","能量可用度","Energy","此刻身体与行动能量的可用程度。","Available bodily and action energy now.","按当前能量选择任务强度。","Match task intensity to available energy."),
  node("load","内在负载","Load","情绪、念头与未完成事项占用的容量。","Capacity occupied by emotion, thoughts and unfinished loops.","先关闭一个最消耗注意力的循环。","Close one attention-heavy loop first."),
  node("focus","注意焦点","Focus","注意力能否停留并形成清晰推进。","Whether attention can stay and form clear movement.","只保留一个当前焦点。","Keep one present focus."),
  node("social","连接开放度","Social Openness","此刻对交流、靠近与协作的开放程度。","Current openness to contact, closeness and collaboration.","尊重今天真实的连接容量。","Respect today's real capacity for connection."),
  node("work","工作主题","Work","今日信号主要聚焦于任务与创造。","Today's signal centers on work and creation.","选择最重要的一项推进。","Move the single most important item."),
  node("relationship","关系主题","Relationship","今日信号主要聚焦于关系互动。","Today's signal centers on relationship.","完成一次清晰回应。","Complete one clear response."),
  node("rest","回收主题","Rest","今日信号主要指向恢复与回收。","Today's signal points toward recovery.","为身体与注意力留出空白。","Leave open space for body and attention."),
  node("choice","选择主题","Choice","今日信号主要指向一个待确认的方向。","Today's signal points to a direction needing confirmation.","确认下一步而非一次决定全部。","Confirm the next step, not everything at once."),
];
const mirrorNodes = [
  node("clarity","清晰度","Clarity","你对当前事实、感受与方向的辨认。","Discernment of facts, feelings and direction.","写下此刻已知与未知。","Write what is known and unknown now."),
  node("momentum","推进力","Momentum","当前结构中已经形成的行动势能。","Action momentum already present in the structure.","沿已有势能完成一个小动作。","Complete one small action along existing momentum."),
  node("resistance","内在阻力","Resistance","犹疑、保护或冲突形成的停滞。","Stalling formed by hesitation, protection or conflict.","先理解阻力在保护什么。","Understand what resistance protects."),
  node("external","外部牵引","External Pull","环境、他人期待与现实条件的牵引。","Pull from context, expectations and real conditions.","区分必须回应与可以延后。","Separate must-answer from can-wait."),
  node("resource","可用资源","Resource","此刻已经存在的支持、能力与机会。","Support, ability and opportunity already available.","先调用一个现成资源。","Use one existing resource first."),
  node("cost","隐性代价","Hidden Cost","某个方向可能带来的注意力、关系或身体成本。","Attention, relational or bodily cost of a direction.","在决定前写下真实代价。","Name the real cost before deciding."),
  node("readiness","准备度","Readiness","内在与现实是否已具备进入下一步的条件。","Whether inner and outer conditions can hold the next step.","补齐最关键的一项前置条件。","Complete the most important prerequisite."),
  node("path","路径锁定","Path Lock","过早把可能性缩成唯一答案的倾向。","Tendency to collapse possibility into one answer too early.","保留第二条可行路径。","Keep a second viable path open."),
  node("leverage","关键杠杆","Leverage","少量改变即可带来结构变化的位置。","A point where small change can shift the structure.","寻找最小但影响最大的改变。","Find the smallest high-impact shift."),
];
const qianNodes = [
  node("source","源流背景","Source","长期携带的背景与底层倾向。","Long-held background and underlying tendency.","辨认长期主题，不把它当成限制。","Recognize the long theme without treating it as a limit."),
  node("soul","灵魂模式","Soul","此刻最值得被看见的核心模式。","The core pattern most worth seeing now.","为核心模式写下一句准确命名。","Give the core pattern one accurate name."),
  node("walker","行者选择","Wayfarer","你如何把内在选择带入现实。","How inner choice enters reality.","用行动为内在选择建立证据。","Give inner choice evidence through action."),
  node("recurring","重复主题","Recurring","正在反复出现并请求理解的经验。","Experience recurring and asking to be understood.","记录重复出现的触发与结果。","Record repeating triggers and outcomes."),
  node("transition","转化节点","Transition","旧结构松动、新结构尚未稳定的位置。","Where an old structure loosens before the new stabilizes.","允许过渡期存在，不急于定型。","Allow transition without rushing to define it."),
  node("embody","现实落点","Embodiment","内在理解真正进入关系、行动与选择的位置。","Where understanding becomes relationship, action and choice.","选择一个可被现实验证的落点。","Choose one reality-testable embodiment."),
];
const archetypeNodes = [
  node("blueprint","生命图谱","Blueprint","长期生命结构正在提供底层背景。","Long-term life structure provides the background.","回看长期重复而非单次事件。","Review long repetitions, not one event."),
  node("resonance","关系共振","Resonance","人与人之间的连接结构来到前景。","Relational structure has moved to the foreground.","观察互动如何共同形成结果。","Observe how interaction co-creates outcomes."),
  node("resilience","生命韧性","Resilience","压力、恢复与回稳结构正在增强。","Pressure, recovery and stabilization are intensifying.","优先补足系统承接力。","Strengthen systemic capacity first."),
  node("romance","桃花磁场","Romance","吸引、靠近与关系感知正在变得清晰。","Attraction, approach and relational perception are clarifying.","让吸引与筛选同时发生。","Let attraction and discernment coexist."),
  node("wealth","财富创造","Wealth","价值创造、资源与现实承接来到前景。","Value creation, resources and capacity are foregrounded.","把价值转化为可交付成果。","Turn value into a deliverable outcome."),
  node("tide","今日潮汐","Tide","当下状态与节律正在影响全部判断。","Present state and rhythm influence all judgments.","先校准状态，再决定强度。","Calibrate state before deciding intensity."),
  node("mirror","生命镜像","Mirror","经验中的象征映照正在请求理解。","Symbolic reflections in experience ask to be understood.","把象征带回真实经历确认。","Confirm symbols against lived experience."),
  node("oracle","生命灵签","Oracle","源流、灵魂与行动的原型连接正在增强。","Source, soul and action archetypes are linking.","让理解落到一个现实选择。","Ground understanding in one real choice."),
];

const cycle = (items: string[], start: number, count = 4) => Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
const prompts = (sectionZh: string, sectionEn: string, rows: Array<[string,string]>, nodeIds: string[]) =>
  rows.map(([zh,en], index): Prompt => [sectionZh, sectionEn, zh, en, cycle(nodeIds, index, Math.min(4, nodeIds.length))]);

const lifePrompts: Prompt[] = [
  ...prompts("现实倾向","Lived orientation",[["进入陌生环境时，你通常先做什么？","What do you do first in an unfamiliar setting?"],["面对新机会时，你最自然的反应是什么？","What is your natural response to a new opportunity?"],["做重要决定时，什么最能让你确认方向？","What most confirms an important direction?"],["没有明确规则时，你通常怎样开始？","How do you begin when rules are unclear?"],["一段生活失去秩序时，你先恢复什么？","What do you restore first when life loses order?"],["你最容易在什么状态中感到有生命力？","When do you feel most alive?"],["他人的期待与你不同，你会怎样回应？","How do you respond when expectations differ from yours?"],["复杂经验出现时，你更愿意怎样理解它？","How do you understand complex experience?"],["长期目标需要推进时，你依靠什么？","What carries a long-term goal forward?"],["情绪与现实任务同时出现时，你先处理什么？","What comes first when emotion and tasks arrive together?"],["你通常通过什么感到自己正在成长？","What makes growth feel real to you?"],["回看过去一年，哪种力量最常帮助你？","Which force helped you most in the past year?"]],lifeNodes.map(n=>n.id)),
  ...prompts("结构量表","Structural scale",[["当方向清晰时，你能迅速进入行动。","When direction is clear, you can move quickly."],["你需要稳定节奏，才能持续投入。","You need a stable rhythm for sustained engagement."],["你能敏锐感受到环境与他人的变化。","You readily perceive shifts in context and people."],["你习惯把分散经验整理成结构。","You tend to organize scattered experience into structure."],["重要关系会显著影响你的选择。","Important relationships strongly affect your choices."],["你愿意进入问题背后更深的意义。","You are willing to enter the deeper meaning beneath a problem."]],lifeNodes.map(n=>n.id)),
  ...prompts("现实两难","Lived dilemmas",[["自由探索与稳定承诺同时出现时，你更靠近哪边？","When exploration and stable commitment conflict, where do you lean?"],["独立决定与共同协商冲突时，你如何取舍？","How do you choose between autonomy and joint agreement?"],["立即行动与继续理解冲突时，你更常选择什么？","What do you choose between immediate action and deeper understanding?"],["照顾他人感受与守住自己边界冲突时，你怎样回应？","How do you respond when care conflicts with boundaries?"],["计划被打断时，你更依靠调整还是重建秩序？","After disruption, do you adapt or rebuild order?"],["外部机会很多但内在不确定时，你从哪里确认？","Where do you confirm direction amid many opportunities and inner uncertainty?"]],lifeNodes.map(n=>n.id)),
];
const relationshipPrompts: Prompt[] = [
  ...prompts("靠近与表达","Approach and expression",[["当你想靠近一个重要的人时，通常怎样发出信号？","How do you signal approach to someone important?"],["对方回应变慢时，你最先注意到什么？","What do you notice first when responses slow?"],["需要被理解时，你通常怎样表达？","How do you express a need to be understood?"],["关系进入更深层时，什么让你感到安心？","What creates safety as connection deepens?"],["需要独处时，你会如何告诉对方？","How do you communicate a need for space?"],["对方情绪强烈时，你自然站在哪个位置？","What position do you take around strong emotion?"]],relationshipNodes.map(n=>n.id)),
  ...prompts("差异与修复","Difference and repair",[["意见冲突出现时，你的第一反应是什么？","What is your first response to conflict?"],["争执之后，你更容易等待还是主动修复？","After conflict, do you wait or initiate repair?"],["被误解时，你最希望对方做什么？","What do you most want when misunderstood?"],["对方越过边界时，你通常怎样处理？","What do you do when a boundary is crossed?"],["承诺没有兑现时，你如何判断这段关系？","How do you read an unkept promise?"],["同一个问题重复出现时，你更想改变什么？","What do you want to change when a problem repeats?"]],relationshipNodes.map(n=>n.id)),
  ...prompts("共同创造","Co-creation",[["两个人要做共同决定时，你更自然承担什么？","What do you naturally carry in joint decisions?"],["双方节奏不同时，你通常怎样协调？","How do you coordinate different rhythms?"],["关系需要长期维护时，什么最重要？","What matters most in sustaining a relationship?"],["亲近与自由同时重要时，你如何平衡？","How do you balance closeness and freedom?"],["一方处于低谷时，怎样的支持最适合你？","What support feels right when one person is low?"],["此刻这段关系最需要被看见的结构是什么？","What structure most needs to be seen now?"]],relationshipNodes.map(n=>n.id)),
  ...prompts("关系校准","Relational calibration",[["你以为自己表达清楚时，对方通常接收到什么？","What does the other receive when you think you were clear?"],["关系安稳时，你是否仍能说出不同意见？","Can you voice difference when the relationship feels safe?"],["支持对方时，你更容易解决问题还是陪伴感受？","Do you solve or accompany when offering support?"],["一次修复真正完成的标志是什么？","What marks a repair as complete?"],["你会在什么时候为了关系放弃自己的位置？","When do you abandon your position for connection?"],["这段关系目前最缺少哪一种可验证的回应？","What verifiable response is most missing now?"]],relationshipNodes.map(n=>n.id)),
];
const resiliencePrompts: Prompt[] = [
  ...prompts("冲击反应","Impact response",[["计划突然偏转时，你的第一反应是什么？","What is your first response when plans shift?"],["连续压力出现时，身体最先发出什么信号？","What signal appears first under repeated pressure?"],["一件重要的事失败后，你通常怎样度过最初阶段？","How do you move through the first stage after failure?"],["未知持续太久时，你更容易卡在哪里？","Where do you get stuck when uncertainty lasts?"],["外部要求快速增加时，你会先保护什么？","What do you protect first as demands rise?"],["支持突然减少时，你依靠什么回稳？","What stabilizes you when support drops?"]],resilienceNodes.map(n=>n.id)),
  ...prompts("恢复路径","Recovery path",[["一段消耗结束后，什么最能帮助你回来？","What best helps you return after depletion?"],["你怎样判断自己已经真正恢复？","How do you know recovery is real?"],["需要重新开始时，最有效的启动方式是什么？","What is the most effective restart?"],["节奏被打乱后，你先恢复身体还是计划？","After disruption, do you restore body or plan first?"],["情绪仍在但任务必须继续时，你怎么做？","What do you do when emotion remains but work continues?"],["长期承压时，什么容易被你忽略？","What do you overlook under prolonged pressure?"]],resilienceNodes.map(n=>n.id)),
  ...prompts("现实韧性","Applied resilience",[["变化无法避免时，你更愿意调整什么？","What do you adjust when change is unavoidable?"],["多个问题同时发生时，你如何排序？","How do you prioritize simultaneous problems?"],["需要求助时，什么最阻碍你开口？","What blocks you from asking for help?"],["重新建立稳定时，你最信任哪个支点？","Which anchor do you trust when rebuilding stability?"],["表面恢复后，哪种成本还会停留？","What cost remains after apparent recovery?"],["下一次偏转发生前，你最想提前建立什么？","What do you want in place before the next disruption?"]],resilienceNodes.map(n=>n.id)),
  ...prompts("恢复校准","Recovery calibration",[["恢复速度与恢复质量不一致时，你会先相信哪一个？","Which do you trust when recovery speed and quality differ?"],["压力解除后，你还需要多久才能重新感到可用？","How long after pressure ends until you feel usable?"],["坚持正在变成透支时，什么信号最先出现？","What first signals that endurance is becoming depletion?"],["哪一种支持能减少恢复成本，而不只让你继续撑住？","What support reduces recovery cost rather than extending endurance?"],["重复失败出现时，你更需要调整策略还是恢复信心？","After repeated failure, do you need strategy change or confidence recovery?"],["下次压力到来前，哪个边界需要提前建立？","What boundary should exist before the next pressure cycle?"]],resilienceNodes.map(n=>n.id)),
];
const romancePrompts: Prompt[] = [
  ...prompts("吸引显现","Attraction",[["进入新社交场景时，你的吸引力通常怎样出现？","How does attraction appear in a new social setting?"],["遇到有好感的人时，你最自然的状态是什么？","What is natural around someone you like?"],["你更容易因为什么被他人记住？","What makes others remember you?"],["你通常怎样让好感被对方感受到？","How do you let interest be felt?"],["被赞赏时，你会怎样接住？","How do you receive appreciation?"]],romanceNodes.map(n=>n.id)),
  ...prompts("靠近互动","Approach",[["确认彼此有兴趣后，你倾向怎样靠近？","How do you approach after mutual interest?"],["对方释放模糊信号时，你怎么回应？","How do you respond to ambiguous signals?"],["聊天很投契但现实节奏不同，你会怎样处理？","What do you do when conversation flows but rhythms differ?"],["关系尚未定义时，什么最容易消耗你？","What drains you most before definition?"],["对方主动靠近时，你最需要确认什么？","What do you need to confirm when someone approaches?"]],romanceNodes.map(n=>n.id)),
  ...prompts("筛选与转化","Discernment",[["强烈心动与稳定回应不一致时，你更相信什么？","What do you trust when intensity and consistency differ?"],["发现价值观差异时，你会怎样判断？","How do you judge a value difference?"],["关系推进过快时，你会如何调节？","How do you regulate a fast-moving connection?"],["需要表达边界时，你通常怎么做？","How do you express a boundary?"],["一次连接没有继续，你更容易如何理解？","How do you understand a connection that did not continue?"]],romanceNodes.map(n=>n.id)),
  ...prompts("真实频率","Authentic frequency",[["你希望别人首先感受到你的哪一面？","What do you want others to feel first?"],["什么样的互动最容易形成真实回应？","What interaction most readily creates real response?"],["你最想减少哪一种关系消耗？","Which relational drain do you most want to reduce?"],["真实成为自己时，你会释放怎样的信号？","What signal appears when you are authentically yourself?"],["下一段连接中，你最想守住什么？","What do you most want to preserve in the next connection?"]],romanceNodes.map(n=>n.id)),
  ...prompts("连接校准","Connection calibration",[["对方如何才能准确知道你愿意继续靠近？","How can someone know you welcome further approach?"],["吸引强度与现实适配冲突时，你如何判断？","How do you choose when attraction and real fit conflict?"],["你会在哪个环节过早替关系下结论？","Where do you conclude too early?"],["什么现实行动能区分想象中的吸引与双向连接？","What real action distinguishes imagined attraction from mutual connection?"]],romanceNodes.map(n=>n.id)),
];
const wealthPrompts: Prompt[] = [
  ...prompts("价值发现","Value discovery",[["机会刚出现时，你最先看见什么？","What do you see first in an opportunity?"],["别人忽略的问题中，你更容易发现什么？","What do you notice in overlooked problems?"],["一个想法是否值得投入，你依据什么判断？","How do you judge whether an idea deserves investment?"],["面对新领域时，你通常从哪里建立理解？","Where do you build understanding in a new field?"],["什么样的工作最容易让你进入投入状态？","What work most readily engages you?"]],wealthNodes.map(n=>n.id)),
  ...prompts("创造推进","Creation",[["从想法到成果，哪一步最像你的优势？","Which step from idea to outcome is your strength?"],["资源有限时，你优先把力量放在哪里？","Where do you place energy with limited resources?"],["项目卡住时，你通常先改变什么？","What do you change first when a project stalls?"],["长期积累尚未被看见时，你会怎样继续？","How do you continue when accumulation is unseen?"],["需要交付时，你最重视什么？","What matters most in delivery?"]],wealthNodes.map(n=>n.id)),
  ...prompts("资源配置","Allocation",[["若有一百份精力，你会把最大部分放在哪里？","Where would the largest share of 100 units of energy go?"],["新增资源到来时，你优先投入产品、能力还是传播？","Where does new resource go first: product, capability or reach?"],["合作机会出现时，你最先评估什么？","What do you assess first in collaboration?"],["现金流与长期价值冲突时，你怎样取舍？","How do you choose between cash flow and long-term value?"],["规模扩大前，你认为必须补足什么？","What must be strengthened before scale?"]],wealthNodes.map(n=>n.id)),
  ...prompts("现实承接","Real-world capacity",[["价值无法继续流动时，最常见的阻力是什么？","What most often blocks value flow?"],["他人认可你的能力时，你能否自然定价？","Can you price naturally when ability is recognized?"],["机会超出当前容量时，你会怎样处理？","What do you do when opportunity exceeds capacity?"],["重复劳动增多时，你会先系统化什么？","What do you systematize first as repetition grows?"],["下一阶段最需要放大的是什么？","What most needs amplification next?"],["怎样的创造方式最适合长期持续？","What creation mode is most sustainable long term?"]],wealthNodes.map(n=>n.id)),
  ...prompts("价值验证","Value validation",[["已经形成的价值，外部世界实际接收到了多少？","How much of created value has the outside world received?"],["当前阻塞更接近产品、表达、交换还是承接？","Is the present block in product, expression, exchange or capacity?"],["未来七天哪一次真实交付最能验证价值流？","Which delivery in seven days would best validate value flow?"]],wealthNodes.map(n=>n.id)),
];
const tidePrompts: Prompt[] = [
  ...prompts("身体与能量","Body and energy",[["醒来以后，身体最接近哪种可用状态？","How available did your body feel after waking?"],["开始第一件事时，行动能量怎样变化？","How did action energy change when you began?"],["今天什么时刻最明显地消耗了你？","What moment depleted you most today?"],["身体此刻最明确的请求是什么？","What is your body's clearest request now?"],["如果减少一项消耗，你会先减少什么？","What drain would you reduce first?"],["今天还有多少能量可以安全使用？","How much energy is safely usable today?"]],tideNodes.map(n=>n.id)),
  ...prompts("负载与专注","Load and focus",[["今天有多少未完成事项仍占据注意力？","How many unfinished loops still occupy attention?"],["情绪出现时，专注最容易在哪里中断？","Where does focus break when emotion appears?"],["此刻能否连续完成一段不被切碎的工作？","Can you complete one unfragmented work interval now?"],["外部信息增加时，你怎样保护注意力？","How do you protect attention as input rises?"],["当前最需要关闭的是哪个内在循环？","Which inner loop most needs closure?"],["只保留一件事时，你会留下什么？","What remains if you keep only one task?"]],tideNodes.map(n=>n.id)),
  ...prompts("关系窗口","Relational window",[["今天面对交流，你更开放还是更需要距离？","Are you open to contact or needing distance today?"],["收到他人信息时，你有多少真实回应空间？","How much real response capacity do you have?"],["哪一种关系互动最可能恢复你的状态？","Which interaction could restore your state?"],["哪一种互动最容易增加今天的负载？","Which interaction most adds to today's load?"],["需要协作时，你能否清楚表达当前容量？","Can you state your capacity clearly in collaboration?"],["今天最适合怎样的连接强度？","What intensity of connection fits today?"]],tideNodes.map(n=>n.id)),
  ...prompts("今日方向","Today's direction",[["今天最值得推进的是工作、关系、恢复还是选择？","What most deserves movement: work, relationship, recovery or choice?"],["当前状态允许你做出多大的决定？","How large a decision can today's state hold?"],["什么行动会让今天结束时更完整？","What action would make today feel more complete?"],["若不追求效率，今天真正重要的是什么？","What matters today without chasing efficiency?"],["今天需要增加什么，也需要停止什么？","What needs adding and what needs stopping?"],["明天回看时，你希望保留哪条状态证据？","What state evidence do you want to retain tomorrow?"]],tideNodes.map(n=>n.id)),
];
const mirrorPrompts: Prompt[] = [
  ["映照主题","Reflection theme","此刻你最想带入三重镜像的主题是什么？","What theme do you bring into the threefold mirror?",["clarity","external","resource","leverage"]],
  ...prompts("九重映照","Nine reflections",[["最近反复回到心里的是什么？","What has repeatedly returned to mind?"],["面对这件事，此刻最真实的感受是什么？","What feeling is most real here?"],["你已经知道但尚未承认的是什么？","What do you know but have not acknowledged?"],["外部环境正在怎样影响你？","How is context influencing you?"],["你已经拥有哪项可用资源？","What resource is already available?"],["当前方向可能带来什么隐性代价？","What hidden cost may this direction carry?"],["进入下一步前，还缺少什么条件？","What condition is missing before the next step?"],["你是否过早把答案锁定为一种？","Have you locked the answer too early?"],["哪个最小改变可能撬动整体？","What smallest shift could move the whole?"]],mirrorNodes.map(n=>n.id)),
  ...prompts("经验镜像","Experience mirror",[["过去哪段经验正在替你解释现在？","Which past experience is interpreting the present?"],["这件事触发了你哪一种熟悉的保护？","What familiar protection did this activate?"],["旧经验与当前事实最不同的地方是什么？","How does the present differ from the old experience?"],["如果不沿用旧结论，你还能看见什么？","What appears without the old conclusion?"],["哪一种重复反应曾经有用、现在却开始限制？","What response once helped but now limits?"],["过去留下的哪项能力仍可使用？","What past-earned capacity remains useful?"],["需要归还给过去的是什么？","What belongs back in the past?"]],mirrorNodes.map(n=>n.id)),
  ...prompts("展开镜像","Unfolding mirror",[["若移动一个条件，哪条路径会先出现？","Which path appears if one condition moves?"],["哪项资源能降低下一步的风险？","What resource lowers the next step's risk?"],["什么反馈可以帮助你验证方向？","What feedback could validate direction?"],["保留第二条路径会带来什么空间？","What space comes from keeping a second path?"],["怎样的动作既真实又可撤回？","What action is real yet reversible?"],["当前最小杠杆点在哪里？","Where is the smallest leverage point?"],["三天内可以完成什么现实实验？","What real experiment fits within three days?"]],mirrorNodes.map(n=>n.id)),
];
const qianPrompts: Prompt[] = [
  ...prompts("源流签","Source Sign",[["哪种长期主题最像你的生命背景？","Which long theme resembles your background?"],["什么经验总以不同形式重新出现？","What returns in different forms?"],["你从过去携带了哪一种力量？","What strength do you carry from the past?"],["哪种旧结构正在请求被重新理解？","Which old structure asks to be re-understood?"]],qianNodes.map(n=>n.id)),
  ...prompts("灵魂签","Soul Sign",[["此刻最值得被看见的核心模式是什么？","What core pattern most needs seeing?"],["什么正在你内在变得更清晰？","What is becoming clearer within?"],["你正在松开什么旧的回应？","What old response are you releasing?"],["哪种真实感受最需要被允许？","What real feeling needs permission?"]],qianNodes.map(n=>n.id)),
  ...prompts("行者签","Wayfarer Sign",[["哪个选择最需要被带进现实？","Which choice most needs embodiment?"],["下一步最小而真实的行动是什么？","What is the smallest real next action?"],["你希望用什么方式回应正在发生的变化？","How do you want to respond to change?"],["哪项行动会为新结构建立证据？","What action would evidence the new structure?"]],qianNodes.map(n=>n.id)),
  ...prompts("象征确认","Symbolic confirmation",[["哪一个意象最能承载你此刻的主题？","Which image best holds your current theme?"],["什么象征让你感到靠近而不是被定义？","What symbol invites rather than defines you?"],["这组象征更像提醒、许可还是行动？","Is this symbol a reminder, permission or action?"],["它与你最近哪件真实经历发生连接？","Which recent experience does it connect with?"],["如果把象征放回现实，最先改变什么？","What changes first when symbol returns to reality?"],["哪种解释听起来漂亮却不符合事实？","Which attractive interpretation does not fit the facts?"],["你愿意用什么证据确认这次映照？","What evidence will confirm this reflection?"],["哪个旧命名需要被重新理解？","Which old label needs reinterpretation?"],["此刻真正需要守住的核心是什么？","What core needs protection now?"],["什么行动会让理解不只停留在语言里？","What action moves understanding beyond words?"],["三天后，你会用什么变化判断它有用？","What change in three days would show usefulness?"],["你愿意把注意力落在哪一个现实位置？","Where in reality will you place attention?"]],qianNodes.map(n=>n.id)),
];
const archetypePrompts: Prompt[] = [
  ["当前主题","Current theme","此刻最占据你注意力的是哪一片生命场域？","Which life field holds most of your attention now?",archetypeNodes.slice(0,4).map(n=>n.id)],
  ["直觉选择","Intuitive choice","哪一部分表面平静，内里却持续活动？","What looks quiet but remains active underneath?",archetypeNodes.slice(4,8).map(n=>n.id)],
  ["直觉选择","Intuitive choice","最近反复出现的经验更接近哪个场域？","Which field best matches recent repeating experience?",["resonance","resilience","wealth","mirror"]],
  ["行动落点","Action point","接下来七天，什么最需要成为行动？","What most needs to become action in the next seven days?",["blueprint","romance","tide","oracle"]],
];

function makeSeed(productId: string, nodes: DendriteNode[], prompts: Prompt[]): Seed {
  const copy = getFieldProductCopy(productId);
  if (!copy) throw new Error(`missing field product copy: ${productId}`);
  return { productId, ...copy, leadZh: copy.cardDefinitionZh, leadEn: copy.cardDefinitionEn, sourceZh: copy.readingZh, sourceEn: copy.readingEn, nodes, prompts };
}

const seeds: Seed[] = [
  makeSeed("life-map-report", lifeNodes, lifePrompts),
  makeSeed("relationship-resonance", relationshipNodes, relationshipPrompts),
  makeSeed("resilience-report", resilienceNodes, resiliencePrompts),
  makeSeed("romance-report", romanceNodes, romancePrompts),
  makeSeed("wealth-report", wealthNodes, wealthPrompts),
  makeSeed("daily-tide-report", tideNodes, tidePrompts),
  makeSeed("tarot-reading", mirrorNodes, mirrorPrompts),
  makeSeed("qian-reading", qianNodes, qianPrompts),
  makeSeed("life-archetype", archetypeNodes, archetypePrompts),
];

function buildQuestions(seed: Seed): DendriteQuestion[] {
  const byId = new Map(seed.nodes.map(item => [item.id,item]));
  return seed.prompts.map(([sectionZh,sectionEn,zh,en,ids],questionIndex) => {
    const selectedIds = ids?.filter(id => byId.has(id)) ?? cycle(seed.nodes.map(item=>item.id),questionIndex);
    return { id:`q${questionIndex+1}`,sectionZh,sectionEn,zh,en,options:selectedIds.map((id,optionIndex) => {
      const current = byId.get(id)!;
      const companion = selectedIds[(optionIndex+2)%selectedIds.length];
      return {id:`${questionIndex+1}-${optionIndex+1}`,zh:current.meaningZh,en:current.meaningEn,activates:{[id]:1,[companion]:0.22}};
    })};
  });
}

export const DENDRITE_PRODUCTS: DendriteProduct[] = seeds.map(seed => ({...seed,questions:buildQuestions(seed)}));
export const DENDRITE_PRODUCT_IDS = new Set(DENDRITE_PRODUCTS.map(item=>item.productId));
export const DENDRITE_QUESTION_COUNTS = Object.fromEntries(DENDRITE_PRODUCTS.map(item=>[item.productId,item.questions.length]));
export const getDendriteProduct = (productId:string) => DENDRITE_PRODUCTS.find(item=>item.productId===productId);

export type DendriteResult = {
  algorithm:"lingxifield-dendritic-v2";
  nodes:Array<DendriteNode & {score:number}>;
  dominant:Array<DendriteNode & {score:number}>;
  edges:Array<{from:string;to:string;weight:number}>;
  titleZh:string;titleEn:string;insightZh:string;insightEn:string;
  chapters:Array<{id:string;titleZh:string;titleEn:string;bodyZh:string;bodyEn:string}>;
  evidence:{answered:number;total:number;historyProducts:number;sourceZh:string;sourceEn:string};
  archetypeCardIndexes?:number[];cardRolesZh?:string[];cardRolesEn?:string[];
  artworkIndex?: number;
  sourceProducts?: string[];
};

export const BASE_DENDRITE_PRODUCT_IDS = [
  "life-map-report", "relationship-resonance", "resilience-report", "romance-report",
  "wealth-report", "daily-tide-report", "tarot-reading", "qian-reading",
] as const;

type SavedFieldResult = { productId: string; result: DendriteResult };

/**
 * FIELD 09 is deliberately not a ninth questionnaire. It is generated only
 * from one recent, saved result for every one of the eight independent fields.
 * The calculation preserves disagreements between fields as tension instead
 * of flattening eight reports into a prose summary.
 */
export function calculateLifeArchetypeFromReports(fields: SavedFieldResult[]): DendriteResult {
  const product = getDendriteProduct("life-archetype");
  if (!product || new Set(fields.map((field) => field.productId)).size !== BASE_DENDRITE_PRODUCT_IDS.length) {
    throw new Error("life archetype requires eight recent fields");
  }
  const nodeByProduct: Record<string, string> = {
    "life-map-report":"blueprint", "relationship-resonance":"resonance", "resilience-report":"resilience",
    "romance-report":"romance", "wealth-report":"wealth", "daily-tide-report":"tide",
    "tarot-reading":"mirror", "qian-reading":"oracle",
  };
  const evidenceByNode = new Map<string, SavedFieldResult>();
  const nodes = product.nodes.map((item) => {
    const field = fields.find((candidate) => nodeByProduct[candidate.productId] === item.id)!;
    evidenceByNode.set(item.id, field);
    const top = field.result.dominant.slice(0, 3);
    const score = Math.round(top.reduce((sum, signal, index) => sum + signal.score * [0.5, 0.3, 0.2][index], 0));
    return { ...item, score };
  });
  const ordered = [...nodes].sort((a, b) => b.score - a.score);
  const edges = ordered.flatMap((left, index) => ordered.slice(index + 1).map((right) => ({
    from: left.id, to: right.id,
    weight: Math.max(0.12, 1 - Math.abs(left.score - right.score) / 100),
  }))).sort((a, b) => b.weight - a.weight);
  const dominant = ordered.slice(0, 3);
  const quiet = ordered[ordered.length - 1];
  const strongestFields = dominant.map((item) => evidenceByNode.get(item.id)!);
  const sourceNames = strongestFields.map((field) => field.result.titleZh);
  const signature = fields.map((field) => `${field.productId}:${field.result.dominant.map((node) => `${node.id}:${node.score}`).join(",")}`).join("|");
  const artworkIndex = [...signature].reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) >>> 0, 2166136261) % 120;
  const chapters = [
    { id:"archetype", titleZh:"当前原型结构", titleEn:"Current Archetype Structure", bodyZh:`当前来到前景的不是一个人格标签，而是「${dominant[0].zh}」提供方向、「${dominant[1].zh}」提供现实接口、「${dominant[2].zh}」调节行动强度的三层结构。三者必须同时读取，任何单一结果都不足以代替这一结构。`, bodyEn:`This is not a personality label. ${dominant[0].en} supplies direction, ${dominant[1].en} a real-world interface, and ${dominant[2].en} regulates intensity. None of the three can substitute for the whole structure.` },
    { id:"evidence", titleZh:"跨域证据链", titleEn:"Cross-field Evidence Chain", bodyZh:`结构由八份一年内有效档案交叉形成。当前最强的三条证据分别是「${sourceNames[0]}」「${sourceNames[1]}」「${sourceNames[2]}」。系统保留它们各自的节点、强度与上下文，只把能够跨域相连的部分带入原型。`, bodyEn:`Eight valid archives from the past year form this structure. The three strongest evidence lines are ${sourceNames.join(", ")}. Their nodes, strength and context remain distinct; only cross-field connections enter the archetype.` },
    { id:"relation", titleZh:"相互增强的位置", titleEn:"Mutual Reinforcement", bodyZh:`「${dominant[0].zh}」与「${dominant[1].zh}」当前具有最强的结构邻近：前者若获得现实入口，后者会被增强；后者若持续缺席，前者容易停留在理解而无法形成新证据。`, bodyEn:`${dominant[0].en} and ${dominant[1].en} currently have the strongest structural proximity. A real-world entrance amplifies both; without it, insight may fail to become new evidence.` },
    { id:"tension", titleZh:"真实张力", titleEn:"Structural Tension", bodyZh:`「${quiet.zh}」并非能力不足，而是它与当前前景结构的参与度最低。真正的张力在于：高强度节点会继续推动系统，而较弱节点尚未提供足够承接。若忽略这一差异，推进速度可能高于现实容量。`, bodyEn:`${quiet.en} is not a deficit; it participates least in the current foreground. Strong nodes may move faster than the quieter field can hold, creating a gap between momentum and capacity.` },
    { id:"entry", titleZh:"唯一现实入口", titleEn:"One Reality Entry", bodyZh:`未来七天只验证一个动作：${dominant[0].actionZh}同时记录它是否增强「${dominant[1].zh}」，以及是否让「${quiet.zh}」获得更多参与。原型的价值来自新证据，而不是再次解释旧结论。`, bodyEn:`For seven days, test one action only: ${dominant[0].actionEn} Record whether it strengthens ${dominant[1].en} and gives ${quiet.en} more participation. An archetype gains value from new evidence, not another summary of old conclusions.` },
  ];
  return {
    algorithm:"lingxifield-dendritic-v2", nodes:ordered, dominant, edges,
    titleZh:`${dominant[0].zh} × ${dominant[1].zh} × ${dominant[2].zh}`,
    titleEn:`${dominant[0].en} × ${dominant[1].en} × ${dominant[2].en}`,
    insightZh:"八个支流已在一年有效期内全部激活。当前原型呈现跨域增强、承接差异与现实入口，不是八份报告的摘要。",
    insightEn:"All eight tributaries are active within the one-year window. This archetype reads cross-field reinforcement, capacity gaps and one reality entrance—not a summary of eight reports.",
    chapters,
    evidence:{answered:192,total:192,historyProducts:8,sourceZh:"一年内八个已完成并授权保存的独立场域档案",sourceEn:"Eight completed and authorized independent field archives within one year"},
    artworkIndex, sourceProducts: BASE_DENDRITE_PRODUCT_IDS.slice(),
    cardRolesZh:["八重场域汇流原型"], cardRolesEn:["Eight-field Convergent Archetype"],
  };
}

export function archetypeCardIndexesFor(nodes:Array<{id:string;score:number}>) {
  return nodes.slice(0,1).map((item,index)=>[...`${item.id}:${item.score}:${index}`].reduce((sum,char)=>(sum*33+char.charCodeAt(0))%64,17));
}
function oracleCardIndexesFor(nodes:Array<{id:string;score:number}>) {
  const hash=(item:{id:string;score:number},index:number,size:number)=>[...`${item.id}:${item.score}:${index}`].reduce((sum,char)=>(sum*31+char.charCodeAt(0))%size,11);
  return [hash(nodes[0],0,24),24+hash(nodes[1],1,24),48+hash(nodes[2],2,16)];
}

function productDiagnosis(productId: string, first: DendriteResult["dominant"][number], second: DendriteResult["dominant"][number], quiet: DendriteResult["nodes"][number]) {
  const layers: Record<string, { mechanism: string; impact: string; verify: string }> = {
    "life-map-report": { mechanism:`需要核对的不是“你是什么类型”，而是「${first.zh}」这一本源倾向进入现实后，是否被「${second.zh}」转译，或因「${quiet.zh}」参与不足而发生偏移。`, impact:"若偏移长期存在，能力仍在，但日常选择会越来越像在维持角色，而不是使用自己的自然结构。", verify:"分别记录一个无人要求时的自然选择与一个现实责任中的选择，比较两者差异。" },
    "relationship-resonance": { mechanism:`关系断点不在抽象的合不合适，而在「${first.zh}」发出的信号能否被「${second.zh}」接收，以及「${quiet.zh}」缺席时双方怎样误读。`, impact:"同一份在意可能被翻译成完全不同的支持语言，最终形成感知落差而非感情缺失。", verify:"完成一次只描述事实、感受和具体请求的对话，观察对方实际接收到什么。" },
    "resilience-report": { mechanism:`恢复不能只看速度。「${first.zh}」说明你怎样回来，「${second.zh}」说明怎样继续，而「${quiet.zh}」揭示恢复后是否仍有未计算的成本。`, impact:"表面重新运转不等于内部资源已经恢复；若成本长期不可见，下一次压力会更早触发耗竭。", verify:"连续七天分开记录外部功能恢复与内部可用能量，寻找二者的时间差。" },
    "romance-report": { mechanism:`当前吸引场的关键不是有没有吸引，而是「${first.zh}」产生后能否通过「${second.zh}」进入双向互动；「${quiet.zh}」显示信号最可能中止的位置。`, impact:"内在已有兴趣、外部仍保持中性时，对方接收到的往往不是谨慎，而是缺少继续靠近的许可。", verify:"发出一个清晰但有边界的兴趣信号，只观察回应，不提前替对方下结论。" },
    "wealth-report": { mechanism:`价值流的强项位于「${first.zh}」，现实转化依赖「${second.zh}」，而「${quiet.zh}」是当前最可能让价值停止的环节。`, impact:"继续强化已经很强的环节会增加努力感，却未必让价值被看见、交换、复制或承接。", verify:"选一个已有成果，明确它的使用者、交付形式和下一次真实交换。" },
    "daily-tide-report": { mechanism:`今天的判断受「${first.zh}」主导，并由「${second.zh}」调节；「${quiet.zh}」说明此刻不适合被强行调用的容量。`, impact:"状态不是人格。若用低容量的一天承担高强度决定，结论会混入疲劳、负载或关系窗口收窄。", verify:"按当前容量调整一项任务强度，今晚只记录状态是否回升。" },
    "tarot-reading": { mechanism:`三重镜像把「${first.zh}」放在前景，再用「${second.zh}」打开第二观察面；「${quiet.zh}」是尚未被纳入判断的变量。`, impact:"停滞往往不是没有答案，而是经验、现实条件与行动空间被压在同一个观察位置。", verify:"把已知事实、旧经验和条件路径分成三栏，移动其中一个最小变量。" },
    "qian-reading": { mechanism:`象征坐标由「${first.zh}」确定注意力中心，「${second.zh}」提供现实方向；「${quiet.zh}」提醒你不要把象征误读成结论。`, impact:"灵签的价值不在给出未来，而在让难以命名的经验获得一个可回到现实验证的位置。", verify:"选择一条最有触动的象征句，为它安排一个三天内可观察的现实动作。" },
  };
  return layers[productId] ?? { mechanism:"当前结构需要回到真实情境确认。", impact:"分数只表示本次证据强度。", verify:first.actionZh };
}

function chapterBody(mode: FieldResultMode, product: DendriteProduct, dominant: DendriteResult["dominant"], quiet: DendriteResult["nodes"][number], left: DendriteResult["nodes"][number], right: DendriteResult["nodes"][number], historyProducts: number) {
  const first = dominant[0], second = dominant[1], third = dominant[2];
  const diagnosis = productDiagnosis(product.productId, first, second, quiet);
  const bodies: Record<FieldResultMode, { zh: string; en: string }> = {
    core: {
      zh: `本次读取中，「${first.zh}」最先来到前景，并与「${second.zh}」「${third.zh}」共同形成${product.nameZh}的当前主结构。${first.meaningZh}${diagnosis.mechanism}这是一段当前证据，不是固定人格。`,
      en: `${first.en} moves to the foreground and combines with ${second.en} and ${third.en} as the present core of ${product.nameEn}. ${first.meaningEn} This is current evidence, not a fixed identity.`,
    },
    primary: {
      zh: `「${first.zh}」是当前最稳定的信号。${first.meaningZh}它的意义不在分数高低，而在于它是否跨越不同题目与情境持续出现。`,
      en: `${first.en} is the most stable current signal. ${first.meaningEn} Its value lies not in the number alone, but in whether it persists across different scenarios.`,
    },
    secondary: {
      zh: `「${second.zh}」与「${third.zh}」决定主要力量如何进入现实。前者提供运行方式，后者显示当前情境对它的调节。${diagnosis.impact}`,
      en: `${second.en} and ${third.en} shape how the primary signal enters reality. One supplies an operating mode while the other shows contextual regulation; confirm their difference against lived experience.`,
    },
    edge: {
      zh: `「${left.zh}」与「${right.zh}」是本次最清晰的共同激活连接。它们可能彼此增强，也可能让同一种现实反应反复出现。观察两者何时同时启动，比单看任一节点更有价值。`,
      en: `${left.en} and ${right.en} form the clearest co-activation edge. They may reinforce each other or repeat one lived response. When they activate together matters more than either node alone.`,
    },
    quiet: {
      zh: `「${quiet.zh}」目前尚未进入前景，并不表示缺失或不足。它可能未被当前情境调用，也可能被更强信号暂时遮住。下一阶段可观察：${quiet.actionZh}`,
      en: `${quiet.en} is not currently foregrounded; this does not mean absence or deficiency. It may be unused by this context or masked by stronger signals. Next, observe: ${quiet.actionEn}`,
    },
    cost: {
      zh: `当前结构的潜在代价来自「${first.zh}」持续高强度运行，而「${quiet.zh}」缺少参与。代价不等同于问题；它提示系统可能在哪个位置消耗更多注意力、关系空间或恢复容量。${diagnosis.impact}`,
      en: `A possible cost appears when ${first.en} operates continuously while ${quiet.en} participates less. Cost is not a defect; it marks where attention, relational space or recovery capacity may be spent.`,
    },
    action: {
      zh: `只进入一个现实动作：${diagnosis.verify}完成后不要急着评价结果，记录它是否让「${second.zh}」与「${third.zh}」发生变化。`,
      en: `Take only one real-world action: ${first.actionEn} Afterwards, do not judge immediately; note whether ${second.en} and ${third.en} shift.`,
    },
    evidence: {
      zh: `这一结构由 ${product.questions.length} 次有效互动形成。系统读取跨题目重复出现的节点、相邻选择形成的连接及强弱差异；证据只来自本次真实选择${historyProducts ? `与 ${historyProducts} 个已授权历史场域` : ""}。`,
      en: `This structure formed through ${product.questions.length} valid interactions. It reads repeated nodes, edges created by adjacent choices and relative signal strength, using only this session${historyProducts ? ` and ${historyProducts} authorized history fields` : ""}.`,
    },
    history: {
      zh: historyProducts > 0 ? `已有 ${historyProducts} 个用户授权保存的场域参与本次读取。历史节点只提供长期与近期变化的参照，不会覆盖此刻的真实选择。` : "当前尚无足够的已授权历史场域。本章因此只呈现本次选择形成的初始结构；保存更多独立场域后，长期与近期信号才会逐渐分开。",
      en: historyProducts > 0 ? `${historyProducts} user-authorized saved fields contribute here. History provides context for long-term and recent change without overriding present choices.` : "There is not yet enough authorized field history. This chapter therefore shows an initial structure from today's choices; longer and recent signals can separate as more fields are saved.",
    },
    timeline: {
      zh: "一次记录只属于今天。连续记录后，系统才会比较能量、负载、专注与连接容量的变化；未记录的日期保持 Missing，不按零分参与趋势。",
      en: "One entry belongs only to today. With continued records, energy, load, focus and connection capacity can be compared over time; missing dates remain Missing and never enter the trend as zero.",
    },
  };
  return bodies[mode];
}

export function finalizeDendriteResult(product:DendriteProduct,nodes:DendriteResult["nodes"],edges:DendriteResult["edges"],historyProducts=0):DendriteResult {
  const ordered=[...nodes].sort((a,b)=>b.score-a.score);
  const dominant=ordered.slice(0,3);
  const strongestEdge=[...edges].sort((a,b)=>b.weight-a.weight)[0];
  const left=ordered.find(item=>item.id===strongestEdge?.from)??dominant[0];
  const right=ordered.find(item=>item.id===strongestEdge?.to)??dominant[1];
  const quiet=ordered[ordered.length-1];
  const hasClearSignal = dominant[0].score - dominant[2].score >= 6;
  const chapters = product.resultOutline.map((section) => ({ id: section.id, titleZh: section.zh, titleEn: section.en, bodyZh: chapterBody(section.mode, product, dominant, quiet, left, right, historyProducts).zh, bodyEn: chapterBody(section.mode, product, dominant, quiet, left, right, historyProducts).en }));
  const result:DendriteResult={
    algorithm:"lingxifield-dendritic-v2",nodes:ordered,dominant,edges,
    titleZh:hasClearSignal?`${dominant[0].zh} × ${dominant[1].zh} × ${dominant[2].zh}`:"当前信号尚未形成明显结构",
    titleEn:hasClearSignal?`${dominant[0].en} × ${dominant[1].en} × ${dominant[2].en}`:"No Distinct Structure Has Formed Yet",
    insightZh:hasClearSignal?`「${dominant[0].zh}」目前最清晰，并与「${dominant[1].zh}」「${dominant[2].zh}」共同形成${product.nameZh}的当前结构。它不是固定人格或未来判定。`:`本次节点分布较为接近，尚不足以形成可信的主导标签。先保留这份记录，等待更多真实情境提供证据。`,
    insightEn:hasClearSignal?`${dominant[0].en} is clearest and joins ${dominant[1].en} and ${dominant[2].en} in the current ${product.nameEn} structure. It is not a fixed identity or future verdict.`:`The current node distribution is too close to support a reliable dominant label. Keep this record and let further lived contexts provide evidence.`,
    chapters,
    evidence:{answered:product.questions.length,total:product.questions.length,historyProducts,sourceZh:product.sourceZh,sourceEn:product.sourceEn},
  };
  if(product.productId==="qian-reading"){
    result.archetypeCardIndexes=oracleCardIndexesFor(dominant);result.cardRolesZh=["源流签","灵魂签","行者签"];result.cardRolesEn=["Source Sign","Soul Sign","Wayfarer Sign"];
  }
  return result;
}

export function calculateDendrite(product:DendriteProduct,responses:Record<string,string>):DendriteResult {
  const activation=Object.fromEntries(product.nodes.map(item=>[item.id,0])) as Record<string,number>;
  const edgeMap=new Map<string,number>();let previous:string[]=[];
  for(const question of product.questions){
    const option=question.options.find(candidate=>candidate.id===responses[question.id]);
    if(!option) throw new Error(`missing response: ${question.id}`);
    const active=Object.keys(option.activates);
    for(const [id,weight] of Object.entries(option.activates)) activation[id]+=weight;
    for(const from of previous) for(const to of active){if(from===to)continue;const key=[from,to].sort().join("|");edgeMap.set(key,(edgeMap.get(key)??0)+0.35);}
    previous=active;
  }
  const edges=[...edgeMap.entries()].map(([key,weight])=>{const [from,to]=key.split("|");return {from,to,weight};});
  for(let pass=0;pass<3;pass+=1){const delta:Record<string,number>={};for(const edge of edges){delta[edge.to]=(delta[edge.to]??0)+activation[edge.from]*edge.weight*0.12;delta[edge.from]=(delta[edge.from]??0)+activation[edge.to]*edge.weight*0.12;}for(const [id,value] of Object.entries(delta)) activation[id]+=value;}
  const max=Math.max(...Object.values(activation),1);
  const nodes=product.nodes.map(item=>({...item,score:Math.max(6,Math.round(activation[item.id]/max*100))}));
  return finalizeDendriteResult(product,nodes,edges);
}
