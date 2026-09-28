"use client";

import {COMMON_FOOD_CANDIDATES} from "./common-food-vocabulary";

export type FoodVisionPrediction={label:string;score:number;source:"food101"|"clip-zero-shot"};

let food101Promise:Promise<any>|null=null;
let clipPromise:Promise<any>|null=null;
let clipAvailable:Promise<boolean>|null=null;

function toDataUrl(file:File){
 return new Promise<string>((resolve,reject)=>{
  const r=new FileReader();
  r.onload=()=>resolve(String(r.result||""));
  r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));
  r.readAsDataURL(file);
 });
}

async function runtime(){
 const moduleUrl="/vendor/transformers/transformers.web.js";
 const m:any=await import(/* webpackIgnore: true */ moduleUrl);
 if(!m?.env||!m?.pipeline)throw new Error("VISION_RUNTIME_UNAVAILABLE");
 m.env.allowRemoteModels=false;
 m.env.allowLocalModels=true;
 m.env.localModelPath="/models/";
 if(m.env.backends?.onnx?.wasm)m.env.backends.onnx.wasm.wasmPaths="/onnxruntime/";
 return m;
}

async function food101(){
 if(food101Promise)return food101Promise;
 food101Promise=(async()=>{
  const m=await runtime();
  return m.pipeline("image-classification","onnx-community/swin-finetuned-food101-ONNX",{dtype:"q4f16",device:"wasm"});
 })().catch(error=>{food101Promise=null;throw error});
 return food101Promise;
}

async function hasClip(){
 if(clipAvailable)return clipAvailable;
 clipAvailable=fetch("/models/Xenova/clip-vit-base-patch32/lingxifield-manifest.json",{cache:"force-cache"})
  .then(async r=>r.ok&&Boolean((await r.json().catch(()=>null))?.installed))
  .catch(()=>false);
 return clipAvailable;
}

async function clip(){
 if(clipPromise)return clipPromise;
 clipPromise=(async()=>{
  if(!await hasClip())throw new Error("CLIP_NOT_INSTALLED");
  const m=await runtime();
  return m.pipeline("zero-shot-image-classification","Xenova/clip-vit-base-patch32",{dtype:"q4f16",device:"wasm"});
 })().catch(error=>{clipPromise=null;throw error});
 return clipPromise;
}

function normalize(raw:any[],source:FoodVisionPrediction["source"]){
 return (Array.isArray(raw)?raw:[]).map((x:any)=>({
  label:String(x.label||"").replaceAll("_"," ").trim().toLowerCase(),
  score:Number(x.score||0),
  source,
 })).filter((x:FoodVisionPrediction)=>x.label&&Number.isFinite(x.score)&&x.score>0);
}

function merge(a:FoodVisionPrediction[],b:FoodVisionPrediction[]){
 const map=new Map<string,FoodVisionPrediction>();
 for(const p of [...b,...a]){
  const current=map.get(p.label);
  if(!current||p.score>current.score)map.set(p.label,p);
 }
 return [...map.values()].sort((x,y)=>y.score-x.score).slice(0,8);
}

export async function recognizeFoodImage(file:File):Promise<FoodVisionPrediction[]>{
 if(!file.type.startsWith("image/"))throw new Error("IMAGE_REQUIRED");
 if(file.size>15*1024*1024)throw new Error("IMAGE_TOO_LARGE");
 const input=await toDataUrl(file);
 const basePipe=await food101();
 const base=normalize(await basePipe(input,{top_k:5}),"food101");

 // Food-101 is intentionally narrow. When the optional local CLIP pack is installed,
 // run broad zero-shot candidates as a second independent signal. No remote model calls.
 let broad:FoodVisionPrediction[]=[];
 if(await hasClip()){
  try{
   const p=await clip();
   broad=normalize(await p(input,COMMON_FOOD_CANDIDATES,{hypothesis_template:"a photo of {}"}),"clip-zero-shot").slice(0,6);
  }catch{
   broad=[];
  }
 }
 return merge(base,broad);
}

export async function foodVisionCapabilities(){
 return{food101:true,broadZeroShot:await hasClip(),remoteModels:false};
}
