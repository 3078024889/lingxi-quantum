export type CandidateQuery={status:'all'|'candidate'|'verified'|'rejected';search:string;limit:number;page:number;offset:number};
export declare function parseCandidateQuery(input:{status?:string|null;search?:string|null;limit?:string|number|null;page?:string|number|null}):CandidateQuery|null;
export declare function escapePostgrestSearch(search:string):string;
