import type { SasiFailureAttribution } from "@/lib/sasi/learning/failure-attribution";
import type { SasiImprovementHypothesis } from "@/lib/sasi/learning/hypothesis-engine";

export type SasiCodeAuthoringInput = {
  failure: SasiFailureAttribution;
  hypothesis: SasiImprovementHypothesis;
  repositoryHeadSha: string;
  targetFiles: Array<{
    path: string;
    currentContent: string;
    currentSha256: string;
  }>;
  constraints: {
    maxFiles: number;
    maxBytesPerFile: number;
    requireExistingTargets: boolean;
  };
};

export type SasiCodeAuthoringOutput = {
  summary: string;
  rationale: string;
  expectedEffect: string;
  files: Array<{
    path: string;
    proposedContent: string;
  }>;
  testPlan: string[];
  knownRisks: string[];
  assumptions: string[];
};

export function validateCodeAuthoringOutput(
  output: SasiCodeAuthoringOutput,
  input: SasiCodeAuthoringInput,
) {
  const errors: string[] = [];

  if (!output.summary.trim()) errors.push("SUMMARY_REQUIRED");
  if (!output.rationale.trim()) errors.push("RATIONALE_REQUIRED");
  if (!output.expectedEffect.trim()) errors.push("EXPECTED_EFFECT_REQUIRED");

  if (output.files.length === 0) errors.push("AT_LEAST_ONE_FILE_REQUIRED");
  if (output.files.length > input.constraints.maxFiles) {
    errors.push("TOO_MANY_FILES");
  }

  const allowed = new Set(input.targetFiles.map((file) => file.path));

  for (const file of output.files) {
    if (!allowed.has(file.path)) errors.push(`UNDECLARED_TARGET:${file.path}`);
    if (
      Buffer.byteLength(file.proposedContent, "utf8") >
      input.constraints.maxBytesPerFile
    ) {
      errors.push(`FILE_TOO_LARGE:${file.path}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export const SASI_CODE_AUTHOR_SYSTEM_RULES = [
  "你是SASI的受控代码候选作者，不是生产部署器。",
  "只能修改调用方明确提供的目标文件。",
  "不得修改CORE-0、支付、密钥、生产readiness、数据库migration或CI权限。",
  "不得输出shell命令、密钥、环境变量值或绕过权限的代码。",
  "必须输出完整文件内容，不输出patch片段。",
  "必须给出测试计划、已知风险和假设。",
  "你的输出只是候选方案，必须经过隔离sandbox、benchmark、regression和人工批准。",
] as const;
