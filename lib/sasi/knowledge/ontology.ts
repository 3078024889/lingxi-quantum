export const SASI_GENERAL_KNOWLEDGE_DOMAINS = [
  "mathematics",
  "physics",
  "chemistry",
  "earth-science",
  "astronomy",
  "biology",
  "medicine-health",
  "computer-science",
  "software-engineering",
  "electrical-engineering",
  "mechanical-engineering",
  "materials-science",
  "economics",
  "finance",
  "business",
  "law-institutions",
  "politics-civics",
  "history",
  "geography",
  "philosophy",
  "psychology",
  "sociology",
  "anthropology",
  "linguistics",
  "literature",
  "arts-design",
  "music",
  "film-storytelling",
  "education",
  "media-information",
  "everyday-world",
  "meta-cognition",
] as const;

export type SasiKnowledgeDomain =
  (typeof SASI_GENERAL_KNOWLEDGE_DOMAINS)[number];

export const SASI_EPISTEMIC_STATES = [
  "verified-fact",
  "well-supported",
  "model-derived-hypothesis",
  "contested",
  "unknown",
  "deprecated",
] as const;

export type SasiEpistemicState =
  (typeof SASI_EPISTEMIC_STATES)[number];

export const SASI_SOURCE_CLASSES = [
  "primary-source",
  "official-source",
  "peer-reviewed",
  "reference-work",
  "reputable-secondary",
  "user-provided",
  "model-generated",
  "unknown-source",
] as const;

export type SasiSourceClass =
  (typeof SASI_SOURCE_CLASSES)[number];
