import type{MoneyWithdrawalStatus,ProviderRefundObservation}from"./types";

export function normalizeWithdrawalStatus(dbStatus:string|null|undefined,providerStatus?:string|null):MoneyWithdrawalStatus{
  const s=String(dbStatus||"").toLowerCase();
  const p=String(providerStatus||"").toLowerCase();
  if(s==="cancelled")return"cancelled";
  if(s==="completed")return"succeeded";
  if(s==="failed"||s==="rejected")return"failed";
  if(s==="processing")return"provider_pending";
  if(s==="requested")return"requested";
  return"provider_pending";
}

export function observationToDbDecision(observation:ProviderRefundObservation){
  if(observation.status==="succeeded")return{action:"complete" as const};
  if(observation.status==="failed")return{action:"release" as const};
  return{
    action:"wait" as const,
    retryAfterSeconds:Math.max(30,Math.min(86400,Number(observation.retryAfterSeconds||300)))
  };
}
