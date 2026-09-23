export type SasiModelProvider =
  | "doubao"
  | "openai"
  | "xai"
  | "anthropic"
  | "google"
  | "alibaba"
  | "local"
  | "custom";

export type SasiModelCapability =
  | "reasoning"
  | "coding"
  | "creative-writing"
  | "long-context"
  | "vision"
  | "search-grounding"
  | "tool-use"
  | "structured-output";

export type SasiModelProfile = {
  id: string;
  provider: SasiModelProvider;
  model: string;
  enabled: boolean;
  verified: boolean;
  byok: boolean;
  capabilities: Partial<Record<SasiModelCapability, number>>;
  costWeight: number;
  latencyWeight: number;
  reliabilityWeight: number;
  notes?: string;
};

export type SasiRoutingRequest = {
  required: SasiModelCapability[];
  preferred?: SasiModelCapability[];
  allowUnverified?: boolean;
  preferByok?: boolean;
};

export type SasiRoutingDecision = {
  profile: SasiModelProfile;
  score: number;
  reasons: string[];
};

function bounded(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;
}

export function scoreModelProfile(
  profile: SasiModelProfile,
  request: SasiRoutingRequest,
): SasiRoutingDecision | null {
  if (!profile.enabled) return null;
  if (!profile.verified && !request.allowUnverified) return null;

  const requiredScores = request.required.map((cap) =>
    bounded(profile.capabilities[cap], 0),
  );

  if (requiredScores.some((value) => value <= 0)) return null;

  const preferredScores = (request.preferred ?? []).map((cap) =>
    bounded(profile.capabilities[cap], 0),
  );

  const requiredMean =
    requiredScores.length > 0
      ? requiredScores.reduce((a, b) => a + b, 0) / requiredScores.length
      : 0.5;

  const preferredMean =
    preferredScores.length > 0
      ? preferredScores.reduce((a, b) => a + b, 0) / preferredScores.length
      : 0;

  const reliability = bounded(profile.reliabilityWeight, 0.5);
  const costPenalty = bounded(profile.costWeight, 0.5);
  const latencyPenalty = bounded(profile.latencyWeight, 0.5);
  const byokBonus = request.preferByok && profile.byok ? 0.08 : 0;

  const score =
    requiredMean * 0.55 +
    preferredMean * 0.15 +
    reliability * 0.2 +
    byokBonus -
    costPenalty * 0.06 -
    latencyPenalty * 0.04;

  return {
    profile,
    score,
    reasons: [
      `required=${requiredMean.toFixed(3)}`,
      `preferred=${preferredMean.toFixed(3)}`,
      `reliability=${reliability.toFixed(3)}`,
      profile.byok ? "byok" : "hosted",
    ],
  };
}

export function routeSasiModel(
  profiles: SasiModelProfile[],
  request: SasiRoutingRequest,
): SasiRoutingDecision | null {
  return profiles
    .map((profile) => scoreModelProfile(profile, request))
    .filter((item): item is SasiRoutingDecision => item !== null)
    .sort((a, b) => b.score - a.score)[0] ?? null;
}
