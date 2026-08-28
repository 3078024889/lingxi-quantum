import { LIFE_SIGNS, type LifeSign } from "@/lib/qian-data";
import type { LifeMapFacts } from "@/lib/lifemap-calc";

export type WebArchetypeRole = "core" | "support" | "conditional" | "tension";
export type WebArchetypeMember = LifeSign & { role: WebArchetypeRole; evidenceZh: string[]; evidenceEn: string[] };
export type WebArchetypeResult = {
  algorithm: "lingxifield-web-astronomical-archetype-v2";
  matrix: WebArchetypeMember[];
  stability: "core-stable" | "clearly-stable" | "parallel" | "open";
  sourceZh: string[];
  sourceEn: string[];
  operation: Array<{ id: string; titleZh: string; titleEn: string; bodyZh: string; bodyEn: string }>;
  pathZh: string[];
  pathEn: string[];
};

function hash(value: string) {
  let state = 2166136261;
  for (const char of value) state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  return state;
}

export function calculateWebArchetype(facts: LifeMapFacts): WebArchetypeResult {
  const signatures = [
    `${facts.sunLongitude.toFixed(4)}:${facts.dayPillar}:${facts.dayMasterElement}:${facts.mingGong}`,
    `${facts.moonLongitude.toFixed(4)}:${facts.jupiter.longitude.toFixed(4)}:${JSON.stringify(facts.wuXingCount)}`,
    `${facts.mars.longitude.toFixed(4)}:${facts.mercury.longitude.toFixed(4)}:${facts.hourPillar ?? facts.monthPillar}`,
    `${facts.venus.longitude.toFixed(4)}:${facts.saturn.longitude.toFixed(4)}:${facts.shenGong}`,
  ];
  const used = new Set<number>();
  const indexes = signatures.map((signature, position) => {
    let index = hash(`${position}:${signature}`) % LIFE_SIGNS.length;
    while (used.has(index)) index = (index + 11) % LIFE_SIGNS.length;
    used.add(index); return index;
  });
  const roles: WebArchetypeRole[] = ["core","support","conditional","tension"];
  const evidenceZh = [
    [`太阳 ${facts.sunSignZh}`,`日柱 ${facts.dayPillar}`,`日主 ${facts.dayMasterGan}${facts.dayMasterElement}`],
    [`月亮 ${facts.moonSignZh}`,`木星黄经 ${facts.jupiter.longitude.toFixed(1)}°`,`命宫 ${facts.mingGong}`],
    [`火星黄经 ${facts.mars.longitude.toFixed(1)}°`,`水星黄经 ${facts.mercury.longitude.toFixed(1)}°`,facts.hourPillar?`时柱 ${facts.hourPillar}`:"出生时刻保持开放"],
    [`金星黄经 ${facts.venus.longitude.toFixed(1)}°`,`土星黄经 ${facts.saturn.longitude.toFixed(1)}°`,`身宫 ${facts.shenGong}`],
  ];
  const evidenceEn = [
    [`Sun in ${facts.sunSignEn}`,`Day pillar ${facts.dayPillar}`,`Day master ${facts.dayMasterElement}`],
    [`Moon in ${facts.moonSignEn}`,`Jupiter ${facts.jupiter.longitude.toFixed(1)}°`,`Life palace ${facts.mingGong}`],
    [`Mars ${facts.mars.longitude.toFixed(1)}°`,`Mercury ${facts.mercury.longitude.toFixed(1)}°`,facts.hourPillar?`Hour pillar ${facts.hourPillar}`:"Birth time remains open"],
    [`Venus ${facts.venus.longitude.toFixed(1)}°`,`Saturn ${facts.saturn.longitude.toFixed(1)}°`,`Body palace ${facts.shenGong}`],
  ];
  const matrix = indexes.map((index, position) => ({ ...LIFE_SIGNS[index], role:roles[position], evidenceZh:evidenceZh[position], evidenceEn:evidenceEn[position] }));
  const [core,support,conditional,tension] = matrix;
  const operation = [
    {id:"perception",titleZh:"感知",titleEn:"Perception",bodyZh:`「${core.nameZh}」首先注意尚未被命名的结构；「${support.nameZh}」帮助判断哪些信号值得长期保留。`,bodyEn:`${core.nameEn} notices unnamed structure first; ${support.nameEn} helps decide which signals deserve long-term attention.`},
    {id:"judgment",titleZh:"判断",titleEn:"Judgment",bodyZh:`判断通常不是一次完成，而是在「${core.keywordsZh}」与「${tension.keywordsZh}」之间确认边界。`,bodyEn:`Judgment forms between ${core.keywordsEn} and the boundary held by ${tension.keywordsEn}.`},
    {id:"action",titleZh:"行动",titleEn:"Action",bodyZh:`行动以「${core.nameZh}」启动；当现实条件满足时，「${conditional.nameZh}」会明显增强并推动转向。`,bodyEn:`Action begins through ${core.nameEn}; when conditions fit, ${conditional.nameEn} strengthens and enables a turn.`},
    {id:"connection",titleZh:"连接",titleEn:"Connection",bodyZh:`在重要关系中，「${support.nameZh}」负责维持可持续连接，同时「${tension.nameZh}」要求保留真实差异。`,bodyEn:`In important relationships, ${support.nameEn} sustains connection while ${tension.nameEn} preserves real difference.`},
    {id:"completion",titleZh:"完成",titleEn:"Completion",bodyZh:`完成不是把所有可能性关闭，而是让「${core.nameZh}」形成可运行结构，再为「${conditional.nameZh}」保留下一次更新接口。`,bodyEn:`Completion makes ${core.nameEn} operational while preserving an update interface for ${conditional.nameEn}.`},
  ];
  return {
    algorithm:"lingxifield-web-astronomical-archetype-v2", matrix,
    stability:facts.hourPillar ? "core-stable" : "clearly-stable",
    sourceZh:[`太阳 ${facts.sunSignZh} · ${facts.sunLongitude.toFixed(2)}°`,`月亮 ${facts.moonSignZh} · ${facts.moonLongitude.toFixed(2)}°`,`四柱 ${facts.yearPillar} / ${facts.monthPillar} / ${facts.dayPillar}${facts.hourPillar?` / ${facts.hourPillar}`:""}`,`胎元 ${facts.taiYuan} · 命宫 ${facts.mingGong} · 身宫 ${facts.shenGong}`],
    sourceEn:[`Sun ${facts.sunSignEn} · ${facts.sunLongitude.toFixed(2)}°`,`Moon ${facts.moonSignEn} · ${facts.moonLongitude.toFixed(2)}°`,`Temporal pillars ${facts.yearPillar} / ${facts.monthPillar} / ${facts.dayPillar}${facts.hourPillar?` / ${facts.hourPillar}`:""}`,`Temporal coordinate matrix · ${facts.taiYuan} / ${facts.mingGong} / ${facts.shenGong}`],
    operation,
    pathZh:["观察","结构化","筛选","现实搭建","长期稳定"],
    pathEn:["Observe","Structure","Discern","Build in Reality","Stabilize"],
  };
}
