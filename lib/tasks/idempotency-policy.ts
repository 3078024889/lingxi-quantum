export type LingxiRetryClass="transient"|"rate-limited"|"permanent"|"unknown";
export type LingxiSideEffectKind="payment"|"message"|"storage-write"|"provider-submit"|"webhook"|"other";

export function stableOperationKey(input:{taskId:string;stepId:string;effect:LingxiSideEffectKind;businessKey?:string}){
 const business=(input.businessKey||"").trim();
 return["lingxi",input.taskId,input.stepId,input.effect,business].map(x=>encodeURIComponent(x)).join(":");
}

export function classifyRetry(input:{status?:number;code?:string;retryAfter?:boolean}):LingxiRetryClass{
 if(input.retryAfter||input.status===429)return"rate-limited";
 if(typeof input.status==="number"&&input.status>=400&&input.status<500)return"permanent";
 if(typeof input.status==="number"&&input.status>=500)return"transient";
 const code=(input.code||"").toUpperCase();
 if(["ETIMEDOUT","ECONNRESET","EAI_AGAIN","PROVIDER_BUSY","TEMPORARY_UNAVAILABLE"].includes(code))return"transient";
 if(["INVALID_INPUT","UNSUPPORTED_FORMAT","PERMISSION_DENIED","NOT_FOUND"].includes(code))return"permanent";
 return"unknown";
}

export function shouldRetry(input:{attempt:number;maxAttempts:number;classification:LingxiRetryClass}){
 return input.attempt<input.maxAttempts&&(input.classification==="transient"||input.classification==="rate-limited"||input.classification==="unknown");
}
