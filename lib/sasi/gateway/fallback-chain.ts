export interface FallbackCandidate{id:string;health:number;quality:number;cost:number;latencyMs:number}
export function fallbackChain(rows:FallbackCandidate[]){return [...rows].filter(x=>x.health>0).sort((a,b)=>(b.health*.4+b.quality*.4-b.cost*.1-b.latencyMs/300000)-(a.health*.4+a.quality*.4-a.cost*.1-a.latencyMs/300000)).map(x=>x.id)}
