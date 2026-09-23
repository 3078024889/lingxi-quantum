import type { SasiLearningFeedbackSignal } from "@/lib/sasi/integration/feedback-repository";

export type SasiFeedbackClosure = { signal:SasiLearningFeedbackSignal; severity:"none"|"low"|"medium"|"high"; createsFailureCandidate:boolean; createsActiveLearningCandidate:boolean; reasonCodes:string[]; };

export function closeUserFeedback(signal:SasiLearningFeedbackSignal):SasiFeedbackClosure {
 if(signal==="helpful") return {signal,severity:"none",createsFailureCandidate:false,createsActiveLearningCandidate:false,reasonCodes:["USER_CONFIRMED_HELPFUL"]};
 if(signal==="not-helpful") return {signal,severity:"low",createsFailureCandidate:true,createsActiveLearningCandidate:true,reasonCodes:["USER_NOT_HELPFUL"]};
 if(signal==="insufficient-evidence") return {signal,severity:"medium",createsFailureCandidate:true,createsActiveLearningCandidate:true,reasonCodes:["EVIDENCE_GAP_REPORTED"]};
 return {signal,severity:"high",createsFailureCandidate:true,createsActiveLearningCandidate:true,reasonCodes:["USER_REPORTED_INCORRECT"]};
}
