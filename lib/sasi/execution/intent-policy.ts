export type SasiPaidIntent =
  | "knowledge-answer"
  | "teacher-extract"
  | "teacher-review"
  | "code-author"
  | "director-reasoning";

export type SasiPaidIntentPolicy = {
  intent: SasiPaidIntent;
  taskKind: "knowledge" | "research" | "coding" | "simple_text";
  intelligence: "light" | "standard" | "high";
  maxPromptChars: number;
  maxProviderCalls: number;
  userBalanceRequired: boolean;
};

const POLICIES: Record<SasiPaidIntent, SasiPaidIntentPolicy> = {
  "knowledge-answer": {
    intent: "knowledge-answer",
    taskKind: "knowledge",
    intelligence: "standard",
    maxPromptChars: 32_000,
    maxProviderCalls: 1,
    userBalanceRequired: true,
  },
  "teacher-extract": {
    intent: "teacher-extract",
    taskKind: "knowledge",
    intelligence: "high",
    maxPromptChars: 48_000,
    maxProviderCalls: 1,
    userBalanceRequired: true,
  },
  "teacher-review": {
    intent: "teacher-review",
    taskKind: "research",
    intelligence: "high",
    maxPromptChars: 48_000,
    maxProviderCalls: 1,
    userBalanceRequired: true,
  },
  "code-author": {
    intent: "code-author",
    taskKind: "coding",
    intelligence: "high",
    maxPromptChars: 36_000,
    maxProviderCalls: 1,
    userBalanceRequired: true,
  },
  "director-reasoning": {
    intent: "director-reasoning",
    taskKind: "simple_text",
    intelligence: "high",
    maxPromptChars: 36_000,
    maxProviderCalls: 1,
    userBalanceRequired: true,
  },
};

export function paidIntentPolicy(intent: SasiPaidIntent) {
  return POLICIES[intent];
}
