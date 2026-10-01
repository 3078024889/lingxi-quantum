"use client";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {toBlobURL} from "@ffmpeg/util";

const BASE="/media/ffmpeg-0.12.10";

export type RuntimeProbe={ok:boolean;reason?:string;webgpu:boolean;wasm:boolean};

export async function probeMediaRuntime():Promise<RuntimeProbe>{
 try{
  const [js,wasm]=await Promise.all([
   fetch(`${BASE}/ffmpeg-core.js`,{cache:"force-cache"}),
   fetch(`${BASE}/ffmpeg-core.wasm`,{cache:"force-cache"})
  ]);
  if(!js.ok||!wasm.ok)return{ok:false,reason:"FFMPEG_RUNTIME_MISSING",webgpu:Boolean((navigator as any).gpu),wasm:false};
  const bytes=await wasm.arrayBuffer();
  const valid=WebAssembly.validate(bytes);
  return{ok:valid,reason:valid?undefined:"FFMPEG_WASM_INVALID",webgpu:Boolean((navigator as any).gpu),wasm:valid};
 }catch(e){
  return{ok:false,reason:e instanceof Error?e.message:String(e),webgpu:Boolean((navigator as any).gpu),wasm:false};
 }
}

export async function createFfmpegRuntime(onProgress?:(p:number)=>void){
 const probe=await probeMediaRuntime();
 if(!probe.ok)throw new Error(probe.reason||"FFMPEG_RUNTIME_UNAVAILABLE");
 const ffmpeg=new FFmpeg();
 if(onProgress)ffmpeg.on("progress",({progress})=>onProgress(Math.max(0,Math.min(1,Number(progress)||0))));
 await ffmpeg.load({
  coreURL:await toBlobURL(`${BASE}/ffmpeg-core.js`,"text/javascript"),
  wasmURL:await toBlobURL(`${BASE}/ffmpeg-core.wasm`,"application/wasm")
 });
 return ffmpeg;
}
