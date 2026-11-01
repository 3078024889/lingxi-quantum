import type {CatalogEntry} from './catalog-engine.mjs';
export interface SourceCandidate { id:string;name:string;company:string;category:string;description:string;capabilities:string[];website:string;sourceUrl:string;sourceType:'official_site'|'official_docs'|'official_pricing'|'company_registry'|'app_store'|'third_party';observedAt:string;reviewStatus:'pending' }
export interface ReviewResult {staged:CatalogEntry[];conflicts:{id:string;reason:string;existingId?:string}[];summary:{candidateCount:number;staged:number;conflicts:number};catalogUnchanged:true}
export function normalizeWebsite(value:string):string|null;
export function validSourceCandidate(value:unknown):value is SourceCandidate;
export function reviewCandidates(existing:CatalogEntry[], candidates:unknown[]):ReviewResult;
export function approveCandidates(existing:CatalogEntry[],review:ReviewResult,approvedIds:string[]):{data:CatalogEntry[];inserted:number;updated:number;identical:number};
