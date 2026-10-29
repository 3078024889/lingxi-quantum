export type AiIdentity={id:string;type:'company'|'product'|'model'|'version';source:string;upstreamId:string;name:string;sourceUrl:string;observedAt:string;status:'candidate'|'verified'|'rejected'|'discontinued';externalUrl:string|null;metadata:Record<string,unknown>};
export declare const ENTITY_TYPES:readonly string[];
export declare const REVIEW_STATUSES:readonly string[];
export declare function canonicalId(type:string,source:string,upstreamId:string):string;
export declare function normalizeInput(input:Record<string,unknown>,observedAt?:string):AiIdentity;
export declare function reconcileSnapshot(existing:AiIdentity[],incoming:Record<string,unknown>[]):{records:AiIdentity[];stats:{inserted:number;changed:number;unchanged:number;total:number};publicationApproved:false};
export declare function publicSearch(records:AiIdentity[],query:string,options?:{kind?:string;limit?:number}):AiIdentity[];
