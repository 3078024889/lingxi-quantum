export type CandidateDecision={candidateKey:string;decision:'verified'|'rejected';reason:string};
export declare function validateCandidateDecision(value:unknown):CandidateDecision|null;
