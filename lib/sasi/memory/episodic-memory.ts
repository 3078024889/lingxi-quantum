export type SasiEpisodeOutcome =
  | "success"
  | "partial"
  | "failure"
  | "aborted";

export type SasiEpisodicMemoryRecord = {
  id: string;
  userId?: string | null;
  projectId?: string | null;
  taskFamily: string;
  taskSummary: string;
  outcome: SasiEpisodeOutcome;
  strategyId?: string | null;
  failureCodes: string[];
  observations: string[];
  lessons: string[];
  evidenceRefs: string[];
  createdAt: string;
};

export function episodeIsLearningWorthy(record: SasiEpisodicMemoryRecord) {
  return (
    record.failureCodes.length > 0 ||
    record.lessons.length > 0 ||
    record.outcome === "success"
  );
}
