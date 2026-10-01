import{GLOBAL_FOOD_IDENTITIES,resolveFoodIdentity}from"./global-food-identity";
import{foodRegionsForCountry}from"./region-hierarchy";
export type VisionCandidate={label:string;score:number;evidence?:number;requiresConfirmation?:boolean;regionHits?:number;viewCount?:number};
export type CanonicalVisionCandidate={label:string;canonicalKey:string|null;displayName:string;score:number;regionalBoost:number;requiresConfirmation:boolean;regionHits:number;viewCount:number;relativeShare:number|null};
export function rerankFoodVision(rows:VisionCandidate[],country?:string|null):CanonicalVisionCandidate[]{
 const regions=new Set(foodRegionsForCountry(country));return rows.map(x=>{
  const r=resolveFoodIdentity(x.label,country),f=r?.food;
  const countryHit=!!f?.countries.includes(String(country||"").toUpperCase()),regionHit=!!f?.regions.some(v=>regions.has(v));
  const boost=countryHit?.12:regionHit?.06:0,score=Math.min(.999,Number(x.score||0)+boost);
  const regionHits=Math.max(1,Number(x.regionHits||1)),viewCount=Math.max(regionHits,Number(x.viewCount||regionHits));
  const share=viewCount>1?Math.min(1,regionHits/viewCount):null;
  return{label:x.label,canonicalKey:f?.key||null,displayName:f?.names.zh||f?.names.en||x.label,score,regionalBoost:boost,
   requiresConfirmation:Boolean(x.requiresConfirmation||!f||score<.52),regionHits,viewCount,relativeShare:share};
 }).sort((a,b)=>b.score-a.score).slice(0,12)
}
export function mixedMealHints(rows:CanonicalVisionCandidate[]){
 const top=rows.filter(x=>x.score>=.16).slice(0,8),keys=new Set(top.map(x=>x.canonicalKey).filter(Boolean));
 const multi=top.filter(x=>(x.regionHits||1)>=2).length>1||top.length>=3;
 return{multiCandidate:multi,componentCandidates:[...keys],requiresConfirmation:top.length===0||top.some(x=>x.requiresConfirmation),
  portionEstimation:"RELATIVE_ONLY_UNLESS_SCALE_OR_DEPTH" as const};
}
export type PortionEvidence={mode:"single-image"|"reference-scale"|"multi-view-depth";relativeArea?:number;referenceDiameterCm?:number;depthAvailable?:boolean};
export function portionDecision(e:PortionEvidence){
 if(e.mode==="multi-view-depth"&&e.depthAvailable)return{grams:null,confidence:"medium",action:"ESTIMATE_THEN_CONFIRM" as const};
 if(e.mode==="reference-scale"&&Number(e.referenceDiameterCm)>0)return{grams:null,confidence:"low",action:"RANGE_THEN_CONFIRM" as const};
 return{grams:null,confidence:"insufficient",action:"USER_CONFIRM_REQUIRED" as const};
}
// CLIP's English prompts use one canonical name, not multilingual synonyms
// competing for probability. Translation belongs in the display/search layers.
export const GLOBAL_VISION_VOCABULARY=[...new Set(GLOBAL_FOOD_IDENTITIES.map(f=>f.names.en))];
