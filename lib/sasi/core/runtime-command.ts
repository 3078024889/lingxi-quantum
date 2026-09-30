import {validateRuntimeRequest,type RuntimeRequest} from "./request-boundary";export type RuntimeCommand=RuntimeRequest&{idempotencyKey:string};
export function validateRuntimeCommand(x:Partial<RuntimeCommand>){const base=validateRuntimeRequest(x);const missing=[...base.missing];if(!String(x.idempotencyKey??"").trim())missing.push("idempotencyKey");return {pass:missing.length===0,missing}}
