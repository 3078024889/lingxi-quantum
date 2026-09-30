import type {CapabilityRequest,CapabilityResponse} from "./contracts";
import {CapabilityRegistry} from "./registry";
export async function executeCapability<T>(registry:CapabilityRegistry,request:CapabilityRequest,preferred?:string[]):Promise<CapabilityResponse<T>>{
 const all=registry.candidates(request.capability),preferredSet=new Set(preferred??[]);
 const first=(preferred??[]).map(id=>all.find(x=>x.id===id)).filter((x):x is NonNullable<typeof x>=>Boolean(x));
 const order=preferred?.length?[...first,...all.filter(x=>!preferredSet.has(x.id))]:all;
 if(!order.length)return {ok:false,code:"CAPABILITY_UNAVAILABLE",retryable:false,message:"当前暂时无法完成这一步。"};
 let last:CapabilityResponse<T>|undefined;
 for(const adapter of order){try{const result=await adapter.execute<T>(request);if(result.ok)return result;last=result;if(!result.retryable)break}catch{last={ok:false,code:"CAPABILITY_FAILED",retryable:true,message:"这一步没有完成，正在尝试其他方式。"}}}
 return last??{ok:false,code:"CAPABILITY_FAILED",retryable:false,message:"这次没有完成，请稍后再试。"};
}
