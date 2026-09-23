import "server-only";

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { SasiTeacherAdapterRegistry } from "@/lib/sasi/teachers/adapter";
import type { SasiTeacherProfile } from "@/lib/sasi/teachers/registry";
import {
  buildCodeAuthorMessages,
} from "@/lib/sasi/learning/code-authoring-prompt";
import {
  parseCodeAuthoringOutput,
  codeAuthoringOutputToPatchProposal,
} from "@/lib/sasi/learning/code-authoring-parser";
import {
  assessCodeProposalRisk,
} from "@/lib/sasi/learning/code-risk";
import type {
  SasiCodeAuthoringInput,
} from "@/lib/sasi/learning/code-authoring-contract";
import type { SasiFailureAttribution } from "@/lib/sasi/learning/failure-attribution";
import type { SasiImprovementHypothesis } from "@/lib/sasi/learning/hypothesis-engine";

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeRepoPath(value: string) {
  const normalized = value.replaceAll("\\", "/").replace(/^\.?\//, "");
  if (
    !normalized ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(`INVALID_CODE_AUTHOR_TARGET:${value}`);
  }
  return normalized;
}

export type SasiRealCodeAuthorInput = {
  repoRoot: string;
  repositoryHeadSha: string;
  failure: SasiFailureAttribution;
  hypothesis: SasiImprovementHypothesis;
  strategyId: string;
  targetPaths: string[];
  teacher: SasiTeacherProfile;
  registry: SasiTeacherAdapterRegistry;
  limits?: {
    maxFiles?: number;
    maxBytesPerFile?: number;
    maxOutputTokens?: number;
  };
};

export async function runRealCodeAuthor(
  input: SasiRealCodeAuthorInput,
) {
  const maxFiles = Math.max(1, Math.min(input.limits?.maxFiles ?? 3, 5));
  const maxBytesPerFile = Math.max(
    1024,
    Math.min(input.limits?.maxBytesPerFile ?? 96 * 1024, 256 * 1024),
  );

  if (input.targetPaths.length === 0) throw new Error("CODE_AUTHOR_TARGET_REQUIRED");
  if (input.targetPaths.length > maxFiles) throw new Error("CODE_AUTHOR_TARGET_LIMIT");

  const seen = new Set<string>();
  const targetFiles = input.targetPaths.map((rawPath) => {
    const repoPath = normalizeRepoPath(rawPath);
    if (seen.has(repoPath)) throw new Error(`DUPLICATE_CODE_AUTHOR_TARGET:${repoPath}`);
    seen.add(repoPath);

    const absolute = path.resolve(input.repoRoot, ...repoPath.split("/"));
    const repoPrefix = path.resolve(input.repoRoot) + path.sep;
    if (!absolute.startsWith(repoPrefix)) {
      throw new Error(`CODE_AUTHOR_TARGET_ESCAPE:${repoPath}`);
    }
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      throw new Error(`CODE_AUTHOR_TARGET_MISSING:${repoPath}`);
    }

    const currentContent = fs.readFileSync(absolute, "utf8");
    if (Buffer.byteLength(currentContent, "utf8") > maxBytesPerFile) {
      throw new Error(`CODE_AUTHOR_TARGET_TOO_LARGE:${repoPath}`);
    }

    return {
      path: repoPath,
      currentContent,
      currentSha256: sha256(currentContent),
    };
  });

  const authoringInput: SasiCodeAuthoringInput = {
    failure: input.failure,
    hypothesis: input.hypothesis,
    repositoryHeadSha: input.repositoryHeadSha,
    targetFiles,
    constraints: {
      maxFiles,
      maxBytesPerFile,
      requireExistingTargets: true,
    },
  };

  const adapter = input.registry.resolve(input.teacher);
  if (!adapter) throw new Error("CODE_AUTHOR_ADAPTER_NOT_REGISTERED");

  // Reuse the generic teacher transport, but the prompt/response contract is
  // exclusively code-authoring. No shell access is granted to the model.
  const result = await adapter.call({
    profile: input.teacher,
    role: "synthesizer",
    messages: buildCodeAuthorMessages(authoringInput),
    responseSchemaName: "sasi_code_authoring_v1",
    maxOutputTokens: Math.max(
      512,
      Math.min(input.limits?.maxOutputTokens ?? 2600, 4096),
    ),
  });

  const output = parseCodeAuthoringOutput(result.outputText);

  const proposal = codeAuthoringOutputToPatchProposal({
    authoringInput,
    output,
    strategyId: input.strategyId,
  });

  const proposedBytes = output.files.reduce(
    (sum, file) => sum + Buffer.byteLength(file.proposedContent, "utf8"),
    0,
  );

  const sourceText = output.files.map((file) => file.proposedContent).join("\n");
  const risk = assessCodeProposalRisk({
    paths: output.files.map((file) => file.path),
    totalBytes: proposedBytes,
    fileCount: output.files.length,
    touchesExports: /\bexport\s+(type|interface|class|function|const|let|var)\b/.test(sourceText),
    addsNetworkCall: /\bfetch\s*\(|https?:\/\//.test(sourceText),
    addsPersistenceWrite: /\.(insert|upsert|update|delete)\s*\(/.test(sourceText),
  });

  if (risk.level === "blocked") {
    throw new Error(`CODE_AUTHOR_RISK_BLOCKED:${risk.reasons.join("|")}`);
  }

  return {
    id: randomUUID(),
    proposal,
    output,
    risk,
    providerTrace: {
      provider: result.provider,
      model: result.model,
      requestId: result.providerRequestId ?? null,
    },
    usage: result.usage ?? null,
    createdAt: new Date().toISOString(),
  };
}
