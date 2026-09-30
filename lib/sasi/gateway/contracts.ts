export type Capability = "text.generate"|"text.reason"|"text.embed"|"vision.understand"|"image.generate"|"image.edit"|"audio.transcribe"|"audio.synthesize"|"video.generate"|"rerank";
export type CapabilityRequest={capability:Capability;model?:string;input:unknown;stream?:boolean;metadata?:Record<string,string>};
export type CapabilityUsage={inputUnits?:number;outputUnits?:number;durationMs?:number;costMinor?:number;currency?:"CNY"|"USD"};
export type CapabilityResponse<T=unknown>={ok:true;provider:string;model?:string;output:T;usage?:CapabilityUsage}|{ok:false;code:string;retryable:boolean;message:string};
export interface CapabilityAdapter{ id:string; capabilities:ReadonlySet<Capability>; execute<T=unknown>(request:CapabilityRequest):Promise<CapabilityResponse<T>>; }
