export interface RuntimeRequest{ownerId:string;projectId:string;taskId:string;tool?:string;capability?:string;input:unknown;locale?:string}
export function validateRuntimeRequest(x:Partial<RuntimeRequest>){const missing=["ownerId","projectId","taskId"].filter(k=>!String((x as any)[k]??"").trim());if(!x.tool&&!x.capability)missing.push("executionTarget");return {pass:missing.length===0,missing}}
