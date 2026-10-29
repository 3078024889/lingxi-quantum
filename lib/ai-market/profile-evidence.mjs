const HTTPS = value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}};
const text=(x,max=500)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
export const PROFILE_FIELDS=Object.freeze(['founded_year','headquarters','funding','official_website','commercial_license','free_quota','regional_access','refund_policy','price','service_limits']);
export function validateProfileClaim(claim){
 if(!claim||!text(claim.entityId,250)||!PROFILE_FIELDS.includes(claim.field)||!text(claim.value,2000)||!HTTPS(claim.sourceUrl)||!text(claim.sourceName,200)||!Number.isFinite(Date.parse(claim.checkedAt))||!['official','registry','licensed_third_party'].includes(claim.sourceClass)||claim.reviewStatus!=='verified')return null;
 if(claim.field==='founded_year'&&!/^(18|19|20)\d\d$/.test(claim.value))return null;
 return {entityId:claim.entityId,field:claim.field,value:claim.value,sourceUrl:claim.sourceUrl,sourceName:claim.sourceName,sourceClass:claim.sourceClass,checkedAt:claim.checkedAt};
}
export function buildProfile(entity,claims,feedback){
 if(!entity||entity.status!=='verified'||!text(entity.id)||!text(entity.name))return null;
 const fields={};const contradictions=[];
 const grouped=new Map();
 for(const raw of claims){const c=validateProfileClaim(raw);if(!c||c.entityId!==entity.id)continue;const bucket=grouped.get(c.field)||[];bucket.push(c);grouped.set(c.field,bucket);}
 for(const field of PROFILE_FIELDS){
  const values=grouped.get(field)||[];
  const distinct=new Set(values.map(x=>x.value));
  if(distinct.size>1){fields[field]=null;contradictions.push(field);continue;}
  fields[field]=values.length?values.sort((a,b)=>b.checkedAt.localeCompare(a.checkedAt))[0]:null;
 }
 return {id:entity.id,name:entity.name,fields,contradictions,feedback:summarizeFeedback(feedback,entity.id),publishable:true};
}
export function validateFeedback(x){
 if(!x||!text(x.entityId,250)||!['youtube','github','x','first_party'].includes(x.platform)||!text(x.externalId,200)||!HTTPS(x.sourceUrl)||!text(x.summary,700)||!text(x.observedAt,60)||!Number.isFinite(Date.parse(x.observedAt))||x.reviewStatus!=='verified'||x.rightsChecked!==true)return null;
 if(!['pricing','reliability','quality','ease_of_use','availability','billing','other'].includes(x.topic))return null;
 return {entityId:x.entityId,platform:x.platform,externalId:x.externalId,sourceUrl:x.sourceUrl,summary:x.summary.trim(),topic:x.topic,observedAt:x.observedAt};
}
export function summarizeFeedback(feedback,entityId){
 const seen=new Set(),out=[];
 for(const raw of feedback||[]){const f=validateFeedback(raw);if(!f||f.entityId!==entityId)continue;const k=f.platform+':'+f.externalId;if(seen.has(k))continue;seen.add(k);out.push(f);}
 return out.sort((a,b)=>b.observedAt.localeCompare(a.observedAt)).slice(0,30);
}
