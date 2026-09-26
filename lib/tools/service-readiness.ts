import "server-only";
import {r2Ready} from "@/lib/r2-private";

export type ToolRuntimeState={ready:boolean;mode:"local"|"r2"|"compute";reason?:string};

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

const SASI_NATIVE=new Set(["sasi-deep-reason","sasi-image-generate","sasi-video-generate"]);

function nativeReady(){
  const url=process.env.SASI_NATIVE_COMPUTE_URL?.trim()||"";
  const secret=process.env.SASI_NATIVE_COMPUTE_SECRET?.trim()||"";
  return Boolean(url&&secret.length>=32);
}

export function toolRuntimeState(toolId:string):ToolRuntimeState{
  if(LOCAL_PAID.has(toolId))return{ready:true,mode:"local"};
  if(toolId==="burn-after-read-file"){
    return r2Ready()?{ready:true,mode:"r2"}:{ready:false,mode:"r2",reason:"PRIVATE_STORAGE_NOT_READY"};
  }
  if(SASI_NATIVE.has(toolId)){
    return nativeReady()
      ?{ready:true,mode:"compute"}
      :{ready:false,mode:"compute",reason:"SASI_NATIVE_COMPUTE_NOT_READY"};
  }
  return{ready:false,mode:"local",reason:"TOOL_RUNTIME_NOT_CLASSIFIED"};
}

export const PAID_TOOL_IDS=[...LOCAL_PAID,"burn-after-read-file",...SASI_NATIVE] as const;
