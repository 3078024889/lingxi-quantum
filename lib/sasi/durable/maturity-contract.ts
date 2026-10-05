export const SASI_MATURITY_GATES={
 durableExecution:true,
 idempotentResume:true,
 providerFaultIsolation:true,
 userQuotaRefundOnFailure:true,
 sessionContinuity:true,
 persistentCheckpoints:true,
 structuredContextCompaction:true,
 outcomeVerification:true,
 traceability:true,
 offlineEvalRequired:true,
 onlineQualityMonitoringRequired:true,
 chaosRecoveryRequired:true,
 securityToolBoundaryRequired:true,
 productionBurnInRequired:true,
}as const;

export function maturityClaimAllowed(evidence:{
 offlineEvalPass:boolean;onlineSloPass:boolean;chaosPass:boolean;securityPass:boolean;burnInPass:boolean;
}){
 return Object.values(evidence).every(Boolean);
}
