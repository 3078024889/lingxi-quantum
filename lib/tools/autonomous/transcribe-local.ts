import {createFfmpegRuntime} from "@/lib/tools/media/runtime";
import {fetchFile} from "@ffmpeg/util";

export type LocalSegment={start:number;end:number;text:string};
export type LocalTranscript={text:string;segments:LocalSegment[];model:string;backend:string};

let wasmPipe:any=null;
let gpuPipe:any=null;

async function decodeWithAudioContext(file:File){
 const ctx=new AudioContext();
 try{
  const buf=await ctx.decodeAudioData(await file.arrayBuffer());
  const offline=new OfflineAudioContext(1,Math.ceil(buf.duration*16000),16000);
  const src=offline.createBufferSource();src.buffer=buf;src.connect(offline.destination);src.start();
  const rendered=await offline.startRendering();
  return new Float32Array(rendered.getChannelData(0));
 }finally{await ctx.close()}
}

async function extractVideoAudio(file:File){
 const ffmpeg=await createFfmpegRuntime();
 try{
  const ext=file.name.split(".").pop()||"bin",input=`input.${ext}`,output="audio.wav";
  await ffmpeg.writeFile(input,await fetchFile(file));
  const code=await ffmpeg.exec(["-i",input,"-vn","-ac","1","-ar","16000","-f","wav",output]);
  if(code!==0)throw new Error(`FFMPEG_AUDIO_EXTRACT_${code}`);
  const data=await ffmpeg.readFile(output);
  const bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
  const copy=new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return await decodeWithAudioContext(new File([copy.buffer],"audio.wav",{type:"audio/wav"}));
 }finally{try{ffmpeg.terminate()}catch{}}
}

async function audio(file:File){
 try{return await decodeWithAudioContext(file)}
 catch(e){if(file.type.startsWith("video/"))return await extractVideoAudio(file);throw e}
}

export async function localMediaDuration(file:File){
 return await new Promise<number>((resolve,reject)=>{
  const el=document.createElement(file.type.startsWith("video/")?"video":"audio"),u=URL.createObjectURL(file);
  const done=()=>{URL.revokeObjectURL(u);el.removeAttribute("src")};
  el.preload="metadata";
  el.onloadedmetadata=()=>{const d=Number(el.duration);done();resolve(Number.isFinite(d)?d:0)};
  el.onerror=()=>{done();reject(new Error("MEDIA_METADATA_FAILED"))};
  el.src=u;
 });
}

async function pipelineFor(device:"webgpu"|"wasm",onProgress?:(p:number,msg:string)=>void){
 const mod:any=await import("@huggingface/transformers");
 mod.env.allowLocalModels=true;
 mod.env.allowRemoteModels=true;
 mod.env.localModelPath="/models/";
 mod.env.useBrowserCache=true;
 const cached=device==="webgpu"?gpuPipe:wasmPipe;
 if(cached)return cached;
 const pipe=await mod.pipeline(
  "automatic-speech-recognition",
  "onnx-community/whisper-tiny",
  {device,progress_callback:(x:any)=>{
   if(typeof x?.progress==="number")onProgress?.(Math.max(0,Math.min(1,x.progress/100)),"正在准备语音识别能力…");
  }}
 );
 if(device==="webgpu")gpuPipe=pipe;else wasmPipe=pipe;
 return pipe;
}

export async function transcribeLocal(file:File,onProgress?:(p:number,msg:string)=>void):Promise<LocalTranscript>{
 const pcm=await audio(file);
 onProgress?.(.08,"正在准备语音识别…");
 const preferred:(("webgpu"|"wasm"))[]=Boolean((navigator as any).gpu)?["webgpu","wasm"]:["wasm"];
 let last:unknown=null;
 for(const device of preferred){
  try{
   const pipe=await pipelineFor(device,(p,m)=>onProgress?.(.08+.32*p,m));
   onProgress?.(.45,device==="webgpu"?"正在使用图形加速识别…":"正在使用兼容模式识别…");
   const result:any=await pipe(pcm,{chunk_length_s:30,stride_length_s:5,return_timestamps:true});
   const chunks=Array.isArray(result?.chunks)?result.chunks:[];
   const segments:LocalSegment[]=chunks.map((c:any)=>({
    start:Number(c?.timestamp?.[0]||0),
    end:Number(c?.timestamp?.[1]||c?.timestamp?.[0]||0),
    text:String(c?.text||"").trim()
   })).filter((x:LocalSegment)=>x.text);
   const text=String(result?.text||segments.map(x=>x.text).join(" ")).trim();
   if(!text)throw new Error("TRANSCRIPT_EMPTY");
   onProgress?.(1,"识别完成");
   return{text,segments,model:"onnx-community/whisper-tiny",backend:device};
  }catch(e){last=e}
 }
 throw new Error(`LOCAL_ASR_UNAVAILABLE:${last instanceof Error?last.message:String(last||"unknown")}`);
}

export function toSrt(segments:LocalSegment[]){
 const t=(sec:number)=>{const ms=Math.max(0,Math.round(sec*1000)),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),x=ms%1000;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(x).padStart(3,"0")}`};
 return segments.map((x,i)=>`${i+1}\n${t(x.start)} --> ${t(x.end)}\n${x.text}`).join("\n\n");
}
export function toVtt(segments:LocalSegment[]){return"WEBVTT\n\n"+toSrt(segments).replace(/,/g,".").replace(/^\d+\n/gm,"")}
