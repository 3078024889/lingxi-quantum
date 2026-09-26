
export type LocalSegment={start:number;end:number;text:string};
export type LocalTranscript={text:string;segments:LocalSegment[];model:string};

let cached:any=null;
async function decodeWithAudioContext(file:File){
 const ctx=new AudioContext();try{
  const buf=await ctx.decodeAudioData(await file.arrayBuffer());
  const offline=new OfflineAudioContext(1,Math.ceil(buf.duration*16000),16000);
  const src=offline.createBufferSource();src.buffer=buf;src.connect(offline.destination);src.start();
  const rendered=await offline.startRendering();return new Float32Array(rendered.getChannelData(0));
 }finally{await ctx.close()}
}
async function extractVideoAudio(file:File){
 const [{FFmpeg},{fetchFile,toBlobURL}]=await Promise.all([import("@ffmpeg/ffmpeg"),import("@ffmpeg/util")]);
 const ffmpeg=new FFmpeg();
 const base="/media/ffmpeg-0.12.10";
 await ffmpeg.load({coreURL:await toBlobURL(`${base}/ffmpeg-core.js`,"text/javascript"),wasmURL:await toBlobURL(`${base}/ffmpeg-core.wasm`,"application/wasm")});
 const ext=file.name.split(".").pop()||"bin";const input=`input.${ext}`;await ffmpeg.writeFile(input,await fetchFile(file));
 await ffmpeg.exec(["-i",input,"-vn","-ac","1","-ar","16000","-f","wav","audio.wav"]);
 const data=await ffmpeg.readFile("audio.wav");ffmpeg.terminate();
 const wav=new Blob([data as Uint8Array],{type:"audio/wav"});return await decodeWithAudioContext(new File([wav],"audio.wav",{type:"audio/wav"}));
}
async function audio(file:File){
 try{return await decodeWithAudioContext(file)}catch(e){if(file.type.startsWith("video/"))return await extractVideoAudio(file);throw e}
}
export async function localMediaDuration(file:File){
 return await new Promise<number>((resolve,reject)=>{
  const el=document.createElement(file.type.startsWith("video/")?"video":"audio");const u=URL.createObjectURL(file);
  el.preload="metadata";el.onloadedmetadata=()=>{const d=Number(el.duration);URL.revokeObjectURL(u);resolve(Number.isFinite(d)?d:0)};
  el.onerror=()=>{URL.revokeObjectURL(u);reject(new Error("MEDIA_METADATA_FAILED"))};el.src=u;
 });
}
export async function transcribeLocal(file:File,onProgress?:(p:number,msg:string)=>void):Promise<LocalTranscript>{
 const pcm=await audio(file);onProgress?.(.15,"正在准备本地语音识别…");
 const browserModuleUrl="/vendor/transformers/transformers.web.js";
 const mod:any=await import(/* webpackIgnore: true */ browserModuleUrl);
 mod.env.allowLocalModels=true;
 mod.env.allowRemoteModels=false;
 mod.env.localModelPath="/models/";
 mod.env.useBrowserCache=true;
 if(mod.env.backends?.onnx?.wasm)mod.env.backends.onnx.wasm.wasmPaths="/onnxruntime/";
 if(!cached){
  cached=await mod.pipeline("automatic-speech-recognition","onnx-community/whisper-tiny",{device:"wasm",dtype:"q8",progress_callback:(x:any)=>{if(typeof x?.progress==="number")onProgress?.(.15+.35*(x.progress/100),"首次使用正在准备识别模型…")}});
 }
 onProgress?.(.55,"正在识别语音…");
 const result:any=await cached(pcm,{chunk_length_s:30,stride_length_s:5,return_timestamps:true});
 const chunks=Array.isArray(result?.chunks)?result.chunks:[];
 const segments:LocalSegment[]=chunks.map((c:any)=>({start:Number(c?.timestamp?.[0]||0),end:Number(c?.timestamp?.[1]||c?.timestamp?.[0]||0),text:String(c?.text||"").trim()})).filter((x:LocalSegment)=>x.text);
 onProgress?.(1,"识别完成");
 return{text:String(result?.text||segments.map(x=>x.text).join(" ")).trim(),segments,model:"whisper-tiny-local"};
}
export function toSrt(segments:LocalSegment[]){
 const t=(sec:number)=>{const ms=Math.max(0,Math.round(sec*1000)),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),x=ms%1000;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(x).padStart(3,"0")}`};
 return segments.map((x,i)=>`${i+1}\n${t(x.start)} --> ${t(x.end)}\n${x.text}`).join("\n\n");
}
export function toVtt(segments:LocalSegment[]){return"WEBVTT\n\n"+toSrt(segments).replace(/,/g,".").replace(/^\d+\n/gm,"")}
