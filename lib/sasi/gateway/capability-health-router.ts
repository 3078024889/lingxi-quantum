export interface HealthRoute{id:string;quality:number;health:number;cost:number;latencyMs:number;privacy:number}
export function healthAwareOrder(rows:HealthRoute[]){return [...rows].filter(x=>x.health>.2).sort((a,b)=>(b.quality*.32+b.health*.30+b.privacy*.18-b.cost*.10-b.latencyMs/300000)-(a.quality*.32+a.health*.30+a.privacy*.18-a.cost*.10-a.latencyMs/300000))}
