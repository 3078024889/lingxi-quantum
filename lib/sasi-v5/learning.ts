import type {SasiV5OutcomeRecord,SasiV5OutcomeSignal} from "./types";
const SAFE=new Set<SasiV5OutcomeSignal>(["saved","downloaded","continued","regenerated","abandoned","refunded","explicit-positive","explicit-negative","delivered","failed","repaired","escalated"]);
export function safeOutcomeRecord(i:SasiV5OutcomeRecord):SasiV5OutcomeRecord{
 if(!SAFE.has(i.signal))throw new Error("SASI_V5_SIGNAL_INVALID");const taskFamily=i.taskFamily.trim().slice(0,80);
 if(!/^[a-z0-9:_-]{2,80}$/i.test(taskFamily))throw new Error("SASI_V5_TASK_FAMILY_INVALID");
 const metadata:Record<string,unknown>={};for(const[k,v]of Object.entries(i.metadata??{})){if(!/^[a-zA-Z0-9_.-]{1,64}$/.test(k))continue;if(typeof v==="string")metadata[k]=v.slice(0,160);else if(typeof v==="number"&&Number.isFinite(v))metadata[k]=v;else if(typeof v==="boolean"||v==null)metadata[k]=v}
 return{...i,taskFamily,capability:i.capability?.slice(0,120)??null,provider:i.provider?.slice(0,80)??null,model:i.model?.slice(0,180)??null,routeId:i.routeId?.slice(0,120)??null,providerCostCurrency:i.providerCostCurrency?.slice(0,16)??null,failureCode:i.failureCode?.slice(0,120)??null,metadata};
}
export function satisfactionWeight(s:SasiV5OutcomeSignal){return({saved:.7,downloaded:.8,continued:.65,regenerated:-.55,abandoned:-.7,refunded:-1,"explicit-positive":1,"explicit-negative":-1,delivered:.4,failed:-.8,repaired:.15,escalated:0} satisfies Record<SasiV5OutcomeSignal,number>)[s]}
export function aggregateFailureAtlas(rows:Array<Pick<SasiV5OutcomeRecord,"taskFamily"|"capability"|"provider"|"model"|"failureCode"|"signal">>){
 const g=new Map<string,{count:number;failed:number;regenerated:number}>();for(const r of rows){const k=[r.taskFamily,r.capability??"-",r.provider??"-",r.model??"-",r.failureCode??"-"].join("|"),c=g.get(k)??{count:0,failed:0,regenerated:0};c.count++;if(r.signal==="failed")c.failed++;if(r.signal==="regenerated")c.regenerated++;g.set(k,c)}return[...g.entries()].map(([key,v])=>({key,...v})).sort((a,b)=>(b.failed+b.regenerated)-(a.failed+a.regenerated));
}
