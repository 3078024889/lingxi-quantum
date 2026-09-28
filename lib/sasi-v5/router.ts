import type {SasiV5QualityTier,SasiV5RouteCandidate,SasiV5RouteDecision} from "./types";
import {qualityGate} from "./quality";
import {minimumContributionMargin,outcomeQuote,qualityAdjustedCostFen,realizedMargin,targetContributionMargin} from "./economics";
function score(c:SasiV5RouteCandidate){const q=c.quality,quality=q.overall*.34+q.instruction*.22+q.continuity*.18+q.reliability*.18+(q.identity??q.overall)*.04+(q.motion??q.overall)*.04;const cost=qualityAdjustedCostFen(c.economics);return quality-Math.min(.12,c.latencyMs/300000)-Math.min(.35,Math.log10(cost+10)/20)}
export function routeWithQualityFirst(i:{candidates:SasiV5RouteCandidate[];tier:SasiV5QualityTier;capability:string;minimumPriceFen?:number}):SasiV5RouteDecision{
 const rejected:Array<{id:string;reasons:string[]}>=[],qualified:SasiV5RouteCandidate[]=[];
 for(const c of i.candidates){const g=qualityGate(c,i.tier);if(!g.pass)rejected.push({id:c.id,reasons:g.reasons});else qualified.push({...c,quality:g.quality})}
 qualified.sort((a,b)=>score(b)-score(a));const selected=qualified[0]??null;
 if(!selected)return{selected:null,rejected,qualityTier:i.tier,quotedPriceFen:null,expectedDeliveryCostFen:null,expectedMargin:null};
 const cost=qualityAdjustedCostFen(selected.economics),price=outcomeQuote({deliveryCostFen:cost,targetMargin:targetContributionMargin(i.tier,i.capability),minimumPriceFen:i.minimumPriceFen}),margin=realizedMargin(price,cost);
 if(margin<minimumContributionMargin(i.capability)){rejected.push({id:selected.id,reasons:["MARGIN_FLOOR"]});return{selected:null,rejected,qualityTier:i.tier,quotedPriceFen:null,expectedDeliveryCostFen:null,expectedMargin:null}}
 return{selected,rejected,qualityTier:i.tier,quotedPriceFen:price,expectedDeliveryCostFen:cost,expectedMargin:margin};
}
