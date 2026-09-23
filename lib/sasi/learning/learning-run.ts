import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";
import type { SasiTeacherReview } from "@/lib/sasi/teachers/review";

export type SasiLearningRunState =
  | "started"
  | "candidate-created"
  | "reviewed"
  | "needs-evidence"
  | "ready-for-promotion"
  | "promoted"
  | "rejected"
  | "failed";

export type SasiLearningRunTrace = {
  id: string;
  userId?: string | null;
  projectId?: string | null;
  sourceId: string;
  candidateId: string;
  state: SasiLearningRunState;
  extractorTeacherId: string;
  criticTeacherIds: string[];
  providerTrace: Array<{
    role: "extractor" | "critic" | "fact-checker" | "synthesizer";
    provider: string;
    model: string;
    requestId?: string | null;
  }>;
  reviews: SasiTeacherReview[];
  knowledgeUnit?: SasiKnowledgeUnit | null;
  usage: {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    costMinor: number;
    currency?: string | null;
  };
  failureCode?: string | null;
  createdAt: string;
  updatedAt: string;
};
