import type {
  CrossEvidencePattern,
  EvidenceLeafV340,
  LivingChapter,
  LivingChapterSpec,
  LivingNode,
} from "./types";

const banned = [
  /这说明/u, /这意味着/u, /可能表明/u, /从某个角度/u,
  /不是.+而是/u, /你需要意识到/u, /在一定程度上/u,
  /综合来看/u, /总体而言/u,
];

function sentenceEnd(s:string) {
  return /[。！？；]$/u.test(s) ? s : `${s}。`;
}

function evidenceLevel(pattern: CrossEvidencePattern): LivingChapter["evidenceLevelZh"] {
  const contexts = new Set(pattern.leaves.map(x=>x.context)).size;
  const contradictions = pattern.contradictions.length;
  if (contexts >= 4 && contradictions === 0) return "已成主轴";
  if (contexts >= 3 && contradictions <= 1) return "证据清晰";
  if (contexts >= 2 && contradictions <= 2) return "正在形成";
  if (contradictions >= 2) return "因境而异";
  return "尚不立论";
}

function writeVerdict(pattern: CrossEvidencePattern) {
  const p = pattern.primary;
  const s = pattern.support;
  const c = pattern.counter;

  if (!s) {
    return sentenceEnd(`此处一力独见，尚未成轴；所见为「${p.titleZh}」，宜留待他境复验`);
  }

  if (c && pattern.contradictions.length >= 2) {
    return sentenceEnd(
      `一处见「${p.titleZh}」，一处又受「${c.titleZh}」牵制；二象相逆，故不以一性定之，其变在境`
    );
  }

  return sentenceEnd(
    `${p.coreTruth}；${s.coreTruth}${c ? `。惟${c.titleZh}尚弱，故其力有成处，亦有失守处` : ""}`
  );
}

function writeBody(pattern: CrossEvidencePattern, spec: LivingChapterSpec) {
  const p = pattern.primary;
  const s = pattern.support;
  const scenes = [...p.livedScenes, ...(s?.livedScenes ?? [])].slice(0,3);

  const opening = `断曰：${writeVerdict(pattern)}`;
  const mechanism = s
    ? `其机不在一答。${new Set(pattern.leaves.map(x=>x.context)).size}种情境同见此势：${p.titleZh}先发，${s.titleZh}承之。${p.costWhenOverused}`
    : `其证尚单，未宜强断。${p.suppressedForm}`;

  const lived = scenes.length
    ? `验于事：${scenes.map(sentenceEnd).join("")}`
    : `验于事：须回看近三次同类事件，若所见不能重复出现，此断即应撤回。`;

  const cost = `反观：${p.strengthWhenActive}${sentenceEnd(p.costWhenOverused)}`;

  const resolve = `所解：${spec.resolves}`;

  return [opening, mechanism, lived, cost, resolve].join("\n\n");
}

function writeVerification(pattern: CrossEvidencePattern) {
  const falsifiers = [
    ...pattern.primary.falsifiers,
    ...(pattern.support?.falsifiers ?? []),
  ].slice(0,2);

  if (falsifiers.length) {
    return `现实复核：未来14日只看两件事——${falsifiers.join("；")}。若连续出现反例，此节点降级，不再立为主轴。`;
  }

  return "现实复核：取最近三次同类事件，记录事实、行动、结果；若三次不能复现，本章不得继续维持高置信。";
}

export function compileLivingChapter(
  spec: LivingChapterSpec,
  pattern: CrossEvidencePattern,
): LivingChapter {
  const evidenceContexts = new Set(pattern.leaves.map(x=>x.context)).size;

  if (evidenceContexts < spec.minIndependentContexts) {
    return {
      id: spec.id,
      titleZh: spec.titleZh,
      verdictZh: "证尚不足，不提前立论。",
      bodyZh: `此章须由至少${spec.minIndependentContexts}种独立情境互证；当前仅得${evidenceContexts}种。宁留其白，不以一答定人。`,
      verificationZh: "待新的真实情境进入后再读。",
      evidenceLevelZh: "尚不立论",
      evidenceTrace: pattern.leaves.map(x=>({leafId:x.id,dimension:x.dimension,context:x.context})),
    };
  }

  const bodyZh = writeBody(pattern, spec);

  for (const rule of banned) {
    if (rule.test(bodyZh)) throw new Error(`V340 language audit failed: ${rule}`);
  }

  return {
    id: spec.id,
    titleZh: spec.titleZh,
    verdictZh: writeVerdict(pattern),
    bodyZh,
    verificationZh: writeVerification(pattern),
    evidenceLevelZh: evidenceLevel(pattern),
    evidenceTrace: pattern.leaves.map(x=>({leafId:x.id,dimension:x.dimension,context:x.context})),
  };
}
