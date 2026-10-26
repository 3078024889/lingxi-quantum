import type {EvidenceInput,Metric} from "./evidence";
import {evidenceComparable} from "./evidence";
export type ReviewedEvidence=EvidenceInput&{reviewedAt:string;reviewer:string;sourceChecked:boolean;status:"approved"};
export type RankedTool={slug:string;value:number;unit:string;sourceUrl:string;sourceName:string;observedAt:string;kind:EvidenceInput["kind"]};
export type RankingResult={status:"unavailable";reason:string}|{status:"available";metric:Metric;geography:string;periodStart:string;periodEnd:string;unit:string;entries:RankedTool[]};
const validReview=(r:ReviewedEvidence)=>r.status==="approved"&&r.sourceChecked===true&&r.reviewer.trim().length>0&&Number.isFinite(Date.parse(r.reviewedAt));
export function rankComparableEvidence(records:readonly ReviewedEvidence[],metric:Metric,geography:string,periodStart:string,periodEnd:string):RankingResult{
 const candidates=records.filter(r=>validReview(r)&&r.metricKey===metric&&r.geography===geography&&r.periodStart===periodStart&&r.periodEnd===periodEnd&&Number.isFinite(r.value)&&r.value>=0);
 if(!candidates.length)return {status:"unavailable",reason:"No independently reviewed observations for this metric, region and period."};
 const units=[...new Set(candidates.map(x=>x.unit))];if(units.length!==1)return {status:"unavailable",reason:"Incompatible units; observations cannot be combined."};
 const latest=new Map<string,ReviewedEvidence>();
 for(const r of candidates){const prev=latest.get(r.toolSlug);if(!prev||Date.parse(r.observedAt)>Date.parse(prev.observedAt))latest.set(r.toolSlug,r);}
 const chosen=[...latest.values()];if(!chosen.every(r=>evidenceComparable(r,chosen[0])))return {status:"unavailable",reason:"Incompatible measurement windows."};
 return {status:"available",metric,geography,periodStart,periodEnd,unit:units[0],entries:chosen.sort((a,b)=>b.value-a.value||a.toolSlug.localeCompare(b.toolSlug)).map(r=>({slug:r.toolSlug,value:r.value,unit:r.unit,sourceUrl:r.sourceUrl,sourceName:r.sourceName,observedAt:r.observedAt,kind:r.kind}))};
}
