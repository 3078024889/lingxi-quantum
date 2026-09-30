export type Capability="text.generate"|"text.reason"|"text.embed"|"vision.understand"|"image.generate"|"image.edit"|"audio.transcribe"|"audio.synthesize"|"video.generate"|"rerank";
export interface CapabilityRequest<T=unknown>{capability:Capability;input:T;model?:string;stream?:boolean;metadata?:Record<string,unknown>}
export interface CapabilityUsage{inputUnits?:number;outputUnits?:number;cost?:number}
export interface CapabilityResponse<T=unknown>{ok:boolean;output?:T;usage?:CapabilityUsage;providerId:string;model?:string;error?:{code:string;message:string;retryable:boolean}}
