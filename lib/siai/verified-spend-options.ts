import {getSiaiDirectoryRows} from "@/app/siai/catalog-data";
import {taskMatches,type TaskFacet} from "@/lib/siai-home-facets";

export const SPEND_TASKS=["video","image","code","audio","research"] as const;
export type SpendTask=(typeof SPEND_TASKS)[number];
export type VerifiedSiaiOption={
 id:string;name:string;checkedAt:string|null;
 priceEvidenceUrl:string;freeEvidenceUrl:string|null;regionEvidenceUrl:string|null;
};
export type VerifiedSiaiOptions=Record<SpendTask,VerifiedSiaiOption[]>;

/** Curated, source-backed references—not cheapest, best or even guaranteed compatible. */
export function getVerifiedSiaiOptions():VerifiedSiaiOptions {
 const {curated}=getSiaiDirectoryRows(); // Never use unpublished research previews.
 const safeLink=(s:string|null):string|null=>{
  if(!s)return null;
  try{const u=new URL(s);return u.protocol==="https:"?u.href:null;}catch{return null;}
 };
 return Object.fromEntries(SPEND_TASKS.map(task=>{
  const entries=curated.filter(row=>taskMatches(row,task as TaskFacet))
   .flatMap(row=>{
    const priceEvidenceUrl=safeLink(row.priceSource);
    if(!priceEvidenceUrl)return [];
    return [{id:row.id,name:row.name,checkedAt:row.checkedAt,
     priceEvidenceUrl,
     freeEvidenceUrl:safeLink(row.freeSource),
     regionEvidenceUrl:safeLink(row.regionSource)}];
   })
   .sort((a,b)=>a.name.localeCompare(b.name,"en",{sensitivity:"base"}))
   .slice(0,5);
  return [task,entries];
 })) as VerifiedSiaiOptions;
}
