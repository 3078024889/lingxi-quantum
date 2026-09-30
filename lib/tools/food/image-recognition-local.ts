"use client";
import{COMMON_FOOD_CANDIDATES}from"./common-food-vocabulary";
import{visualFoodHints}from"./image-visual-hints";
export type FoodVisionPrediction={label:string;score:number;source:"food101"|"clip-zero-shot"|"ensemble";evidence?:number;requiresConfirmation?:boolean};
let food101Promise:Promise<any>|null=null,clipPromise:Promise<any>|null=null,clipAvailable:Promise<boolean>|null=null;
const alias=(s:string)=>s.toLowerCase().replaceAll("_"," ").trim().replace(/^tacos$/,"taco").replace(/^donuts$/,"donut");
function toDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file)})}
async function runtime(){const moduleUrl="/vendor/transformers/transformers.web.js";const m:any=await import(/* webpackIgnore: true */ moduleUrl);if(!m?.env||!m?.pipeline)throw new Error("VISION_RUNTIME_UNAVAILABLE");m.env.allowRemoteModels=false;m.env.allowLocalModels=true;m.env.localModelPath="/models/";if(m.env.backends?.onnx?.wasm)m.env.backends.onnx.wasm.wasmPaths="/onnxruntime/";return m}
async function food101(){if(food101Promise)return food101Promise;food101Promise=(async()=>{const m=await runtime();return m.pipeline("image-classification","onnx-community/swin-finetuned-food101-ONNX",{dtype:"q4f16",device:"wasm"})})().catch(e=>{food101Promise=null;throw e});return food101Promise}
async function hasClip(){if(clipAvailable)return clipAvailable;clipAvailable=fetch("/models/Xenova/clip-vit-base-patch32/lingxifield-manifest.json",{cache:"force-cache"}).then(async r=>{if(!r.ok)return false;const m:any=await r.json().catch(()=>null);return Boolean(m?.installed&&m?.variant==="q4f16-split"&&m?.remoteModels===false)}).catch(()=>false);return clipAvailable}
async function clip(){if(clipPromise)return clipPromise;clipPromise=(async()=>{if(!await hasClip())throw new Error("CLIP_NOT_INSTALLED");const m=await runtime();return m.pipeline("zero-shot-image-classification","Xenova/clip-vit-base-patch32",{dtype:"q4f16",device:"wasm"})})().catch(e=>{clipPromise=null;throw e});return clipPromise}
function norm(raw:any[],source:"food101"|"clip-zero-shot"){return(Array.isArray(raw)?raw:[]).map(x=>({label:alias(String(x.label||"")),score:Number(x.score||0),source})).filter(x=>x.label&&Number.isFinite(x.score)&&x.score>0)}
function ensemble(parts:Array<{rows:FoodVisionPrediction[];weight:number}>){
 const m=new Map<string,{sum:number,max:number,sources:Set<string>}>();
 for(const p of parts)for(const x of p.rows){const k=alias(x.label),v=m.get(k)||{sum:0,max:0,sources:new Set<string>()};v.sum+=Math.min(1,x.score)*p.weight;v.max=Math.max(v.max,x.score);v.sources.add(x.source);m.set(k,v)}
 const ranked=[...m].map(([label,v])=>{const evidence=v.sources.size;const agreement=evidence>=2?.12:0;const score=Math.min(.999,(v.sum/(1.15+1+.32))+agreement);return{label,score,source:"ensemble" as const,evidence,requiresConfirmation:evidence<2||score<.46}}).sort((a,b)=>b.score-a.score);
 // Conflicting top candidates are not silently treated as certainty.
 if(ranked[0]&&ranked[1]&&ranked[0].score-ranked[1].score<.10)ranked[0].requiresConfirmation=true;
 return ranked.slice(0,8);
}
export async function recognizeFoodImage(file:File):Promise<FoodVisionPrediction[]>{
 if(!file.type.startsWith("image/"))throw new Error("IMAGE_REQUIRED");if(file.size>15*1024*1024)throw new Error("IMAGE_TOO_LARGE");
 const input=await toDataUrl(file),basePipe=await food101(),base=norm(await basePipe(input,{top_k:8}),"food101");
 const visual=(await visualFoodHints(file).catch(()=>[])).map(x=>({label:alias(x.label),score:Number(x.score||0),source:"clip-zero-shot" as const}));
 let broad:FoodVisionPrediction[]=[];if(await hasClip())try{const p=await clip();broad=norm(await p(input,COMMON_FOOD_CANDIDATES,{hypothesis_template:"a photo of {}"}),"clip-zero-shot").slice(0,12)}catch{broad=[]}
 return ensemble([{rows:base,weight:1},{rows:broad,weight:1.15},{rows:visual,weight:.32}]);
}
export async function foodVisionCapabilities(){const broadZeroShot=await hasClip();return{food101:true,broadZeroShot,calibratedEnsemble:true,remoteModels:false,productionVisionReady:broadZeroShot}}
