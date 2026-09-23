import { SASI_TEACHER_PROMPT_CONTRACT } from "@/lib/sasi/teachers/prompt-contract";
import type { SasiKnowledgeCandidate } from "@/lib/sasi/knowledge/candidate";

function contractText() {
  return [
    SASI_TEACHER_PROMPT_CONTRACT.systemIdentity,
    ...SASI_TEACHER_PROMPT_CONTRACT.instructions,
  ].join("\n");
}

export function buildExtractionMessages(input: {
  title: string;
  text: string;
  language?: string | null;
  domainHint?: string | null;
}) {
  return [
    {
      role: "system" as const,
      content: `${contractText()}

你的任务是从给定材料中提取一个最核心的 Knowledge Candidate。
只输出 JSON 对象，字段：
concept, domain, proposedDefinition, claims, relations, conditions,
counterexamples, commonMisconceptions, uncertaintyNotes。

claims 每项：{"text":string,"confidence":0..1}
relations 每项：{"predicate":string,"object":string,"confidence":0..1}

不得添加材料没有支持的事实。无法确认时写入 uncertaintyNotes。`,
    },
    {
      role: "user" as const,
      content: [
        `标题：${input.title}`,
        input.language ? `语言：${input.language}` : "",
        input.domainHint ? `领域提示：${input.domainHint}` : "",
        "",
        "材料：",
        input.text,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

export function buildReviewMessages(input: {
  candidate: SasiKnowledgeCandidate;
  sourceTitle: string;
  sourceText: string;
}) {
  return [
    {
      role: "system" as const,
      content: `${contractText()}

你现在是批判性审查教师。审查候选是否被给定材料支持。
只输出 JSON 对象：
{
  "verdict":"support|challenge|insufficient-evidence|out-of-domain",
  "confidence":0..1,
  "issues":string[],
  "suggestedCorrections":string[],
  "evidenceRequests":string[]
}

不要因为其他模型可能同意就判定事实成立。`,
    },
    {
      role: "user" as const,
      content: [
        `来源：${input.sourceTitle}`,
        "",
        "候选：",
        JSON.stringify(input.candidate),
        "",
        "原始材料：",
        input.sourceText,
      ].join("\n"),
    },
  ];
}
