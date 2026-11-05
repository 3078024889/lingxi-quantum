/**
 * Private server-only catalog intake index. The single place to add future cohorts:
 * import the cohort, append to COHORTS, then attach its source audit evidence pack.
 * No public page, SEO route, API or ranking consumes these rows automatically.
 */
import "server-only";
import pub from "@/app/siai/directory-publication-manifest.json";
import {canonicalSiaiCategory} from "./market-category-taxonomy.mjs";
import b001 from "../data/company-intake/batch-001.json";
import b002 from "../data/company-intake/batch-002.json";
import b003 from "../data/company-intake/batch-003.json";
import b004 from "../data/company-intake/batch-004.json";
import b005 from "../data/company-intake/batch-005.json";
import b006 from "../data/company-intake/batch-006.json";
import b007 from "../data/company-intake/batch-007.json";
import b008 from "../data/company-intake/batch-008.json";
import b009 from "../data/company-intake/batch-009.json";
import b010 from "../data/company-intake/batch-010.json";
import o001 from "../data/siai-source-preview-20261103/batch-001-official-observations.json";
import o002 from "../data/siai-source-preview-20261103/batch-002-official-observations.json";
import o003 from "../data/siai-source-preview-20261103/batch-003-official-observations.json";
import o004 from "../data/company-intake/batch-004-official-observations.json";
import o005 from "../data/company-intake/batch-005-official-observations.json";
import o006 from "../data/company-intake/batch-006-official-observations.json";
import o007 from "../data/company-intake/batch-007-official-observations.json";

type Cohort={batch:string;products:readonly {id:string;name:string;company:string;category:string;website:string;
 evidenceUrl:string;publisherGroupId:string;tasks:readonly string[];reviewed:boolean;publishApproved:boolean}[];
 visibleToPublic:boolean;intakePaused:boolean;reviewState:string};
type SourceFact={status:string;text?:string;source?:string;checkedAt?:string};
type Observation={id:string;facts:Record<string,SourceFact>};
type EvidencePack={batch:string;products:readonly Observation[]};
export type PrivateSiaiCandidate={
 id:string;name:string;company:string;category:string;navigationGroup:string;website:string;batch:string;
 publisherGroupId:string;sourcePreview:boolean;newIntake:boolean;tasks:string[];evidenceUrl:string;
 evidence:{field:string;text:string;source:string;checkedAt:string|null}[];
};
const COHORTS:readonly Cohort[]=[b001,b002,b003,b004,b005,b006,b007,b008,b009,b010];
const EVIDENCE_PACKS:readonly EvidencePack[]=[
 o001 as EvidencePack,o002 as EvidencePack,o003 as EvidencePack,
 o004 as EvidencePack,o005 as EvidencePack,o006 as EvidencePack,o007 as EvidencePack
];
const previewIds=new Set(pub.sourcePreviewIds);
export function getPrivateSiaiCandidateIndex():{rows:PrivateSiaiCandidate[];total:number;
 publicPreviews:number;newIntake:number;pendingReview:number;sourcedFactCount:number}{
 const sourceRecords=new Map<string,Observation>();
 for(const source of EVIDENCE_PACKS)for(const observed of source.products){
  if(sourceRecords.has(observed.id))throw Error("SIAI_PRIVATE_DUPLICATE_OBSERVATION:"+observed.id);
  sourceRecords.set(observed.id,observed);
 }
 const seen=new Set<string>(),rows:PrivateSiaiCandidate[]=[];
 for(const batch of COHORTS){
  if(batch.products.length!==10||batch.visibleToPublic!==false||batch.intakePaused!==true||
   batch.reviewState!=="candidate")throw Error("SIAI_PRIVATE_BATCH_NOT_PENDING:"+batch.batch);
  for(const item of batch.products){
   if(seen.has(item.id))throw Error("SIAI_PRIVATE_DUPLICATE_PRODUCT:"+item.id);
   if(item.reviewed!==false||item.publishApproved!==false)throw Error("SIAI_PRIVATE_UNAPPROVED_PRODUCT_ESCAPED:"+item.id);
   if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.publisherGroupId))
    throw Error("SIAI_PRIVATE_BAD_PUBLISHER:"+item.id);
   seen.add(item.id);
   const raw=sourceRecords.get(item.id);
   const evidence=Object.entries(raw?.facts||{}).flatMap(([field,fact])=>
    fact.status==="observed"&&fact.source?.startsWith("https://")&&typeof fact.text==="string"?
     [{field,text:fact.text,source:fact.source,checkedAt:fact.checkedAt||null}]:[]);
   const navigationGroup=canonicalSiaiCategory(item.category);
   if(!navigationGroup)throw Error("SIAI_PRIVATE_UNKNOWN_CATEGORY:"+item.id);
   rows.push({id:item.id,name:item.name,company:item.company,category:item.category,navigationGroup,
    publisherGroupId:item.publisherGroupId,website:item.website,batch:batch.batch,
    tasks:[...item.tasks],evidenceUrl:item.evidenceUrl,evidence,
    sourcePreview:previewIds.has(item.id),newIntake:Number(batch.batch.slice(1))>=6});
  }
 }
 for(const p of pub.sourcePreviewIds)if(!seen.has(p))throw Error("SIAI_PRIVATE_SOURCE_PREVIEW_UNACCOUNTED:"+p);
 const publicPreviews=rows.filter(x=>x.sourcePreview).length,newIntake=rows.filter(x=>x.newIntake).length;
 return {rows,total:rows.length,publicPreviews,newIntake,pendingReview:rows.length-publicPreviews,
  sourcedFactCount:rows.reduce((n,p)=>n+p.evidence.length,0)};
}
