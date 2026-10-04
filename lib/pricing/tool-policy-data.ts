import type {BillingClass,ExecutionMode} from "./policy";

export type ToolBillingPolicy={toolId:string;billingClass:BillingClass;executionMode:ExecutionMode;reason:string};

const POLICY:Record<string,ToolBillingPolicy>={
  "audio-transcription":{toolId:"audio-transcription",billingClass:"PAID_TOOL",executionMode:"local",reason:"practical tools use one-time payment regardless of execution location"},
  "batch-image-watermark-remover":{toolId:"batch-image-watermark-remover",billingClass:"PAID_TOOL",executionMode:"local",reason:"practical tools use one-time payment"},
  "burn-after-read-file":{toolId:"burn-after-read-file",billingClass:"PAID_TOOL",executionMode:"server",reason:"storage and delivery are operating costs"},
  "cross-page-stamp":{toolId:"cross-page-stamp",billingClass:"PAID_TOOL",executionMode:"local",reason:"PDF tools follow configured one-time pricing"},
  "e-sign-pdf":{toolId:"e-sign-pdf",billingClass:"PAID_TOOL",executionMode:"local",reason:"PDF tools follow configured one-time pricing"},
  "food-calorie":{toolId:"food-calorie",billingClass:"PAID_TOOL",executionMode:"server",reason:"practical tool pricing is independent of implementation mechanism"},
  "id-photo-ai":{toolId:"id-photo-ai",billingClass:"DISABLED",executionMode:"server",reason:"production quality must be verified before enabling billing"},
  "image-watermark-remover":{toolId:"image-watermark-remover",billingClass:"PAID_TOOL",executionMode:"local",reason:"practical tools use one-time payment"},
  "pdf-editor":{toolId:"pdf-editor",billingClass:"PAID_TOOL",executionMode:"local",reason:"PDF tools follow configured one-time pricing"},
  "subtitle-translate":{toolId:"subtitle-translate",billingClass:"PAID_TOOL",executionMode:"connected_service",reason:"practical tools remain one-time purchases"},
  "temp-mail-batch":{toolId:"temp-mail-batch",billingClass:"PAID_TOOL",executionMode:"server",reason:"infrastructure use is an operating cost"},
  "video-dubbing":{toolId:"video-dubbing",billingClass:"DISABLED",executionMode:"connected_service",reason:"full output chain must be production verified before enabling"},
  "video-translate":{toolId:"video-translate",billingClass:"PAID_TOOL",executionMode:"connected_service",reason:"batch video translation uses paid transcription/translation/TTS media services"},
  "video-transcription":{toolId:"video-transcription",billingClass:"PAID_TOOL",executionMode:"local",reason:"practical tools use one-time payment"},
  "video-watermark-remover":{toolId:"video-watermark-remover",billingClass:"PAID_TOOL",executionMode:"local",reason:"local processing still has operating cost"},
  "sasi-deep-reason":{toolId:"sasi-deep-reason",billingClass:"SASI_BALANCE",executionMode:"connected_service",reason:"all SASI capabilities share the unified SASI balance"},
  "sasi-image-generate":{toolId:"sasi-image-generate",billingClass:"SASI_BALANCE",executionMode:"connected_service",reason:"user supplier charge is separate; Lingxifield charges SASI orchestration"},
  "sasi-video-generate":{toolId:"sasi-video-generate",billingClass:"SASI_BALANCE",executionMode:"connected_service",reason:"user supplier charge is separate; Lingxifield charges successful SASI output"}
};

export function toolBillingPolicy(toolId:string){return POLICY[toolId]||{toolId,billingClass:"DISABLED" as const,executionMode:"local" as const,reason:"not classified"};}
export function allToolBillingPolicies(){return Object.values(POLICY);}
