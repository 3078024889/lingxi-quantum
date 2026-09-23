import "server-only";

import { runBilledText } from "@/lib/ai/billed-text";
import {
  assertExternalPaidCallAllowed,
  type SasiExecutionContext,
} from "@/lib/sasi/execution/trigger";
import {
  paidIntentPolicy,
  type SasiPaidIntent,
} from "@/lib/sasi/execution/intent-policy";

export async function runUserFundedSasiText(input: {
  context: SasiExecutionContext;
  intent: SasiPaidIntent;
  prompt: string;
}) {
  assertExternalPaidCallAllowed(input.context);

  if (input.context.trigger !== "user-action") {
    throw new Error("SASI_USER_FUNDED_CALL_REQUIRES_USER_ACTION");
  }

  const userId = input.context.userId;
  if (!userId) throw new Error("SASI_USER_ID_REQUIRED");

  const policy = paidIntentPolicy(input.intent);
  const prompt = input.prompt.trim();

  if (!prompt) throw new Error("SASI_PROMPT_REQUIRED");
  if (prompt.length > policy.maxPromptChars) {
    throw new Error("SASI_PROMPT_TOO_LARGE");
  }
  if (policy.maxProviderCalls !== 1) {
    throw new Error("SASI_PROVIDER_CALL_POLICY_INVALID");
  }

  const result = await runBilledText({
    userId,
    taskKind: policy.taskKind,
    intelligence: policy.intelligence,
    prompt,
  });

  return {
    text: result.text,
    provider: result.provider,
    model: result.model,
    usage: result.usage,
    chargeFen: result.chargeFen,
    providerCostFen: result.providerCostFen,
    billingRequestId: result.requestId,
    triggerRequestId: input.context.requestId,
  };
}
