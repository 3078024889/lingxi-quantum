// Commercial placement never controls organic search rank.
export const SLOTS=Object.freeze(['category_feature','search_sponsored','comparison_sponsored','homepage_feature']);
const text=(x,n=200)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
export function validateClaim(x){
 if(!x||!text(x.companyId)||!text(x.productId)||!text(x.actorId)||!['pending','approved','rejected','revoked'].includes(x.status)||!['domain_dns','domain_file','official_email'].includes(x.proofType))return null;
 if(x.status==='approved'&&(!x.verifiedAt||!text(x.reviewedBy)))return null;
 return {companyId:x.companyId,productId:x.productId,actorId:x.actorId,status:x.status,proofType:x.proofType,verifiedAt:x.verifiedAt||null,reviewedBy:x.reviewedBy||null};
}
export function freeClaimEligibility(claims,companyId,productId){
 const active=(claims||[]).map(validateClaim).filter(Boolean).filter(x=>x.companyId===companyId&&x.status==='approved');
 const products=new Set(active.map(x=>x.productId));
 return {eligible:products.has(productId)||products.size<3,used:products.size,freeLimit:3,requiresVerification:true};
}
export function priceSelection(packagePrice,currency){
 if(!['USD','CNY'].includes(currency)||!Number.isSafeInteger(packagePrice)||packagePrice<0)return null;
 return {currency,nominal:packagePrice,conversionApplied:false};
}
export function validatePlacement(x){
 if(!x||!text(x.companyId)||!text(x.productId)||!SLOTS.includes(x.slot)||!text(x.orderId)||!text(x.paymentReference)||!['confirmed','active','expired','cancelled'].includes(x.status))return null;
 if(!Number.isFinite(Date.parse(x.startAt))||!Number.isFinite(Date.parse(x.endAt))||Date.parse(x.endAt)<=Date.parse(x.startAt))return null;
 if(x.status==='active'&&!x.paymentVerifiedAt)return null;
 return {...x,sponsored:true,affectsOrganicRank:false};
}
export function startOrder(request,approvedProducts){
 if(!request||!text(request.companyId)||!text(request.productId)||!text(request.idempotencyKey,128)||!SLOTS.includes(request.slot)||!['USD','CNY'].includes(request.currency))return null;
 if(!approvedProducts?.has(request.companyId+':'+request.productId))return null;
 return {companyId:request.companyId,productId:request.productId,slot:request.slot,currency:request.currency,idempotencyKey:request.idempotencyKey,status:'pending_payment',paymentConfirmed:false};
}
