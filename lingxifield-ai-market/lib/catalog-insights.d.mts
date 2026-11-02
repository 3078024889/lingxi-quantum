import type {CatalogEntry} from './catalog-engine.mjs';
export interface ImportIssue {index:number;code:string;id?:string;other?:string}
export function auditCatalogImport(current:CatalogEntry[],candidate:unknown[]):{total:number;insertable:number;updateable:number;identical:number;canImport:boolean;issues:ImportIssue[]};
export function discoverCatalog(rows:CatalogEntry[],input:string,options?:{limit?:number}):{query:string;dataAvailability:string;matched:number;items:(CatalogEntry&{matchScore:number})[];notice:string};
export function catalogReadiness(rows:CatalogEntry[],evidence?:unknown[]):{catalogEntries:number;invalidEntries:number;status:{active:number;unverified:number;discontinued:number};marketEvidenceRecords:number;hasVerifiedRankings:boolean;notes:string[]};
