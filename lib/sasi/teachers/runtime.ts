import type { SasiTeacherAdapterRegistry } from "@/lib/sasi/teachers/adapter";
import type { SasiTeacherProfile } from "@/lib/sasi/teachers/registry";
import { assertTeacherBudget, type SasiTeacherBudget } from "@/lib/sasi/teachers/budget";
import {
  buildExtractionMessages,
  buildReviewMessages,
} from "@/lib/sasi/teachers/prompts";
import {
  parseTeacherExtraction,
  parseTeacherReview,
} from "@/lib/sasi/teachers/json-contracts";
import {
  createRuntimeSource,
  extractionToCandidate,
} from "@/lib/sasi/knowledge/runtime";
import { decideKnowledgeCandidate } from "@/lib/sasi/knowledge/ingestion-pipeline";

export type SasiTeacherLearningRunInput = {
  source: {
    kind:
      | "user-file"
      | "book-sasi"
      | "official-web"
      | "peer-reviewed"
      | "reference"
      | "reputable-web"
      | "manual";
    title: string;
    text: string;
    url?: string;
    language?: string | null;
    ownerUserId?: string | null;
    projectId?: string | null;
  };
  extractor: SasiTeacherProfile;
  critic?: SasiTeacherProfile | null;
  registry: SasiTeacherAdapterRegistry;
  budget: SasiTeacherBudget;
};

export async function runTeacherLearning(
  input: SasiTeacherLearningRunInput,
) {
  if (!input.source.text.trim()) throw new Error("SOURCE_TEXT_REQUIRED");

  let calls = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let costMinor = 0;

  const consume = (usage?: {
    inputTokens?: number;
    outputTokens?: number;
    costMinor?: number;
  } | null) => {
    calls += 1;
    inputTokens += usage?.inputTokens ?? 0;
    outputTokens += usage?.outputTokens ?? 0;
    costMinor += usage?.costMinor ?? 0;
  };

  const usage = () => ({ calls, inputTokens, outputTokens, costMinor });

  assertTeacherBudget(input.budget, usage());
  const extractorAdapter = input.registry.resolve(input.extractor);
  if (!extractorAdapter) throw new Error("EXTRACTOR_ADAPTER_NOT_REGISTERED");

  const extractionCall = await extractorAdapter.call({
    profile: input.extractor,
    role: "extractor",
    messages: buildExtractionMessages(input.source),
    responseSchemaName: "sasi_knowledge_extraction_v1",
    maxOutputTokens: input.budget.maxOutputTokens,
  });
  consume(extractionCall.usage);

  const source = createRuntimeSource({
    ...input.source,
    retrievedAt: new Date().toISOString(),
  });

  const extraction = parseTeacherExtraction(extractionCall.outputText);
  const candidate = extractionToCandidate(source, extraction, {
    kind: "teacher",
    id: input.extractor.id,
  });

  const reviews = [];

  if (input.critic) {
    assertTeacherBudget(input.budget, usage());
    const criticAdapter = input.registry.resolve(input.critic);
    if (!criticAdapter) throw new Error("CRITIC_ADAPTER_NOT_REGISTERED");

    const reviewCall = await criticAdapter.call({
      profile: input.critic,
      role: "critic",
      messages: buildReviewMessages({
        candidate,
        sourceTitle: input.source.title,
        sourceText: input.source.text,
      }),
      responseSchemaName: "sasi_teacher_review_v1",
      maxOutputTokens: Math.min(input.budget.maxOutputTokens ?? 1200, 1200),
    });
    consume(reviewCall.usage);

    reviews.push(
      parseTeacherReview(
        reviewCall.outputText,
        candidate.id,
        input.critic.id,
      ),
    );
  }

  const decision = decideKnowledgeCandidate(candidate, [source], reviews);

  return {
    source,
    candidate,
    reviews,
    decision,
    usage: usage(),
    modelTrace: [
      { role: "extractor", provider: extractionCall.provider, model: extractionCall.model },
      ...(input.critic
        ? [{ role: "critic", provider: input.critic.provider, model: input.critic.model }]
        : []),
    ],
  };
}
