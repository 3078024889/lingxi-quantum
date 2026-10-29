export interface CatalogEntry {id:string;name:string;company:string;category:string;website:string;description:string;status:'active'|'discontinued'|'unverified';updatedAt:string;capabilities:string[]}
export function validCatalogEntry(x:unknown):x is CatalogEntry;
export function mergeCatalog(existing:CatalogEntry[],incoming:CatalogEntry[]):{data:CatalogEntry[];inserted:number;updated:number;identical:number};
export function searchCatalog(rows:CatalogEntry[],options?:{q?:string;category?:string;status?:string;limit?:number;cursor?:number}):{total:number;limit:number;cursor:number;nextCursor:number|null;items:CatalogEntry[]};
