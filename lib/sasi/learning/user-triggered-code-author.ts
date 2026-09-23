import "server-only";

import type { SasiCodeAuthoringInput } from "@/lib/sasi/learning/code-authoring-contract";
import { buildCodeAuthorMessages } from "@/lib/sasi/learning/code-authoring-prompt";
import {
  parseCodeAuthoringOutput,
  codeAuthoringOutputToPatchProposal,
} from "@/lib/sasi/learning/code-authoring-parser";
import { assessCodeProposalRisk } from "@/lib/sasi/learning/code-risk";
import { runUserFundedSasiText } from "@/lib/sasi/execution/billing-bridge";
import type { SasiExecutionContext } from "@/lib/sasi/execution/trigger";

function messagesToPrompt(
  messages: ReturnType<typeof buildCodeAuthorMessages>,
) {
  return messages
    .map((message) => `[${message.role.toUpperCase()}]\n${message.content}`)
    .join("\n\n");
}

export async function runUserTriggeredCodeAuthor(input: {
  context: SasiExecutionContext;
  authoringInput: SasiCodeAuthoringInput;
  strategyId: string;
}) {
  const billed = await runUserFundedSasiText({
    context: input.context,
    intent: "code-author",
    prompt: messagesToPrompt(buildCodeAuthorMessages(input.authoringInput)),
  });

  const output = parseCodeAuthoringOutput(billed.text);

  const proposal = codeAuthoringOutputToPatchProposal({
    authoringInput: input.authoringInput,
    output,
    strategyId: input.strategyId,
  });

  const sourceText = output.files
    .map((file) => file.proposedContent)
    .join("\n");

  const risk = assessCodeProposalRisk({
    paths: output.files.map((file) => file.path),
    totalBytes: output.files.reduce(
      (sum, file) =>
        sum + Buffer.byteLength(file.proposedContent, "utf8"),
      0,
    ),
    fileCount: output.files.length,
    touchesExports:
      /\bexport\s+(type|interface|class|function|const|let|var)\b/.test(
        sourceText,
      ),
    addsNetworkCall: /\bfetch\s*\(|https?:\/\//.test(sourceText),
    addsPersistenceWrite:
      /\.(insert|upsert|update|delete)\s*\(/.test(sourceText),
  });

  if (risk.level === "blocked") {
    throw new Error(`CODE_AUTHOR_RISK_BLOCKED:${risk.reasons.join("|")}`);
  }

  return {
    proposal,
    output,
    risk,
    billing: {
      chargeFen: billed.chargeFen,
      providerCostFen: billed.providerCostFen,
      billingRequestId: billed.billingRequestId,
    },
    providerTrace: {
      provider: billed.provider,
      model: billed.model,
      usage: billed.usage,
    },
  };
}
