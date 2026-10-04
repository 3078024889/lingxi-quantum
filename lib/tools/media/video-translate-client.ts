"use client";
import {fetchFile} from "@ffmpeg/util";
import {createFfmpegRuntime} from "@/lib/tools/media/runtime";

export type TimedText={start:number;end:number;text:string};

export function toSrtTimed(segments:TimedText[]){
 const t=(sec:number)=>{
  const ms=Math.max(0,Math.round(sec*1000)),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),x=ms%1000;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(x).padStart(3,"0")}`;
 };
 return segments.map((x,i)=>`${i+1}\n${t(x.start)} --> ${t(x.end)}\n${x.text}`).join("\n\n");
}
export function toVttTimed(segments:TimedText[]){
 return "WEBVTT\n\n"+toSrtTimed(segments).replace(/,/g,".").replace(/^\d+\n/gm,"");
}

function copyBytes(data:Uint8Array|string){
 const b=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
 const c=new Uint8Array(b.length);c.set(b);return c;
}

export async function concatMp3(blobs:Blob[],onProgress?:(p:number)=>void){
 if(blobs.length===1)return blobs[0];
 const ff=await createFfmpegRuntime(onProgress);
 try{
  const names:string[]=[];
  for(let i=0;i<blobs.length;i++){const n=`part-${i}.mp3`;names.push(n);await ff.writeFile(n,await fetchFile(blobs[i]))}
  const list=names.map(n=>`file '${n}'`).join("\n");
  await ff.writeFile("list.txt",new TextEncoder().encode(list));
  let code=await ff.exec(["-f","concat","-safe","0","-i","list.txt","-c","copy","joined.mp3"]);
  if(code!==0)code=await ff.exec(["-f","concat","-safe","0","-i","list.txt","-c:a","libmp3lame","-b:a","192k","joined.mp3"]);
  if(code!==0)throw new Error(`AUDIO_CONCAT_${code}`);
  const data=copyBytes(await ff.readFile("joined.mp3"));
  return new Blob([data.buffer],{type:"audio/mpeg"});
 }finally{try{ff.terminate()}catch{}}
}

export async function muxTranslatedVideo(input:{
 video:File;
 subtitles:string;
 language:string;
 duration:number;
 dubbedAudio?:Blob|null;
 onProgress?:(p:number)=>void;
}){
 const ff=await createFfmpegRuntime(input.onProgress);
 try{
  const ext=input.video.name.split(".").pop()||"mp4",vin=`video.${ext}`,sin="translated.srt",out="translated.mp4";
  await ff.writeFile(vin,await fetchFile(input.video));
  await ff.writeFile(sin,new TextEncoder().encode(input.subtitles));
  if(input.dubbedAudio){
   await ff.writeFile("dub.mp3",await fetchFile(input.dubbedAudio));
   let code=await ff.exec([
    "-i",vin,"-i","dub.mp3","-i",sin,
    "-map","0:v:0","-map","1:a:0","-map","2:0",
    "-c:v","copy","-c:a","aac","-b:a","192k","-c:s","mov_text",
    "-metadata:s:s:0",`language=${input.language}`,
    "-af","apad","-t",String(Math.max(1,input.duration)),
    "-movflags","+faststart",out
   ]);
   if(code!==0)code=await ff.exec([
    "-i",vin,"-i","dub.mp3","-i",sin,
    "-map","0:v:0","-map","1:a:0","-map","2:0",
    "-c:v","libx264","-preset","veryfast","-crf","20",
    "-c:a","aac","-b:a","192k","-c:s","mov_text",
    "-af","apad","-t",String(Math.max(1,input.duration)),
    "-movflags","+faststart",out
   ]);
   if(code!==0)throw new Error(`VIDEO_TRANSLATE_MUX_${code}`);
  }else{
   let code=await ff.exec([
    "-i",vin,"-i",sin,
    "-map","0:v:0","-map","0:a?","-map","1:0",
    "-c:v","copy","-c:a","copy","-c:s","mov_text",
    "-metadata:s:s:0",`language=${input.language}`,
    "-movflags","+faststart",out
   ]);
   if(code!==0)code=await ff.exec([
    "-i",vin,"-i",sin,
    "-map","0:v:0","-map","0:a?","-map","1:0",
    "-c:v","libx264","-preset","veryfast","-crf","20",
    "-c:a","aac","-b:a","192k","-c:s","mov_text",
    "-movflags","+faststart",out
   ]);
   if(code!==0)throw new Error(`VIDEO_TRANSLATE_MUX_${code}`);
  }
  const data=copyBytes(await ff.readFile(out));
  if(!data.length)throw new Error("VIDEO_TRANSLATE_OUTPUT_EMPTY");
  return new Blob([data.buffer],{type:"video/mp4"});
 }finally{try{ff.terminate()}catch{}}
}
