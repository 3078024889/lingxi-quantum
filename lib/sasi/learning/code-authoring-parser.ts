import { createSasiPatchProposal } from "@/lib/sasi/learning/code-proposal";
import {
  validateCodeAuthoringOutput,
  type SasiCodeAuthoringInput,
  type SasiCodeAuthoringOutput,
} from "@/lib/sasi/learning/code-authoring-contract";

function parseJsonObject(text: string) {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("CODE_AUTHOR_JSON_INVALID");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("CODE_AUTHOR_JSON_OBJECT_REQUIRED");
  }

  return value as Record<string, unknown>;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function parseCodeAuthoringOutput(text: string): SasiCodeAuthoringOutput {
  const obj = parseJsonObject(text);
  const rawFiles = Array.isArray(obj.files) ? obj.files : [];

  return {
    summary: typeof obj.summary === "string" ? obj.summary : "",
    rationale: typeof obj.rationale === "string" ? obj.rationale : "",
    expectedEffect:
      typeof obj.expectedEffect === "string" ? obj.expectedEffect : "",
    files: rawFiles
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
      .map((item) => ({
        path: typeof item.path === "string" ? item.path : "",
        proposedContent:
          typeof item.proposedContent === "string"
            ? item.proposedContent
            : "",
      })),
    testPlan: stringArray(obj.testPlan),
    knownRisks: stringArray(obj.knownRisks),
    assumptions: stringArray(obj.assumptions),
  };
}

export function codeAuthoringOutputToPatchProposal(input: {
  authoringInput: SasiCodeAuthoringInput;
  output: SasiCodeAuthoringOutput;
  strategyId: string;
}) {
  const validation = validateCodeAuthoringOutput(
    input.output,
    input.authoringInput,
  );

  if (!validation.ok) {
    throw new Error(
      `CODE_AUTHOR_OUTPUT_REJECTED:${validation.errors.join("|")}`,
    );
  }

  const currentByPath = new Map(
    input.authoringInput.targetFiles.map((file) => [file.path, file]),
  );

  return createSasiPatchProposal({
    strategyId: input.strategyId,
    reason: [
      input.output.summary,
      input.output.rationale,
      input.output.expectedEffect,
    ].join("\n\n"),
    failureIds: [input.authoringInput.failure.id],
    files: input.output.files.map((file) => {
      const current = currentByPath.get(file.path);
      if (!current) throw new Error(`CURRENT_TARGET_MISSING:${file.path}`);

      return {
        path: file.path,
        currentContent: current.currentContent,
        proposedContent: file.proposedContent,
      };
    }),
  });
}
