export interface RetryPolicy{maxAttempts:number;baseDelayMs:number;maxDelayMs:number;retryableCodes:Set<string>}
export function shouldRetry(policy:RetryPolicy,attempt:number,code:string){return attempt<policy.maxAttempts&&policy.retryableCodes.has(code)}
export function retryDelay(policy:RetryPolicy,attempt:number){return Math.min(policy.maxDelayMs,policy.baseDelayMs*Math.pow(2,Math.max(0,attempt-1)))}
