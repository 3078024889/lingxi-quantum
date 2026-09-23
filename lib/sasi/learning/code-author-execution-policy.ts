export type SasiCodeAuthorExecutionPolicy = {
  allowPaidCall: boolean;
  maxProviderCalls: number;
  maxTargetFiles: number;
  maxBytesPerFile: number;
  maxOutputTokens: number;
  allowedRiskLevels: Array<"low" | "medium" | "high">;
};

export const DEFAULT_CODE_AUTHOR_POLICY: SasiCodeAuthorExecutionPolicy = {
  allowPaidCall: false,
  maxProviderCalls: 1,
  maxTargetFiles: 3,
  maxBytesPerFile: 96 * 1024,
  maxOutputTokens: 2600,
  allowedRiskLevels: ["low", "medium"],
};

export function assertCodeAuthorExecutionPolicy(input: {
  policy: SasiCodeAuthorExecutionPolicy;
  requestedCalls: number;
  requestedFiles: number;
}) {
  if (!input.policy.allowPaidCall) {
    throw new Error("CODE_AUTHOR_PAID_CALL_DISABLED");
  }
  if (input.requestedCalls < 1 || input.requestedCalls > input.policy.maxProviderCalls) {
    throw new Error("CODE_AUTHOR_CALL_LIMIT");
  }
  if (input.requestedFiles < 1 || input.requestedFiles > input.policy.maxTargetFiles) {
    throw new Error("CODE_AUTHOR_FILE_LIMIT");
  }
}
