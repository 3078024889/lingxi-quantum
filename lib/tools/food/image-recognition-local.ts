"use client";
import{COMMON_FOOD_CANDIDATES}from"./common-food-vocabulary";
import{GLOBAL_VISION_VOCABULARY,rerankFoodVision}from"./vision-intelligence";
import{visualFoodHints}from"./image-visual-hints";
export type FoodVisionPrediction={label:string;score:number;source:"food101"|"clip-zero-shot"|"ensemble";evidence?:number;requiresConfirmation?:boolean;regionHits?:number;viewCount?:number;relativeShare?:number|null};
let food101Promise:Promise<any>|null=null,clipPromise:Promise<any>|null=null,clipAvailable:Promise<boolean>|null=null;
const alias=(s:string)=>s.toLowerCase().replaceAll("_"," ").trim().replace(/^tacos$/,"taco").replace(/^donuts$/,"donut");
function toDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file)})}
async function runtime(){const moduleUrl="/vendor/transformers/transformers.web.js";const m:any=await import(/* webpackIgnore: true */ moduleUrl);if(!m?.env||!m?.pipeline)throw new Error("VISION_RUNTIME_UNAVAILABLE");m.env.allowRemoteModels=false;m.env.allowLocalModels=true;m.env.localModelPath="/models/";if(m.env.backends?.onnx?.wasm)m.env.backends.onnx.wasm.wasmPaths="/onnxruntime/";return m}
async function food101(){if(food101Promise)return food101Promise;food101Promise=(async()=>{const m=await runtime();return m.pipeline("image-classification","onnx-community/swin-finetuned-food101-ONNX",{dtype:"q4f16",device:"wasm"})})().catch(e=>{food101Promise=null;throw e});return food101Promise}
async function hasClip(){if(clipAvailable)return clipAvailable;clipAvailable=fetch("/models/Xenova/clip-vit-base-patch32/lingxifield-manifest.json",{cache:"force-cache"}).then(async r=>{if(!r.ok)return false;const m:any=await r.json().catch(()=>null);return Boolean(m?.installed&&m?.variant==="q4f16-split"&&m?.remoteModels===false)}).catch(()=>false);return clipAvailable}
async function clip(){if(clipPromise)return clipPromise;clipPromise=(async()=>{if(!await hasClip())throw new Error("CLIP_NOT_INSTALLED");const m=await runtime();return m.pipeline("zero-shot-image-classification","Xenova/clip-vit-base-patch32",{dtype:"q4f16",device:"wasm"})})().catch(e=>{clipPromise=null;throw e});return clipPromise}
function norm(raw:any[],source:"food101"|"clip-zero-shot"){return(Array.isArray(raw)?raw:[]).map(x=>({label:alias(String(x.label||"")),score:Number(x.score||0),source})).filter(x=>x.label&&Number.isFinite(x.score)&&x.score>0)}
async function imageViews(file:File){
 const full=await toDataUrl(file);try{
  const bmp=await createImageBitmap(file),w=bmp.width,h=bmp.height;if(w<320||h<320){bmp.close();return[full]}
  const specs=[["center",.14,.14,.72,.72],["tl",0,0,.62,.62],["tr",.38,0,.62,.62],["bl",0,.38,.62,.62],["br",.38,.38,.62,.62]] as const;
  const out=[full];for(const[,x,y,cw,ch]of specs){const canvas=document.createElement("canvas"),W=Math.max(224,Math.round(w*cw)),H=Math.max(224,Math.round(h*ch));canvas.width=Math.min(512,W);canvas.height=Math.min(512,H);const ctx=canvas.getContext("2d");if(!ctx)continue;ctx.drawImage(bmp,w*x,h*y,w*cw,h*ch,0,0,canvas.width,canvas.height);out.push(canvas.toDataURL("image/jpeg",.9))}
  bmp.close();return out;
 }catch{return[full]}
}
function mergeViews(viewRows:FoodVisionPrediction[][]){
 const m=new Map<string,{sum:number;max:number;views:Set<number>;sources:Set<string>}>();
 viewRows.forEach((rows,vi)=>rows.forEach(x=>{const k=alias(x.label),v=m.get(k)||{sum:0,max:0,views:new Set<number>(),sources:new Set<string>()};v.sum+=Math.min(1,x.score);v.max=Math.max(v.max,x.score);v.views.add(vi);v.sources.add(x.source);m.set(k,v)}));
 const n=Math.max(1,viewRows.length);return[...m].map(([label,v])=>{const regionHits=v.views.size,evidence=v.sources.size+(regionHits>1?1:0),coverage=regionHits/n;const score=Math.min(.999,v.max*.66+(v.sum/regionHits)*.22+coverage*.12);return{label,score,source:"ensemble" as const,evidence,regionHits,viewCount:n,requiresConfirmation:evidence<2||score<.44}}).sort((a,b)=>b.score-a.score).slice(0,18)
}
async function classify(input:string){
 const basePipe=await food101(),base=norm(await basePipe(input,{top_k:8}),"food101");let broad:FoodVisionPrediction[]=[];
 if(await hasClip())try{const cp=await clip();const vocab=[...new Set([...COMMON_FOOD_CANDIDATES,...GLOBAL_VISION_VOCABULARY])].slice(0,1200);broad=norm(await cp(input,vocab,{hypothesis_template:"a photo of {}"}),"clip-zero-shot").slice(0,18)}catch{broad=[]}
 return[...base,...broad];
}
export async function recognizeFoodImage(file:File,country?:string|null):Promise<FoodVisionPrediction[]>{
 if(!file.type.startsWith("image/"))throw new Error("IMAGE_REQUIRED");if(file.size>15*1024*1024)throw new Error("IMAGE_TOO_LARGE");
 const views=await imageViews(file),classified:FoodVisionPrediction[][]=[];for(const input of views)classified.push(await classify(input));
 const visual=(await visualFoodHints(file).catch(()=>[])).map(x=>({label:alias(x.label),score:Number(x.score||0),source:"clip-zero-shot" as const}));
 if(visual.length)classified[0]=[...(classified[0]||[]),...visual];
 const raw=mergeViews(classified),ranked=rerankFoodVision(raw,country);
 return ranked.map(x=>({label:x.displayName,score:x.score,source:"ensemble",evidence:raw.find(r=>alias(r.label)===alias(x.label))?.evidence||1,requiresConfirmation:x.requiresConfirmation,regionHits:x.regionHits,viewCount:x.viewCount,relativeShare:x.relativeShare}));
}
export async function foodVisionCapabilities(){const broadZeroShot=await hasClip();return{food101:true,broadZeroShot,multiViewCrops:true,regionalReranking:true,mixedMealContract:true,portionEvidenceContract:true,calibratedEnsemble:true,remoteModels:false,productionVisionReady:broadZeroShot}}
