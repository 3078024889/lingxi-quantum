import {createFfmpegRuntime} from "@/lib/tools/media/runtime";
import {fetchFile} from "@ffmpeg/util";

export type LocalSegment={start:number;end:number;text:string};
export type LocalTranscript={text:string;segments:LocalSegment[];model:string;backend:string};

/** Only real model timestamps generate downloadable caption cues.
 * Never replace a missing Whisper timestamp with zero or invent a duration. */
export function normalizeAsrSegments(raw:unknown):LocalSegment[]{
 if(!Array.isArray(raw))return [];
 const result:LocalSegment[]=[];
 for(const chunk of raw){
  if(!chunk||typeof chunk!=="object")continue;
  const item=chunk as {timestamp?:unknown;text?:unknown};
  if(!Array.isArray(item.timestamp)||item.timestamp.length<2)continue;
  const [start,end]=item.timestamp;
  if(typeof start!=="number"||typeof end!=="number"||
     !Number.isFinite(start)||!Number.isFinite(end)||
     start<0||end<=start)continue;
  const text=typeof item.text==="string"?item.text.trim():"";
  if(text)result.push({start,end,text});
 }
 return result;
}


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
   const segments=normalizeAsrSegments(result?.chunks);
   const text=String(result?.text||segments.map(x=>x.text).join(" ")).trim();
   if(!text)throw new Error("TRANSCRIPT_EMPTY");
   onProgress?.(1,"识别完成");
   return{text,segments,model:"onnx-community/whisper-tiny",backend:device};
  }catch(e){last=e}
 }
 throw new Error(`LOCAL_ASR_UNAVAILABLE:${last instanceof Error?last.message:String(last||"unknown")}`);
}

function timestamp(seconds:number,separator:","|"."){
 if(!Number.isFinite(seconds)||seconds<0)throw Error("TRANSCRIPT_TIME_INVALID");
 const millis=Math.round(seconds*1000);
 const hours=Math.floor(millis/3600000),minutes=Math.floor(millis%3600000/60000),secs=Math.floor(millis%60000/1000),rest=millis%1000;
 return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}${separator}${String(rest).padStart(3,"0")}`;
}
function captionSegments(segments:LocalSegment[],separator:","|".",withIndex:boolean){
 return segments.map((s,i)=>{
  // Whisper can return an open-ended last chunk. Clamp only its end to a tiny
  // positive duration and retain start; never invent an entire transcript.
  if(!Number.isFinite(s.start)||s.start<0||!Number.isFinite(s.end)||s.end<0)throw Error("TRANSCRIPT_TIME_INVALID");
  const start=s.start,end=Math.max(start+.001,s.end);
  const line=`${timestamp(start,separator)} --> ${timestamp(end,separator)}\n${s.text.replace(/\r\n?/g,"\n").trim()}`;
  return withIndex?`${i+1}\n${line}`:line;
 }).join("\n\n");
}
export function toSrt(segments:LocalSegment[]){
 return captionSegments(segments,",",true);
}
export function toVtt(segments:LocalSegment[]){
 const cues=captionSegments(segments,".",false);
 return "WEBVTT\n\n"+cues;
}
