import "server-only";
import {r2Ready} from "@/lib/r2-private";

export type ToolRuntimeState={
  ready:boolean;
  mode:"local"|"r2";
  reason?:string;
};

/**
 * Paid-tool availability is independent from external AI-provider keys.
 * These tools run through LINGXIFIELD local/browser/self-hosted engines.
 */
const LOCAL_PAID=new Set([
  "audio-transcription",
  "batch-image-watermark-remover",
  "cross-page-stamp",
  "e-sign-pdf",
  "food-calorie",
  "id-photo-ai",
  "image-watermark-remover",
  "pdf-editor",
  "subtitle-translate",
  "temp-mail-batch",
  "video-dubbing",
  "video-transcription",
  "video-watermark-remover",
]);

export function toolRuntimeState(toolId:string):ToolRuntimeState{
  if(LOCAL_PAID.has(toolId))return {ready:true,mode:"local"};

  if(toolId==="burn-after-read-file"){
    return r2Ready()
      ? {ready:true,mode:"r2"}
      : {ready:false,mode:"r2",reason:"PRIVATE_STORAGE_NOT_READY"};
  }

  return {ready:false,mode:"local",reason:"TOOL_RUNTIME_NOT_CLASSIFIED"};
}

export const PAID_TOOL_IDS=[
  "audio-transcription",
  "batch-image-watermark-remover",
  "burn-after-read-file",
  "cross-page-stamp",
  "e-sign-pdf",
  "food-calorie",
  "id-photo-ai",
  "image-watermark-remover",
  "pdf-editor",
  "subtitle-translate",
  "temp-mail-batch",
  "video-dubbing",
  "video-transcription",
  "video-watermark-remover",
] as const;
