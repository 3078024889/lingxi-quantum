export type CandidateRow={candidate_key:string;source:string;source_url:string;kind:string;display_name:string;publisher:string;last_seen_at:string;source_updated_at:string|null;raw_evidence:Record<string,unknown>;verification_status?:string};
export declare function normalizeCandidateRows(candidates:unknown[],now?:string):CandidateRow[];
export declare function partitionInsertUpdate(existing:{candidate_key:string;verification_status:string}[],rows:CandidateRow[]):{insert:CandidateRow[];update:CandidateRow[];skipped:string[]};
