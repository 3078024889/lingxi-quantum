/** Market-terminal data contract. Unknown values must remain null, never guessed. */
export type EvidenceTier = "official" | "third-party" | "measured";
export type MarketMetric =
  | "monthly-web-visits" | "monthly-active-users" | "app-downloads"
  | "review-count" | "user-rating" | "search-interest"
  | "max-video-seconds" | "videos-per-request" | "image-count-per-request"
  | "image-max-pixels" | "context-tokens" | "generation-latency-ms"
  | "task-success-rate" | "usd-per-generation" | "usd-per-million-input-tokens"
  | "usd-per-million-output-tokens";
export type MetricObservation = {
  toolSlug: string;
  metric: MarketMetric;
  value: number | null;
  unit: string;
  periodStart: string;
  periodEnd: string;
  observedAt: string;
  sourceUrl: string | null;
  sourceName: string | null;
  tier: EvidenceTier | null;
  modelVersion: string | null;
  geography: string | null;
  notes: string | null;
};
export type MetricCell = {status:"available"; observation:MetricObservation} |
  {status:"unavailable"; reason:"not-published"|"not-verified"|"incompatible"};
const timestamp=(s:string)=>Number.isFinite(Date.parse(s));
export function validateObservation(o:MetricObservation):boolean {
  if(!o.toolSlug || !o.unit || !timestamp(o.observedAt) ||
     !timestamp(o.periodStart) || !timestamp(o.periodEnd) ||
     Date.parse(o.periodEnd)<Date.parse(o.periodStart)) return false;
  if(o.value===null) return o.tier===null && o.sourceUrl===null;
  if(!Number.isFinite(o.value) || o.value<0 || !o.tier || !o.sourceName) return false;
  if(!o.sourceUrl) return false;
  try { const url=new URL(o.sourceUrl); return url.protocol==="https:" && !url.username && !url.password; }
  catch { return false; }
}
export function compareObservations(a:MetricObservation,b:MetricObservation):boolean {
  return a.metric===b.metric && a.unit===b.unit &&
    a.periodStart===b.periodStart && a.periodEnd===b.periodEnd &&
    a.geography===b.geography && a.modelVersion===b.modelVersion &&
    validateObservation(a) && validateObservation(b) &&
    a.value!==null && b.value!==null;
}
export function rankMetric(records:readonly MetricObservation[],metric:MarketMetric):
  {status:"available";rows:MetricObservation[]} | {status:"unavailable";reason:string} {
  const filtered=records.filter(r=>r.metric===metric && r.value!==null && validateObservation(r));
  if(!filtered.length) return {status:"unavailable",reason:"No verified observations"};
  const first=filtered[0];
  if(!filtered.every(r=>compareObservations(first,r)))
    return {status:"unavailable",reason:"Different units, periods, model versions or geographies"};
  const latest=new Map<string,MetricObservation>();
  for(const item of filtered) {
    const old=latest.get(item.toolSlug);
    if(!old || Date.parse(item.observedAt)>Date.parse(old.observedAt)) latest.set(item.toolSlug,item);
  }
  return {status:"available",rows:[...latest.values()].sort((a,b)=>
    (b.value as number)-(a.value as number)||a.toolSlug.localeCompare(b.toolSlug))};
}
