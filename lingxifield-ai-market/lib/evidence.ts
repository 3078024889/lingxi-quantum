/** Evidence-backed data model. No unknown observation may be represented as zero. */
export type EvidenceKind = 'official' | 'third_party' | 'independent_test';
export type Verification = 'verified' | 'pending' | 'disputed';
export type MetricKey = 'monthly_visits' | 'app_downloads' | 'seo_visibility' | 'geo_citations' | 'funding_usd' | 'task_cost';
export interface EvidenceRecord {
  id: string;
  platformId: string;
  metric: MetricKey;
  value: number | null;
  unit: string;
  periodStart: string;
  periodEnd: string;
  region: string;
  provider: string;
  sourceUrl: string;
  collectedAt: string;
  evidenceKind: EvidenceKind;
  status: Verification;
  methodology: string;
}
export function evidenceIsValid(r: EvidenceRecord): boolean {
  if (!r.id || !r.platformId || !r.metric || !r.unit || !r.provider || !r.region || !r.methodology) return false;
  if (!['verified','pending','disputed'].includes(r.status)) return false;
  if (!['official','third_party','independent_test'].includes(r.evidenceKind)) return false;
  if (r.value !== null && (!Number.isFinite(r.value) || r.value < 0)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.periodStart) || !/^\d{4}-\d{2}-\d{2}$/.test(r.periodEnd)) return false;
  if (r.periodStart > r.periodEnd || !Number.isFinite(Date.parse(r.collectedAt))) return false;
  try {const url = new URL(r.sourceUrl);if (url.protocol !== 'https:') return false;} catch {return false;}
  return true;
}
export function latestVerified(records: EvidenceRecord[], platformId: string, metric: MetricKey, region: string) {
  return records.filter(r => r.platformId===platformId && r.metric===metric && r.region===region && r.status==='verified' && r.value!==null && evidenceIsValid(r)).sort((a,b)=>b.periodEnd.localeCompare(a.periodEnd)||b.collectedAt.localeCompare(a.collectedAt))[0] ?? null;
}
