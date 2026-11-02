import "server-only";
type Status="pending_review"|"identity_verified"|"approved"|"rejected"|"revoked";
export type ReviewDecision={id:string;expectedStatus:Status;status:Status;reason:string;proofConfirmed:boolean};
const status=new Set<Status>(["pending_review","identity_verified","approved","rejected","revoked"]);
const transitions:Record<Status,readonly Status[]>={
 pending_review:["identity_verified","approved","rejected"],
 identity_verified:["approved","rejected"],
 approved:["revoked"],
 rejected:[],
 revoked:[]
};
export function parseReviewDecision(raw:unknown):ReviewDecision|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const x=raw as Record<string,unknown>;
 const id=typeof x.id==="string"?x.id:"";
 const previous=x.expectedStatus as Status,target=x.status as Status;
 const reason=typeof x.reason==="string"?x.reason.trim():"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||
  !status.has(previous)||!status.has(target)||!transitions[previous].includes(target)||
  reason.length<12||reason.length>1000)return null;
 const proofConfirmed=x.proofConfirmed===true;
 if((target==="approved"||target==="identity_verified")&&!proofConfirmed)return null;
 return {id,expectedStatus:previous,status:target,reason,proofConfirmed};
}
export function isMarketReviewer(user:{id?:string;email_confirmed_at?:string|null;app_metadata?:Record<string,unknown>}|null|undefined){
 return !!user?.id&&!!user.email_confirmed_at&&user.app_metadata?.ai_market_vendor_reviewer===true;
}
