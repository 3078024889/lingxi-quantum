import type {CatalogEntry} from './catalog-engine.mjs';
export function createSearchIndex(rows:CatalogEntry[]):{size:number;get(id:string):CatalogEntry|undefined;search(options?:{q?:string;category?:string;limit?:number;cursor?:number}):{total:number;limit:number;cursor:number;nextCursor:number|null;items:CatalogEntry[]}};
