import "server-only";
import type {ChargingClass,ExecutionMode} from "./policy";
export type ToolBillingPolicy={toolId:string;chargingClass:ChargingClass;executionMode:ExecutionMode;reason:string};
const POLICY:Record<string,ToolBillingPolicy>={
 "audio-transcription":{toolId:"audio-transcription",chargingClass:"HYBRID",executionMode:"local",reason:"local transcription path exists; external enhancement must quote separately"},
 "batch-image-watermark-remover":{toolId:"batch-image-watermark-remover",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"local canvas processing"},
 "burn-after-read-file":{toolId:"burn-after-read-file",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"platform storage workflow without paid generative supplier"},
 "cross-page-stamp":{toolId:"cross-page-stamp",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"deterministic PDF processing"},
 "e-sign-pdf":{toolId:"e-sign-pdf",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"deterministic PDF signing workflow"},
 "food-calorie":{toolId:"food-calorie",chargingClass:"HYBRID",executionMode:"local",reason:"local/basic nutrition path; paid recognition only when a real external cost is used"},
 "id-photo-ai":{toolId:"id-photo-ai",chargingClass:"DISABLED_UNVERIFIED",executionMode:"local",reason:"current implementation is not verified portrait matting quality"},
 "image-watermark-remover":{toolId:"image-watermark-remover",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"current basic interpolation path is local"},
 "pdf-editor":{toolId:"pdf-editor",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"deterministic PDF editing"},
 "subtitle-translate":{toolId:"subtitle-translate",chargingClass:"HYBRID",executionMode:"local",reason:"timeline processing is local; semantic translation may incur supplier cost"},
 "temp-mail-batch":{toolId:"temp-mail-batch",chargingClass:"HYBRID",executionMode:"managed",reason:"infrastructure cost must be quoted from real cost book"},
 "video-dubbing":{toolId:"video-dubbing",chargingClass:"DISABLED_UNVERIFIED",executionMode:"managed",reason:"full dubbed media export chain not verified"},
 "video-transcription":{toolId:"video-transcription",chargingClass:"HYBRID",executionMode:"local",reason:"local ASR path exists; managed enhancement must quote separately"},
 "video-watermark-remover":{toolId:"video-watermark-remover",chargingClass:"FREE_LOCAL",executionMode:"local",reason:"FFmpeg/local processing"},
 "sasi-deep-reason":{toolId:"sasi-deep-reason",chargingClass:"HYBRID",executionMode:"local",reason:"native reasoning first; managed semantic enhancement quoted only when used"},
 "sasi-image-generate":{toolId:"sasi-image-generate",chargingClass:"HYBRID",executionMode:"managed",reason:"managed generation requires real supplier cost and independent currency quote"},
 "sasi-video-generate":{toolId:"sasi-video-generate",chargingClass:"HYBRID",executionMode:"managed",reason:"managed generation requires real supplier cost and independent currency quote"}
};
export function toolBillingPolicy(toolId:string){return POLICY[toolId]||{toolId,chargingClass:"DISABLED_UNVERIFIED" as const,executionMode:"local" as const,reason:"not classified"};}
export function allToolBillingPolicies(){return Object.values(POLICY);}
