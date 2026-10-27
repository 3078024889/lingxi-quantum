/** Beginner-facing availability and billing metadata; never infer missing facts. */
export type FactState = "verified" | "reported" | "unknown" | "not-applicable";
export type SourcedFact<T> = {
  state: FactState;
  value: T | null;
  sourceUrl: string | null;
  checkedAt: string | null;
  notes: string | null;
};
export type BillingOutcome = "success" | "failed" | "timeout" | "cancelled" | "moderated";
export type BillingPolicy = {
  outcome: BillingOutcome;
  chargeCredits: SourcedFact<number>;
  refundEligible: SourcedFact<boolean>;
  refundTimeHours: SourcedFact<number>;
};
export type PlanAvailability = {
  platformSlug: string;
  modelVersion: string | null;
  planId: string;
  region: string;
  device: "web" | "ios" | "android" | "windows" | "macos" | "api";
  signupRequired: SourcedFact<boolean>;
  phoneVerificationRequired: SourcedFact<boolean>;
  paymentCardRequired: SourcedFact<boolean>;
  supportedPaymentMethods: SourcedFact<string[]>;
  availableInRegion: SourcedFact<boolean>;
  freeCredits: SourcedFact<number>;
  freeQuotaUnit: SourcedFact<string>;
  quotaResetTimezone: SourcedFact<string>;
  quotaResetPeriod: SourcedFact<string>;
  maxConcurrentJobs: SourcedFact<number>;
  queueWaitP95Seconds: SourcedFact<number>;
  billingOutcomes: BillingPolicy[];
  originalDownloadAllowed: SourcedFact<boolean>;
  watermarkFreeExport: SourcedFact<boolean>;
  editableProjectExport: SourcedFact<boolean>;
  mobileSaveToGallery: SourcedFact<boolean>;
  outputRetentionDays: SourcedFact<number>;
  commercialUseAllowed: SourcedFact<boolean>;
  trainingOptOutAvailable: SourcedFact<boolean>;
};
export const unknownFact = <T>():SourcedFact<T> =>
  ({state:"unknown",value:null,sourceUrl:null,checkedAt:null,notes:null});
export function validFact<T>(fact:SourcedFact<T>):boolean {
  if(fact.state==="unknown" || fact.state==="not-applicable")
    return fact.value===null && fact.sourceUrl===null;
  if(fact.value===null || !fact.sourceUrl || !fact.checkedAt ||
     !Number.isFinite(Date.parse(fact.checkedAt))) return false;
  try {
    const u=new URL(fact.sourceUrl);
    return u.protocol==="https:" && !u.username && !u.password;
  } catch { return false; }
}
export function canShowVerified<T>(fact:SourcedFact<T>):fact is SourcedFact<T> & {value:T} {
  return fact.state==="verified" && validFact(fact);
}
