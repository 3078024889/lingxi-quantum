import "server-only";
import {r2Ready} from "@/lib/r2-private";
import {nativeComputeReadiness} from "@/lib/sasi-kernel/compute/native-client";

export type ToolRuntimeState={ready:boolean;mode:"local"|"r2"|"compute";reason?:string};

const LOCAL_PAID=new Set([
  "audio-transcription","batch-image-watermark-remover","cross-page-stamp","e-sign-pdf",
  "food-calorie","id-photo-ai","image-watermark-remover","pdf-editor","subtitle-translate",
  "temp-mail-batch","video-dubbing","video-transcription","video-watermark-remover",
]);

const SASI_NATIVE=new Set(["sasi-deep-reason","sasi-image-generate","sasi-video-generate"]);
let liveCache:{until:number;ready:boolean;reason?:string}={until:0,ready:false,reason:"SASI_NATIVE_COMPUTE_NOT_READY"};

function nativeConfigured(){
  const url=process.env.SASI_NATIVE_COMPUTE_URL?.trim()||"";
  const secret=process.env.SASI_NATIVE_COMPUTE_SECRET?.trim()||"";
  return Boolean(url&&secret.length>=32);
}
export function isSasiNativeTool(toolId:string){return SASI_NATIVE.has(toolId)}

export function toolRuntimeState(toolId:string):ToolRuntimeState{
  if(toolId==="video-dubbing")return{ready:false,mode:"local",reason:"DUBBED_VIDEO_EXPORT_NOT_IMPLEMENTED"};
  if(toolId==="sasi-video-generate")return{ready:false,mode:"compute",reason:"VIDEO_BYOK_REQUIRED"};
  if(LOCAL_PAID.has(toolId))return{ready:true,mode:"local"};
  if(toolId==="burn-after-read-file")return r2Ready()?{ready:true,mode:"r2"}:{ready:false,mode:"r2",reason:"PRIVATE_STORAGE_NOT_READY"};
  if(SASI_NATIVE.has(toolId))return nativeConfigured()?{ready:true,mode:"compute"}:{ready:false,mode:"compute",reason:"SASI_NATIVE_COMPUTE_NOT_READY"};
  return{ready:false,mode:"local",reason:"TOOL_RUNTIME_NOT_CLASSIFIED"};
}

export async function toolRuntimeStateLive(toolId:string):Promise<ToolRuntimeState>{
  const base=toolRuntimeState(toolId);
  if(!base.ready||base.mode!=="compute")return base;
  if(Date.now()<liveCache.until)return liveCache.ready?base:{ready:false,mode:"compute",reason:liveCache.reason};
  try{
    const health=await nativeComputeReadiness();
    const state=String((health as Record<string,unknown>)?.state??(health as Record<string,unknown>)?.status??"").toLowerCase();
    const unhealthy=["offline","unhealthy","failed","error","draining"].includes(state);
    liveCache={until:Date.now()+10_000,ready:!unhealthy,reason:unhealthy?"SASI_NATIVE_COMPUTE_UNHEALTHY":undefined};
  }catch(error){
    const reason=error instanceof Error?error.message:"SASI_NATIVE_COMPUTE_UNREACHABLE";
    liveCache={until:Date.now()+5_000,ready:false,reason};
  }
  return liveCache.ready?base:{ready:false,mode:"compute",reason:liveCache.reason||"SASI_NATIVE_COMPUTE_UNAVAILABLE"};
}

export const PAID_TOOL_IDS=[...LOCAL_PAID,"burn-after-read-file",...SASI_NATIVE] as const;
