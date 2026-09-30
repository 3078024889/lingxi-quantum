export type CapabilityKind = 'text.generate'|'text.reason'|'text.embed'|'vision.understand'|'image.generate'|'image.edit'|'audio.transcribe'|'audio.synthesize'|'video.generate'|'document.transform'|'website.build';
export type PrivacyClass='local'|'byok'|'managed';
export interface CapabilityRequest<T=unknown>{id:string;kind:CapabilityKind;input:T;projectId?:string;locale?:string;constraints?:{maxCost?:number;maxLatencyMs?:number;privacy?:PrivacyClass[];minQuality?:number}}
export interface CapabilityResult<T=unknown>{ok:boolean;output?:T;provider:string;route:string;cost:number;latencyMs:number;quality?:number;error?:{code:string;message:string;retryable:boolean}}
export interface CapabilityNode{ id:string; kind:CapabilityKind; privacy:PrivacyClass; estimatedCost:number; estimatedLatencyMs:number; quality:number; health:number; execute<T=unknown>(r:CapabilityRequest):Promise<CapabilityResult<T>> }
