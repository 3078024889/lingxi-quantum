import "server-only";
import type {BillingClass,ExecutionMode} from "@/lib/pricing/policy";

export type CapabilityBillingPolicy={
  executionMode:ExecutionMode;
  billingClass:BillingClass;
  reason:"ONE_TIME_TOOL"|"SASI_SHARED_BALANCE"|"USER_SUPPLIER_DIRECT"|"NOT_PRODUCTION_READY";
};

const POLICY:Record<string,CapabilityBillingPolicy>={
  "cross-page-stamp":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "e-sign-pdf":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "pdf-editor":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "audio-transcription":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "video-transcription":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "batch-image-watermark-remover":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "image-watermark-remover":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "video-watermark-remover":{executionMode:"local",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "food-calorie":{executionMode:"server",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "burn-after-read-file":{executionMode:"server",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "temp-mail-batch":{executionMode:"server",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "subtitle-translate":{executionMode:"connected_service",billingClass:"PAID_TOOL",reason:"ONE_TIME_TOOL"},
  "sasi-deep-reason":{executionMode:"connected_service",billingClass:"SASI_BALANCE",reason:"SASI_SHARED_BALANCE"},
  "sasi-image-generate":{executionMode:"connected_service",billingClass:"SASI_BALANCE",reason:"SASI_SHARED_BALANCE"},
  "sasi-video-generate":{executionMode:"connected_service",billingClass:"SASI_BALANCE",reason:"SASI_SHARED_BALANCE"},
  "id-photo-ai":{executionMode:"server",billingClass:"DISABLED",reason:"NOT_PRODUCTION_READY"},
  "video-dubbing":{executionMode:"connected_service",billingClass:"DISABLED",reason:"NOT_PRODUCTION_READY"}
};

export function capabilityBillingPolicy(toolId:string):CapabilityBillingPolicy|null{return POLICY[toolId]??null;}
export function shouldChargePlatform(toolId:string){
  const p=capabilityBillingPolicy(toolId);
  return Boolean(p&&(p.billingClass==="PAID_TOOL"||p.billingClass==="SASI_BALANCE"));
}
export function capabilityBillingClass(toolId:string){return capabilityBillingPolicy(toolId)?.billingClass??"DISABLED";}
export const CAPABILITY_BILLING_POLICY=Object.freeze(POLICY);
