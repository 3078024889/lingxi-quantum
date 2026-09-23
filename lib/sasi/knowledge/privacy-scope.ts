export type SasiKnowledgeScope = {
  ownerUserId?: string | null;
  projectId?: string | null;
  visibility: "private" | "project" | "global-curated";
};

export function assertKnowledgeReadScope(input: {
  requesterUserId: string;
  scope: SasiKnowledgeScope;
  requesterProjectIds?: string[];
}) {
  if (input.scope.visibility === "global-curated") return;

  if (
    input.scope.visibility === "private" &&
    input.scope.ownerUserId === input.requesterUserId
  ) {
    return;
  }

  if (
    input.scope.visibility === "project" &&
    input.scope.projectId &&
    (input.requesterProjectIds ?? []).includes(input.scope.projectId)
  ) {
    return;
  }

  throw new Error("SASI_KNOWLEDGE_SCOPE_DENIED");
}

export function canPromoteToGlobalCurated(input: {
  sourceIsPrivateUserMaterial: boolean;
  explicitHumanApproval: boolean;
  containsPersonalData: boolean;
}) {
  return (
    !input.sourceIsPrivateUserMaterial &&
    !input.containsPersonalData &&
    input.explicitHumanApproval
  );
}
