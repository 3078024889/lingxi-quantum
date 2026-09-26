import type { NativeJobKind } from "./protocol";

export async function readBoundedJson(req: Request): Promise<Record<string,unknown>> {
  const limit=4*1024*1024;
  if(Number(req.headers.get("content-length"))>limit) throw new Error("REQUEST_TOO_LARGE");
  const reader=req.body?.getReader();
  if(!reader) throw new Error("BODY_REQUIRED");
  const parts:Uint8Array[]=[];
  let bytes=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;
      if(bytes>limit){await reader.cancel();throw new Error("REQUEST_TOO_LARGE");}parts.push(value);}
  } finally {reader.releaseLock();}
  const body=JSON.parse(Buffer.concat(parts).toString("utf8"));
  if(!body||typeof body!=="object"||Array.isArray(body)) throw new Error("BODY_INVALID");
  return body;
}

export function normalizeNativeInput(kind:NativeJobKind,value:unknown):Record<string,unknown>{
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("INPUT_REQUIRED");
  const v=value as Record<string,unknown>;
  if(typeof v.prompt!=="string"||!v.prompt.trim()||v.prompt.length>24000)throw new Error("PROMPT_LENGTH");
  const base={prompt:v.prompt.trim()};
  if(kind==="reason"){
    const images=v.images??[];
    if(!Array.isArray(images)||images.length>2||images.some(x=>typeof x!=="string"||x.length>1_398_300||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(x)))throw new Error("IMAGE_INPUT_INVALID");
    return {...base,mode:v.mode==="deep"?"deep":"standard",...(images.length?{images}:{})};
  }
  const ratio=["1:1","16:9","9:16"].includes(String(v.ratio))?String(v.ratio):"16:9";
  if(kind==="video"){
    const durationSec=Number(v.durationSec??5);
    if(!Number.isFinite(durationSec)||durationSec<2||durationSec>10)throw new Error("DURATION_INVALID");
    return {...base,ratio,durationSec};
  }
  return {...base,ratio,steps:4};
}
