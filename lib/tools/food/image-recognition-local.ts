"use client";
import{COMMON_FOOD_CANDIDATES}from"./common-food-vocabulary";
import{GLOBAL_VISION_VOCABULARY,rerankFoodVision}from"./vision-intelligence";
export type FoodVisionPrediction={label:string;score:number;source:"food101"|"clip-zero-shot"|"ensemble";evidence?:number;requiresConfirmation?:boolean;regionHits?:number;viewCount?:number;relativeShare?:number|null};
let food101Promise:Promise<any>|null=null,clipPromise:Promise<any>|null=null,clipAvailable:Promise<boolean>|null=null;
const alias=(s:string)=>s.toLowerCase().replaceAll("_"," ").trim().replace(/^tacos$/,"taco").replace(/^donuts$/,"donut");
function toDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file)})}
async function runtime(){const moduleUrl="/vendor/transformers/transformers.web.js";const m:any=await import(/* webpackIgnore: true */ moduleUrl);if(!m?.env||!m?.pipeline)throw new Error("VISION_RUNTIME_UNAVAILABLE");m.env.allowRemoteModels=false;m.env.allowLocalModels=true;m.env.localModelPath="/models/";if(m.env.backends?.onnx?.wasm){m.env.backends.onnx.wasm.wasmPaths="/vendor/transformers/";m.env.backends.onnx.wasm.numThreads=1;}return m}
async function food101(){if(food101Promise)return food101Promise;food101Promise=(async()=>{const m=await runtime();return m.pipeline("image-classification","onnx-community/swin-finetuned-food101-ONNX",{dtype:"q4f16",device:"wasm"})})().catch(e=>{food101Promise=null;throw e});return food101Promise}
async function hasClip(){if(clipAvailable)return clipAvailable;clipAvailable=fetch("/models/Xenova/clip-vit-base-patch32/lingxifield-manifest.json",{cache:"force-cache"}).then(async r=>{if(!r.ok)return false;const m:any=await r.json().catch(()=>null);return Boolean(m?.installed&&m?.variant==="q8-split"&&m?.remoteModels===false)}).catch(()=>false);return clipAvailable}
async function clip(){
 if(clipPromise)return clipPromise;
 clipPromise=(async()=>{
  if(!await hasClip())throw new Error('CLIP_NOT_INSTALLED');
  const m=await runtime(),model='Xenova/clip-vit-base-patch32',options={dtype:'q8',device:'wasm'};
  // This pinned distribution contains separate projected encoders, not the
  // combined model expected by the zero-shot pipeline's default loader.
  const tokenizer=await m.AutoTokenizer.from_pretrained(model);
  const processor=await m.AutoProcessor.from_pretrained(model);
  const textModel=await m.CLIPTextModelWithProjection.from_pretrained(model,options);
  const visionModel=await m.CLIPVisionModelWithProjection.from_pretrained(model,options);
  const vocab=[...new Set([...COMMON_FOOD_CANDIDATES,...GLOBAL_VISION_VOCABULARY])].filter(x=>/^[\x20-\x7E]+$/.test(x)).slice(0,300);
  const vectors:Float32Array[]=[];
  const normalize=(values:ArrayLike<number>)=>{const a=Float32Array.from(values);const length=Math.sqrt(a.reduce((sum,x)=>sum+x*x,0))||1;return a.map(x=>x/length)};
  for(let offset=0;offset<vocab.length;offset+=12){
   const inputs=tokenizer(vocab.slice(offset,offset+12).map(x=>`a photo of ${x}`),{padding:true,truncation:true});
   const output=await textModel(inputs),width=output.text_embeds.dims[1];
   for(let row=0;row<output.text_embeds.dims[0];row++)vectors.push(normalize(output.text_embeds.data.slice(row*width,(row+1)*width)));
  }
  await textModel.dispose();
  return async(input:string)=>{
   const output=await visionModel(await processor(await m.RawImage.read(input)));
   const image=normalize(output.image_embeds.data);
   const logits=vectors.map(v=>100*v.reduce((sum,x,i)=>sum+x*image[i],0));
   const peak=Math.max(...logits),exps=logits.map(x=>Math.exp(x-peak)),sum=exps.reduce((a,b)=>a+b,0);
   return vocab.map((label,i)=>({label,score:exps[i]/sum})).sort((a,b)=>b.score-a.score);
  };
 })().catch(e=>{clipPromise=null;throw e});return clipPromise;
}
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
async function classify(input:string,broadView=true){
 let base:FoodVisionPrediction[]=[];try{const basePipe=await food101();base=norm(await basePipe(input,{top_k:8}),"food101")}catch{base=[]}let broad:FoodVisionPrediction[]=[];
 if(broadView&&await hasClip())try{const cp=await clip();broad=norm(await cp(input),"clip-zero-shot").slice(0,18)}catch(error){console.warn('Food broad recognition unavailable',error);broad=[]}
 if(broad.length)base=base.map(x=>({...x,score:x.score*.35}));
 if(!base.length&&!broad.length)throw new Error('VISION_UNAVAILABLE');return[...base,...broad];
}
export async function recognizeFoodImage(file:File,country?:string|null):Promise<FoodVisionPrediction[]>{
 if(!file.type.startsWith("image/"))throw new Error("IMAGE_REQUIRED");if(file.size>15*1024*1024)throw new Error("IMAGE_TOO_LARGE");
 const views=await imageViews(file),classified:FoodVisionPrediction[][]=[];for(let i=0;i<views.length;i++)classified.push(await classify(views[i],true));
 const raw=mergeViews(classified),ranked=rerankFoodVision(raw,country);
 return ranked.map(x=>({label:x.label,score:x.score,source:"ensemble",evidence:raw.find(r=>alias(r.label)===alias(x.label))?.evidence||1,requiresConfirmation:true,regionHits:x.regionHits,viewCount:x.viewCount,relativeShare:null}));
}
export async function foodVisionCapabilities(){const broadZeroShot=await hasClip();return{food101:true,broadZeroShot,multiViewCrops:true,regionalReranking:true,mixedMealContract:true,portionEvidenceContract:false,calibratedEnsemble:false,remoteModels:false,productionVisionReady:false,requiresConfirmation:true}}
