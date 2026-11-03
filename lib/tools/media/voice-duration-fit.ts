"use client";
import {fetchFile} from "@ffmpeg/util";
import {createFfmpegRuntime} from "@/lib/tools/media/runtime";
import {localMediaDuration} from "@/lib/tools/autonomous/transcribe-local";
import {planVoiceDurationFit} from "@/lib/tools/media/voice-duration-plan";

/** Fit total synthesized voice to measured video duration without cropping words.
 * Shorter voice is padded by the downstream MP4 mux; moderate excess voice is
 * accelerated with FFmpeg atempo and then physically duration-checked.
 */
export async function fitVoiceDurationToVideo(voice:Blob,videoSeconds:number):Promise<Blob>{
 if(!voice.size||voice.size>256*1024*1024)throw Error("DUB_AUDIO_INVALID");
 const original=new File([voice],"voice.mp3",{type:"audio/mpeg"});
 const measured=await localMediaDuration(original);
 const plan=planVoiceDurationFit(measured,videoSeconds);
 if(!plan.needsFit)return voice;
 const ff=await createFfmpegRuntime();
 try{
  await ff.writeFile("source.mp3",await fetchFile(original));
  const status=await ff.exec(["-i","source.mp3","-vn","-af",plan.filter,
   "-t",String(videoSeconds),"-ar","44100","-c:a","libmp3lame","-b:a","160k","fit.mp3"]);
  if(status!==0)throw Error("DUB_AUDIO_FIT_FAILED");
  const data=await ff.readFile("fit.mp3");
  const source=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));
  const copied=new Uint8Array(source.byteLength);copied.set(source);
  if(copied.length<256)throw Error("DUB_AUDIO_FIT_EMPTY");
  const ready=new Blob([copied.buffer],{type:"audio/mpeg"});
  const fitted=await localMediaDuration(new File([ready],"fit.mp3",{type:"audio/mpeg"}));
  if(!Number.isFinite(fitted)||Math.abs(fitted-videoSeconds)>.25)
   throw Error("DUB_AUDIO_FIT_DURATION_MISMATCH");
  return ready;
 }finally{try{ff.terminate()}catch{}}
}
