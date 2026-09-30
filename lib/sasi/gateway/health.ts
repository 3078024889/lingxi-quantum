export interface HealthSample{providerId:string;ok:boolean;latencyMs:number;at:string}
export interface ProviderHealth{providerId:string;health:number;latencyMs:number;samples:number}
export function summarizeHealth(samples:HealthSample[]):ProviderHealth[]{const ids=[...new Set(samples.map(x=>x.providerId))];return ids.map(providerId=>{const rows=samples.filter(x=>x.providerId===providerId).slice(-50),ok=rows.filter(x=>x.ok).length,latency=rows.reduce((s,x)=>s+x.latencyMs,0)/Math.max(rows.length,1);return {providerId,health:ok/Math.max(rows.length,1),latencyMs:latency,samples:rows.length}})}
