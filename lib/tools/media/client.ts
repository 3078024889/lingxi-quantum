"use client";
import{fetchFile}from"@ffmpeg/util";
import{createFfmpegRuntime}from"./runtime";

export async function extractCompactAudio(file:File,onProgress?:(p:number)=>void){
 const ff=await createFfmpegRuntime(onProgress);
 try{
  const ext=file.name.split(".").pop()||"bin",input=`input.${ext}`,output="speech.mp3";
  await ff.writeFile(input,await fetchFile(file));
  const code=await ff.exec(["-i",input,"-vn","-ac","1","-ar","16000","-b:a","32k",output]);
  if(code!==0)throw new Error(`AUDIO_EXTRACT_${code}`);
  const data=await ff.readFile(output),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
  const copy=new Uint8Array(bytes.byteLength);copy.set(bytes);
  return new File([copy.buffer],"speech.mp3",{type:"audio/mpeg"});
 }finally{try{ff.terminate()}catch{}}
}


// Guard final delivery against FFmpeg successfully producing only a short prefix.
// Browser media metadata is available without additional decoders or network upload.
function browserMediaDuration(blob:Blob):Promise<number>{
 return new Promise((resolve,reject)=>{
  const video=document.createElement("video"),url=URL.createObjectURL(blob);
  let settled=false;
  const finish=(duration?:number,error?:Error)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   video.onloadedmetadata=null;video.onerror=null;video.removeAttribute("src");video.load();
   URL.revokeObjectURL(url);
   if(error)reject(error);else resolve(duration!);
  };
  const timer=setTimeout(()=>finish(undefined,new Error("MEDIA_PROBE_TIMEOUT")),20000);
  video.preload="metadata";
  video.onloadedmetadata=()=>{
   const value=video.duration;
   Number.isFinite(value)&&value>0?finish(value):finish(undefined,new Error("MEDIA_PROBE_INVALID_DURATION"));
  };
  video.onerror=()=>finish(undefined,new Error("MEDIA_PROBE_FAILED"));
  video.src=url;
 });
}

export async function muxDubbedVideo(video:File,audio:Blob,onProgress?:(p:number)=>void){
 const ff=await createFfmpegRuntime(onProgress);
 try{
  const ext=video.name.split(".").pop()||"mp4",vin=`video.${ext}`,ain="dub.mp3",out="dubbed.mp4";
  await ff.writeFile(vin,await fetchFile(video));await ff.writeFile(ain,await fetchFile(audio));
  let code=await ff.exec(["-i",vin,"-i",ain,"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-af","apad","-shortest",out]);
  if(code!==0){
   code=await ff.exec(["-i",vin,"-i",ain,"-map","0:v:0","-map","1:a:0","-c:v","libx264","-preset","veryfast","-crf","22","-c:a","aac","-af","apad","-shortest",out]);
  }
  if(code!==0)throw new Error(`DUB_MUX_${code}`);
  const data=await ff.readFile(out),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
  const copy=new Uint8Array(bytes.length);copy.set(bytes);
  if(copy.byteLength<1024)throw new Error("DUB_OUTPUT_EMPTY");
  const result=new Blob([copy.buffer],{type:"video/mp4"});
  const outputDuration=await browserMediaDuration(result);
  if(Math.abs(originalDuration-outputDuration)>Math.max(0.4,originalDuration*.04))throw new Error("DUB_OUTPUT_DURATION_MISMATCH");
  return result;
 }finally{try{ff.terminate()}catch{}}
}
