export const BASE_DENDRITE_PRODUCT_IDS = [
  "life-map-report", "relationship-resonance", "resilience-report", "romance-report",
  "wealth-report", "daily-tide-report", "tarot-reading", "qian-reading",
] as const;

export type LifeArchetypeCoverageAudit = {
  engineVersion: "v6";
  identityVerified: boolean;
  within365Days: boolean;
  uniqueStreams: number;
  sourceReports: number;
  evidenceLeaves: number;
  windowStart: string;
  windowEnd: string;
  streamEvidence: Array<{ productId: string; reportCount: number; evidenceCount: number; readingCount: number }>;
};

export type LifeArchetypeGateField = {
  productId: string;
  completedAt?: string | null;
  result: { evidenceLeaves?: unknown[] };
};

export function auditLifeArchetypeCoverage(fields: LifeArchetypeGateField[], identityVerified: boolean, now = Date.now()): LifeArchetypeCoverageAudit {
  const unique = new Set(fields.map((field) => field.productId));
  const dates = fields.map((field) => Date.parse(field.completedAt ?? "")).filter(Number.isFinite).sort((a,b)=>a-b);
  const within365Days = dates.length === fields.length && dates.length > 0 && now - dates[0] <= 365 * 24 * 60 * 60 * 1000;
  const streamEvidence = BASE_DENDRITE_PRODUCT_IDS.map((productId) => {
    const reports = fields.filter((field) => field.productId === productId);
    return { productId, reportCount: reports.length, evidenceCount: reports.reduce((sum,field)=>sum+(field.result.evidenceLeaves?.length ?? 0),0), readingCount: 0 };
  });
  const audit: LifeArchetypeCoverageAudit = {
    engineVersion:"v6", identityVerified, within365Days, uniqueStreams: unique.size, sourceReports: fields.length,
    evidenceLeaves: streamEvidence.reduce((sum,item)=>sum+item.evidenceCount,0),
    windowStart: dates[0] ? new Date(dates[0]).toISOString() : "",
    windowEnd: dates.at(-1) ? new Date(dates.at(-1)!).toISOString() : "",
    streamEvidence,
  };
  if (!identityVerified) throw new Error("life archetype identity is not verified");
  if (unique.size !== BASE_DENDRITE_PRODUCT_IDS.length || BASE_DENDRITE_PRODUCT_IDS.some((id)=>!unique.has(id))) throw new Error("life archetype requires eight unique streams");
  if (!within365Days) throw new Error("life archetype sources must fall within 365 days");
  if (streamEvidence.some((item)=>item.evidenceCount === 0)) throw new Error("life archetype source is missing evidence leaves");
  return audit;
}
