import {validCatalogEntry,mergeCatalog} from './catalog-engine.mjs';
const ID=/^[a-z0-9][a-z0-9-]{1,79}$/;
const TEXT=x=>typeof x==='string'&&x.trim().length>0;
const allowed=new Set(['official_site','official_docs','official_pricing','company_registry','app_store','third_party']);
export function normalizeWebsite(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.'))return null;
 u.hash='';u.search='';u.pathname=u.pathname.replace(/\/+$/,'')||'/';u.hostname=u.hostname.toLowerCase();return u.toString();}
 catch{return null}
}
export function validSourceCandidate(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||!ID.test(x.id||''))return false;
 if(!TEXT(x.name)||!TEXT(x.company)||!TEXT(x.category)||!TEXT(x.description))return false;
 if(!Array.isArray(x.capabilities)||x.capabilities.some(v=>!TEXT(v)))return false;
 if(!normalizeWebsite(x.website)||!normalizeWebsite(x.sourceUrl))return false;
 if(!allowed.has(x.sourceType)||!Number.isFinite(Date.parse(x.observedAt)))return false;
 return x.reviewStatus==='pending';
}
export function reviewCandidates(existing,candidates){
 if(!Array.isArray(existing)||!Array.isArray(candidates))throw Error('Expected arrays');
 const ids=new Set(),domains=new Map(),known=new Map();
 for(const row of existing){if(!validCatalogEntry(row))throw Error('Invalid existing catalog');known.set(row.id,row);const host=new URL(row.website).hostname.replace(/^www\./,'');domains.set(host,row.id)}
 const accepted=[],conflicts=[];
 for(const row of candidates){
  if(!validSourceCandidate(row)){conflicts.push({id:String(row?.id??'?'),reason:'invalid_candidate'});continue}
  if(ids.has(row.id)){conflicts.push({id:row.id,reason:'duplicate_batch_id'});continue}ids.add(row.id);
  const host=new URL(row.website).hostname.replace(/^www\./,'');
  if(known.has(row.id)){conflicts.push({id:row.id,reason:'existing_id_requires_review'});continue}
  if(domains.has(host)){conflicts.push({id:row.id,reason:'website_already_used',existingId:domains.get(host)});continue}
  domains.set(host,row.id);
  accepted.push({id:row.id,name:row.name,company:row.company,category:row.category,website:normalizeWebsite(row.website),description:row.description,status:'unverified',updatedAt:row.observedAt,capabilities:row.capabilities});
 }
 return {staged:accepted,conflicts,summary:{candidateCount:candidates.length,staged:accepted.length,conflicts:conflicts.length},catalogUnchanged:true};
}
export function approveCandidates(existing,review,approvedIds){
 if(!Array.isArray(approvedIds)||new Set(approvedIds).size!==approvedIds.length)throw Error('Invalid approved IDs');
 const allowed=new Set(approvedIds), staged=review.staged.filter(x=>allowed.has(x.id));
 if(staged.length!==allowed.size)throw Error('Approval includes unknown ID');
 return mergeCatalog(existing,staged);
}
