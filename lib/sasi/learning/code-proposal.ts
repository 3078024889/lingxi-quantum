import { createHash, randomUUID } from "node:crypto";
import {
  validateSasiCodeChangeRequest,
  type SasiCodeChangeRequest,
} from "@/lib/sasi/learning/code-evolution-policy";

export type SasiPatchProposal = {
  id: string;
  strategyId: string;
  reason: string;
  failureIds: string[];
  files: Array<{
    path: string;
    beforeSha256: string;
    proposedContent: string;
    proposedSha256: string;
  }>;
  createdAt: string;
};

export function sha256Text(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createSasiPatchProposal(input: {
  strategyId: string;
  reason: string;
  failureIds: string[];
  files: Array<{
    path: string;
    currentContent: string;
    proposedContent: string;
  }>;
}): SasiPatchProposal {
  const request: SasiCodeChangeRequest = {
    paths: input.files.map((file) => file.path),
    reason: input.reason,
    failureIds: input.failureIds,
    strategyId: input.strategyId,
  };

  const validation = validateSasiCodeChangeRequest(request);
  if (!validation.ok) {
    const blocked = validation.blocked
      .map((item) => `${item.path}:${item.zone}`)
      .join(",");
    throw new Error(`SASI_CODE_CHANGE_BLOCKED:${blocked}`);
  }

  return {
    id: randomUUID(),
    strategyId: input.strategyId,
    reason: input.reason,
    failureIds: input.failureIds,
    files: input.files.map((file) => ({
      path: file.path.replaceAll("\\", "/"),
      beforeSha256: sha256Text(file.currentContent),
      proposedContent: file.proposedContent,
      proposedSha256: sha256Text(file.proposedContent),
    })),
    createdAt: new Date().toISOString(),
  };
}
