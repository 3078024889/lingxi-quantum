import "server-only";
import type {ChargingClass,ExecutionMode} from "@/lib/pricing/policy";

export type CapabilityBillingPolicy={
  executionMode:ExecutionMode;
  chargingClass:ChargingClass;
  reason:"DETERMINISTIC_LOCAL"|"LOCAL_MODEL"|"DIRECT_INFRA_COST"|"EXTERNAL_SEMANTIC_COST"|"PREMIUM_PRODUCT_EXCEPTION"|"NOT_PRODUCTION_READY";
};

const POLICY:Record<string,CapabilityBillingPolicy>={
  "cross-page-stamp":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"DETERMINISTIC_LOCAL"},
  "e-sign-pdf":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"DETERMINISTIC_LOCAL"},
  "pdf-editor":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"DETERMINISTIC_LOCAL"},
  "audio-transcription":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},
  "video-transcription":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},
  "batch-image-watermark-remover":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},
  "image-watermark-remover":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},
  "video-watermark-remover":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},
  "id-photo-ai":{executionMode:"local",chargingClass:"FREE_LOCAL",reason:"LOCAL_MODEL"},

  // Product decision: one image/day is free; additional analyses are premium at the independent CNY/USD image price books.
  "food-calorie":{executionMode:"managed",chargingClass:"HYBRID",reason:"PREMIUM_PRODUCT_EXCEPTION"},

  "burn-after-read-file":{executionMode:"managed",chargingClass:"HYBRID",reason:"DIRECT_INFRA_COST"},
  "temp-mail-batch":{executionMode:"managed",chargingClass:"HYBRID",reason:"DIRECT_INFRA_COST"},
  "subtitle-translate":{executionMode:"managed",chargingClass:"PAID_EXTERNAL",reason:"EXTERNAL_SEMANTIC_COST"},
  "sasi-deep-reason":{executionMode:"managed",chargingClass:"PAID_EXTERNAL",reason:"EXTERNAL_SEMANTIC_COST"},
  "sasi-image-generate":{executionMode:"managed",chargingClass:"PAID_EXTERNAL",reason:"EXTERNAL_SEMANTIC_COST"},
  "sasi-video-generate":{executionMode:"managed",chargingClass:"PAID_EXTERNAL",reason:"EXTERNAL_SEMANTIC_COST"},

  "video-dubbing":{executionMode:"local",chargingClass:"DISABLED_UNVERIFIED",reason:"NOT_PRODUCTION_READY"},
};

export function capabilityBillingPolicy(toolId:string):CapabilityBillingPolicy|null{
  return POLICY[toolId]??null;
}
export function shouldChargePlatform(toolId:string){
  const p=capabilityBillingPolicy(toolId);
  return Boolean(p&&(p.chargingClass==="PAID_EXTERNAL"||p.chargingClass==="HYBRID"));
}
export function isFreeLocalCapability(toolId:string){
  return capabilityBillingPolicy(toolId)?.chargingClass==="FREE_LOCAL";
}
export const CAPABILITY_BILLING_POLICY=Object.freeze(POLICY);
