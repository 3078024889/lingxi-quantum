export type CleanupDecision="KEEP"|"ARCHIVE"|"DELETE";
export interface CleanupCandidate{path:string;reason:string;references:number;runtimeRequired:boolean;historicalEvidence:boolean}
export function decideCleanup(x:CleanupCandidate):CleanupDecision{if(x.runtimeRequired||x.references>0)return "KEEP";if(x.historicalEvidence)return "ARCHIVE";return "DELETE"}
export function safeDeleteCandidates(rows:CleanupCandidate[]){return rows.filter(x=>decideCleanup(x)==="DELETE")}
