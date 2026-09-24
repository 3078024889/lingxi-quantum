import "server-only";

export type ToolRuntimeState={
  ready:boolean;
  mode:"local"|"qwen-vl"|"openai"|"elevenlabs";
  reason?:string;
};

const LOCAL=new Set([
  "video-watermark-remover","pdf-editor","e-sign-pdf","cross-page-stamp",
  "temp-mail-batch",
]);
const OPENAI=new Set(["id-photo-ai","image-watermark-remover","batch-image-watermark-remover","audio-transcription","video-transcription","subtitle-translate"]);

function has(name:string){return Boolean(process.env[name]?.trim())}

export function toolRuntimeState(toolId:string):ToolRuntimeState{
  if(LOCAL.has(toolId))return {ready:true,mode:"local"};
  if(toolId==="food-calorie"){
    return has("DASHSCOPE_API_KEY")
      ? {ready:true,mode:"qwen-vl"}
      : {ready:false,mode:"qwen-vl",reason:"DASHSCOPE_API_KEY_MISSING"};
  }
  if(OPENAI.has(toolId)){
    return has("OPENAI_API_KEY")
      ? {ready:true,mode:"openai"}
      : {ready:false,mode:"openai",reason:"PROVIDER_NOT_CONFIGURED"};
  }
  if(toolId==="video-dubbing"){
    return has("ELEVENLABS_API_KEY")
      ? {ready:true,mode:"elevenlabs"}
      : {ready:false,mode:"elevenlabs",reason:"PROVIDER_NOT_CONFIGURED"};
  }
  return {ready:false,mode:"local",reason:"TOOL_RUNTIME_NOT_CLASSIFIED"};
}

export const PAID_TOOL_IDS=[
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
] as const;
