export type MemoryScope="session"|"project"|"person";export interface MemoryItem{key:string;value:unknown;scope:MemoryScope;confidence:number;confirmed:boolean;updatedAt:string}
export function usableMemory(rows:MemoryItem[],scope:MemoryScope,minConfidence=.7){return rows.filter(x=>x.scope===scope&&x.confidence>=minConfidence&&(scope!=="person"||x.confirmed))}
export function mergeMemory(rows:MemoryItem[],next:MemoryItem){const old=rows.find(x=>x.key===next.key&&x.scope===next.scope);if(!old)return [...rows,next];return rows.map(x=>x===old?(next.updatedAt>=old.updatedAt?next:old):x)}
