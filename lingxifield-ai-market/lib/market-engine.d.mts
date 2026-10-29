export const LANGUAGES: readonly string[];
export const METRICS: readonly string[];
export function validRecord(r: unknown): boolean;
export function mergeRecords(existing: any[], incoming: any[]): {records:any[]; inserted:number; identical:number};
export function queryRecords(rows:any[], opts?:{platformId?:string;metric?:string;region?:string;status?:string;limit?:string|number;offset?:string|number}):{total:number;offset:number;limit:number;data:any[]};
export function latestSnapshot(rows:any[], opts:{metric:string;region?:string}):any[];
export function history(rows:any[], opts:{platformId:string;metric:string;region?:string}):any[];
