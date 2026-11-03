#!/usr/bin/env node
// MANUAL-ONLY genuine staging proof. Three small provider requests maximum.
// No user data, no production merchant, no payment grant, no R2 operations.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {spawnSync} from "node:child_process";

const REQUIRED_ACK="I_APPROVE_THREE_SMALL_STAGING_REQUESTS";
function invariant(ok,message){if(!ok)throw Error(message)}
const apiKey=(process.env.MEDIA_STAGING_AI_KEY||"").trim();
const base=(process.env.MEDIA_STAGING_AI_BASE_URL||"https://api.openai.com/v1").replace(/\/+$/,"");
invariant(process.env.MEDIA_STAGING_COST_ACK===REQUIRED_ACK,"STAGING_COST_APPROVAL_REQUIRED");
invariant(apiKey.length>10,"INDEPENDENT_STAGING_API_KEY_REQUIRED");
const u=new URL(base);
invariant(u.protocol==="https:","STAGING_TLS_REQUIRED");
invariant(u.hostname==="api.openai.com"||
 process.env.MEDIA_STAGING_HOST_ACK===u.hostname,"UNAPPROVED_MEDIA_PROVIDER_HOST");
const out=path.resolve("test-results/media-provider-staging");
await fs.mkdir(out,{recursive:true});
const temp=await fs.mkdtemp(path.join(os.tmpdir(),"lingxi-media-staging-"));
const started=Date.now(),operations=[];
function exec(cmd,args){
 const r=spawnSync(cmd,args,{encoding:"utf8",timeout:45000});
 invariant(r.status===0,cmd+"_FAILED:"+String(r.stderr||"").slice(-400));
 return String(r.stdout||"").trim();
}
async function request(endpoint,init){
 invariant(operations.length<3,"PROVIDER_REQUEST_BUDGET_EXCEEDED");
 operations.push(endpoint);
 const response=await fetch(base+endpoint,{
  method:"POST",headers:{authorization:"Bearer "+apiKey,...(init.headers||{})},
  body:init.body,signal:AbortSignal.timeout(45000)
 });
 // Do not store response/error bodies containing private credentials or prompts.
 invariant(response.ok,"MEDIA_PROVIDER_HTTP_"+response.status+"_AT_"+endpoint.replace(/\W+/g,"_"));
 return response;
}
try{
 const transcriptInput="This is a small staging test. We verify real speech recognition.";
 const src=path.join(temp,"asr-source.wav");
 exec("espeak-ng",["-s","135","-w",src,transcriptInput]);
 const sourceWav=await fs.readFile(src);
 invariant(sourceWav.length>1000,"ASR_SOURCE_INVALID");
 const form=new FormData();
 form.set("model",process.env.MEDIA_STAGING_ASR_MODEL||"gpt-transcribe");
 form.set("file",new File([sourceWav],"sample.wav",{type:"audio/wav"}));
 form.set("response_format","json");
 const recognized=await (await request("/audio/transcriptions",{body:form})).json();
 const genuineText=String(recognized.text||"").trim();
 invariant(genuineText.length>5,"REAL_ASR_EMPTY");
 const translated=await (await request("/chat/completions",{
  headers:{"content-type":"application/json"},
  body:JSON.stringify({
   model:process.env.MEDIA_STAGING_TRANSLATE_MODEL||"gpt-5-mini",
   messages:[
    {role:"system",content:"Translate faithfully from English to French. Return only French text."},
    {role:"user",content:"Hello world. This is a test."}
   ]
  })
 })).json();
 const french=String(translated?.choices?.[0]?.message?.content||"").trim();
 invariant(french.length>5&&french.length<1000,"REAL_TRANSLATE_MALFORMED");
 const ttsText="This is a real staging voice verification.";
 const speech=await request("/audio/speech",{
  headers:{"content-type":"application/json"},
  body:JSON.stringify({
   model:process.env.MEDIA_STAGING_TTS_MODEL||"gpt-4o-mini-tts",
   voice:"marin",input:ttsText,response_format:"mp3",
   instructions:"Speak clearly and naturally in English."
  })
 });
 const bytes=Buffer.from(await speech.arrayBuffer());
 invariant(bytes.length>1500&&bytes.length<10*1024*1024,"REAL_TTS_BINARY_INVALID");
 const audio=path.join(out,"provider-voice.mp3");
 await fs.writeFile(audio,bytes);
 const seconds=Number(exec("ffprobe",["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",audio]));
 invariant(Number.isFinite(seconds)&&seconds>.3&&seconds<90,"REAL_TTS_DURATION_INVALID");
 // Use actual generated TTS audio, not a fake audio stream.
 const secondsVideo=Number(Math.max(2.5,seconds+.3).toFixed(3));
 const video=path.join(out,"provider-narration.mp4");
 exec("ffmpeg",["-hide_banner","-loglevel","error","-y",
  "-f","lavfi","-i","color=c=blue:s=320x180:r=15:d="+secondsVideo,
  "-i",audio,"-map","0:v:0","-map","1:a:0","-c:v","libx264","-pix_fmt","yuv420p",
  "-c:a","aac","-af","apad","-t",String(secondsVideo),"-movflags","+faststart",video]);
 const streams=JSON.parse(exec("ffprobe",["-v","error","-show_entries","stream=codec_type","-of","json",video])).streams||[];
 invariant(streams.some(s=>s.codec_type==="video")&&streams.some(s=>s.codec_type==="audio"),"REAL_MP4_MISSING_AUDIO_OR_VIDEO");
 const summary={
  proof:"LIVE_STAGING_PROVIDER_TO_MP4",source:"real provider, synthetic speech test only",
  apiCallCount:operations.length,operations,
  asrNonempty:Boolean(genuineText),translationNonempty:Boolean(french),
  ttsBytes:bytes.length,ttsSeconds:seconds,mp4AudioAndVideo:true,
  payment:"NOT_TESTED",quoteGrant:"NOT_TESTED",userFiles:"NONE",r2:"NOT_TESTED",
  durationMs:Date.now()-started
 };
 await fs.writeFile(path.join(out,"proof.json"),JSON.stringify(summary,null,2)+"\n");
 console.log("STAGING_REAL_MEDIA_PROVIDER_PROOF=PASS: genuine ASR, translation, TTS, encoded MP3 and muxed MP4; no merchant payment, user file or R2 operation");
}catch(e){
 console.error("STAGING_REAL_MEDIA_PROVIDER_PROOF=FAILED:"+String(e.message||e).slice(0,240));
 process.exitCode=1;
}finally{await fs.rm(temp,{recursive:true,force:true})}
