import type {CatalogEntry} from './catalog-engine.mjs';
export interface CatalogQuality {total:number;valid:number;invalid:number;duplicates:number;uniqueIds:number;statuses:{active:number;discontinued:number;unverified:number};categories:Record<string,number>;verifiedMarketMetrics:number;note:string}
export function catalogQuality(input:unknown[]):CatalogQuality;
export function catalogDetail(input:unknown[],id:string):CatalogEntry|null;
