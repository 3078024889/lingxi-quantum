import type{ProviderRefundObservation}from"./types";
import{observationToDbDecision}from"./refund-state";

export type ReconciliationDecision=
 |{kind:"complete";providerRefundId:string;providerStatus:string|null}
 |{kind:"release";failureCode:string;providerStatus:string|null}
 |{kind:"retry";afterSeconds:number;providerStatus:string|null;errorCode:string|null};

export function planReconciliation(observation:ProviderRefundObservation):ReconciliationDecision{
  const decision=observationToDbDecision(observation);
  if(decision.action==="complete"){
    const providerRefundId=String(observation.providerRefundId||"").trim();
    if(!providerRefundId)throw new Error("MONEY_PROVIDER_SUCCESS_WITHOUT_REFUND_ID");
    return{kind:"complete",providerRefundId,providerStatus:observation.providerStatus||null};
  }
  if(decision.action==="release"){
    return{
      kind:"release",
      failureCode:String(observation.errorCode||"PROVIDER_REFUND_FAILED").slice(0,120),
      providerStatus:observation.providerStatus||null
    };
  }
  return{
    kind:"retry",
    afterSeconds:decision.retryAfterSeconds,
    providerStatus:observation.providerStatus||null,
    errorCode:observation.errorCode||null
  };
}
