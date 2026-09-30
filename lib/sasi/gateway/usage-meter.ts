export interface UsageSample{providerId:string;capability:string;units:number;cost:number;latencyMs:number;at:string}
export function aggregateUsage(rows:UsageSample[]){return rows.reduce((a,x)=>{a.units+=x.units;a.cost+=x.cost;a.latencyMs+=x.latencyMs;return a},{units:0,cost:0,latencyMs:0})}
