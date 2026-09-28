import "server-only";
import {mkdtemp,writeFile,readdir,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {commandFor,runCommand} from "@/lib/tools/engine/server/command";
import {inspectImageBytes,inspectVideoBytes} from "./technical";
import {judgeVisual,visualSemanticJudgeReady} from "./semantic-judge";
import {visualQualityGate} from "@/lib/sasi-v5/quality";
import type {SasiV5QualityTier,SasiV5QualityVector} from "@/lib/sasi-v5/types";

function dataUrl(bytes:Uint8Array,mime:string){return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`}
function technicalVector(score:number):SasiV5QualityVector{
 const s=Math.max(0,Math.min(1,score));
 return{overall:s,instruction:s,reliability:s,continuity:s,identity:s,typography:s,motion:s,physics:s};
}

export async function validateImageDelivery(bytes:Uint8Array,input:{instruction:string;tier:SasiV5QualityTier;textCritical?:boolean;identityCritical?:boolean}){
 const technical=await inspectImageBytes(bytes);
 let vector=technicalVector(technical.technicalScore),semantic:any=null;
 if(visualSemanticJudgeReady()){
   semantic=await judgeVisual({kind:"image",instruction:input.instruction,imageDataUrls:[dataUrl(bytes,"image/png")],identityCritical:input.identityCritical,typographyCritical:input.textCritical});
   vector=semantic.vector;
 }else if(input.tier==="premium"){
   return{pass:false,reasons:["PREMIUM_SEMANTIC_JUDGE_UNAVAILABLE"],technical,semantic:null,quality:vector};
 }
 const gate=visualQualityGate({tier:input.tier,vector,textCritical:input.textCritical,identityCritical:input.identityCritical});
 return{...gate,technical,semantic};
}

async function sampleVideoFrames(bytes:Uint8Array){
 const dir=await mkdtemp(join(tmpdir(),"sasi-v5-frames-")),input=join(dir,"input.mp4"),pattern=join(dir,"frame-%02d.jpg");
 try{
   await writeFile(input,bytes);
   await runCommand(commandFor("LINGXI_FFMPEG_BIN","ffmpeg"),["-y","-i",input,"-vf","fps=1","-frames:v","6","-q:v","3",pattern],{timeoutMs:45_000,maxOutputBytes:512*1024});
   const names=(await readdir(dir)).filter(x=>/^frame-\d+\.jpg$/.test(x)).sort().slice(0,6);
   const frames=[] as string[];
   for(const name of names)frames.push(dataUrl(await readFile(join(dir,name)),"image/jpeg"));
   return frames;
 }finally{await rm(dir,{recursive:true,force:true}).catch(()=>{})}
}

export async function validateVideoDelivery(bytes:Uint8Array,input:{instruction:string;tier:SasiV5QualityTier;identityCritical?:boolean}){
 const technical=await inspectVideoBytes(bytes);
 let vector=technicalVector(technical.technicalScore),semantic:any=null;
 if(technical.reasons.includes("VIDEO_STREAM_MISSING")||technical.reasons.includes("VIDEO_DURATION_INVALID")){
   return{pass:false,reasons:technical.reasons,technical,semantic:null,quality:vector};
 }
 if(visualSemanticJudgeReady()){
   const frames=await sampleVideoFrames(bytes);
   if(frames.length<2)return{pass:false,reasons:["VIDEO_FRAME_SAMPLE_FAILED"],technical,semantic:null,quality:vector};
   semantic=await judgeVisual({kind:"video",instruction:input.instruction,imageDataUrls:frames,identityCritical:input.identityCritical,motionCritical:true});
   vector=semantic.vector;
 }else if(input.tier==="premium"){
   return{pass:false,reasons:["PREMIUM_SEMANTIC_JUDGE_UNAVAILABLE"],technical,semantic:null,quality:vector};
 }
 const gate=visualQualityGate({tier:input.tier,vector,identityCritical:input.identityCritical,motionCritical:true});
 return{...gate,technical,semantic};
}
