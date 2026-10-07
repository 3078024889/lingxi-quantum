export interface RetryPolicy{maxAttempts:number;baseDelayMs:number;maxDelayMs:number;retryableCodes:Set<string>}
export interface RetryContext{attempt:number;code:string;streamStarted?:boolean;sideEffectStarted?:boolean;controlFlow?:boolean;allowUnsafeReplay?:boolean}
export type RetryDecision={retry:boolean;reason:"RETRYABLE"|"ATTEMPTS_EXHAUSTED"|"CODE_NOT_RETRYABLE"|"CONTROL_FLOW"|"UNSAFE_REPLAY"};
export function retryDecision(policy:RetryPolicy,context:RetryContext):RetryDecision{if(context.controlFlow)return{retry:false,reason:"CONTROL_FLOW"};if(context.attempt>=policy.maxAttempts)return{retry:false,reason:"ATTEMPTS_EXHAUSTED"};if(!policy.retryableCodes.has(context.code))return{retry:false,reason:"CODE_NOT_RETRYABLE"};if((context.streamStarted||context.sideEffectStarted)&&!context.allowUnsafeReplay)return{retry:false,reason:"UNSAFE_REPLAY"};return{retry:true,reason:"RETRYABLE"}}
export function shouldRetry(policy:RetryPolicy,attempt:number,code:string){return retryDecision(policy,{attempt,code}).retry}
export function retryDelay(policy:RetryPolicy,attempt:number){return Math.min(policy.maxDelayMs,policy.baseDelayMs*Math.pow(2,Math.max(0,attempt-1)))}
