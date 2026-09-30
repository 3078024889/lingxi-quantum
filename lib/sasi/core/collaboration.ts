export interface SASIEnvelope{protocol:"lingxifield-sasi/1";messageId:string;from:string;to:string;projectId?:string;intent:string;capabilities:string[];constraints:Record<string,unknown>;createdAt:string}
export function createEnvelope(input:Omit<SASIEnvelope,"protocol"|"messageId"|"createdAt">):SASIEnvelope{return {...input,protocol:"lingxifield-sasi/1",messageId:crypto.randomUUID(),createdAt:new Date().toISOString()}}
export function validateEnvelope(x:SASIEnvelope){return x.protocol==="lingxifield-sasi/1"&&Boolean(x.from&&x.to&&x.intent)&&Array.isArray(x.capabilities)}
