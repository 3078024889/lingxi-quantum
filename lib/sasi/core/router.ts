import {CapabilityNode,CapabilityRequest,CapabilityResult} from './contracts';
export class CostAwareRouter{
 constructor(private nodes:CapabilityNode[]){}
 rank(r:CapabilityRequest){return this.nodes.filter(n=>n.kind===r.kind&&n.health>0.5).filter(n=>!r.constraints?.privacy||r.constraints.privacy.includes(n.privacy)).filter(n=>r.constraints?.maxCost==null||n.estimatedCost<=r.constraints.maxCost).filter(n=>r.constraints?.minQuality==null||n.quality>=r.constraints.minQuality).sort((a,b)=>this.score(b)-this.score(a));}
 private score(n:CapabilityNode){return n.quality*.45+n.health*.3+(1-Math.min(n.estimatedCost,1))*.15+(1-Math.min(n.estimatedLatencyMs/30000,1))*.1}
 async execute<T>(r:CapabilityRequest):Promise<CapabilityResult<T>>{const tried:string[]=[];for(const n of this.rank(r)){tried.push(n.id);try{const x=await n.execute<T>(r);if(x.ok)return x;if(!x.error?.retryable)continue;}catch{}}return {ok:false,provider:'none',route:tried.join(' -> '),cost:0,latencyMs:0,error:{code:'NO_VALID_ROUTE',message:'No capability route produced an acceptable result.',retryable:true}}}
}
