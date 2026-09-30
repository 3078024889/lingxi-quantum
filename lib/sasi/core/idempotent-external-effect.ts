export interface EffectStore{get(key:string):Promise<unknown|undefined>;put(key:string,value:unknown):Promise<void>}
export async function idempotentEffect<T>(store:EffectStore,key:string,run:()=>Promise<T>){const existing=await store.get(key);if(existing!==undefined)return {replayed:true,value:existing as T};const value=await run();await store.put(key,value);return {replayed:false,value}}
