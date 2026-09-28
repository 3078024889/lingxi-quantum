import type {SasiV5QualityTier,SasiV5QualityVector,SasiV5RouteCandidate} from "./types";
const FLOOR:Record<SasiV5QualityTier,{overall:number;instruction:number;reliability:number;continuity:number}>={
 fast:{overall:.68,instruction:.70,reliability:.78,continuity:.65},
 standard:{overall:.78,instruction:.80,reliability:.86,continuity:.76},
 premium:{overall:.86,instruction:.88,reliability:.91,continuity:.84},
};
const bounded=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
export function normalizeQuality(q:SasiV5QualityVector):SasiV5QualityVector{return{
 overall:bounded(q.overall),instruction:bounded(q.instruction),reliability:bounded(q.reliability),continuity:bounded(q.continuity),
 ...(q.identity==null?{}:{identity:bounded(q.identity)}),...(q.typography==null?{}:{typography:bounded(q.typography)}),
 ...(q.motion==null?{}:{motion:bounded(q.motion)}),...(q.physics==null?{}:{physics:bounded(q.physics)})
}}
export function qualityGate(c:SasiV5RouteCandidate,tier:SasiV5QualityTier){
 const q=normalizeQuality(c.quality),f=FLOOR[tier],reasons:string[]=[];
 if(c.stage!=="stable")reasons.push("NOT_STABLE"); if(!c.licenseAllowed)reasons.push("LICENSE_BLOCKED");
 if(!c.safetyPassed)reasons.push("SAFETY_NOT_PASSED"); if(!c.priceValid)reasons.push("PRICE_STALE");
 if(!c.regionAvailable)reasons.push("REGION_UNAVAILABLE"); if(q.overall<f.overall)reasons.push("QUALITY_FLOOR");
 if(q.instruction<f.instruction)reasons.push("INSTRUCTION_FLOOR"); if(q.reliability<f.reliability)reasons.push("RELIABILITY_FLOOR");
 if(q.continuity<f.continuity)reasons.push("CONTINUITY_FLOOR"); return{pass:reasons.length===0,reasons,quality:q};
}
export function visualQualityGate(i:{tier:SasiV5QualityTier;vector:SasiV5QualityVector;textCritical?:boolean;identityCritical?:boolean;motionCritical?:boolean}){
 const q=normalizeQuality(i.vector),f=FLOOR[i.tier],reasons:string[]=[];
 if(q.overall<f.overall)reasons.push("QUALITY_FLOOR"); if(q.instruction<f.instruction)reasons.push("INSTRUCTION_FLOOR");
 if(q.reliability<f.reliability)reasons.push("RELIABILITY_FLOOR"); if(q.continuity<f.continuity)reasons.push("CONTINUITY_FLOOR");
 if(i.textCritical&&(q.typography??0)<(i.tier==="premium"?.92:.84))reasons.push("TYPOGRAPHY_FLOOR");
 if(i.identityCritical&&(q.identity??0)<(i.tier==="premium"?.92:.84))reasons.push("IDENTITY_FLOOR");
 if(i.motionCritical&&(q.motion??0)<(i.tier==="premium"?.88:.78))reasons.push("MOTION_FLOOR");
 return{pass:reasons.length===0,reasons,quality:q};
}
