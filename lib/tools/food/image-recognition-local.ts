"use client";

export type FoodVisionPrediction={label:string;score:number;source:"food101"};

let pipePromise:Promise<any>|null=null;

function toDataUrl(file:File){
 return new Promise<string>((resolve,reject)=>{
  const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file);
 });
}

async function getPipe(){
 if(pipePromise)return pipePromise;
 pipePromise=(async()=>{
  const moduleUrl="/vendor/transformers/transformers.web.js";
  const m:any=await import(/* webpackIgnore: true */ moduleUrl);
  if(!m?.env||!m?.pipeline)throw new Error("VISION_RUNTIME_UNAVAILABLE");
  m.env.allowRemoteModels=false;
  m.env.allowLocalModels=true;
  m.env.localModelPath="/models/";
  if(m.env.backends?.onnx?.wasm)m.env.backends.onnx.wasm.wasmPaths="/onnxruntime/";
  return m.pipeline("image-classification","onnx-community/swin-finetuned-food101-ONNX",{dtype:"q4f16",device:"wasm"});
 })();
 return pipePromise;
}

export async function recognizeFoodImage(file:File):Promise<FoodVisionPrediction[]>{
 if(!file.type.startsWith("image/"))throw new Error("IMAGE_REQUIRED");
 if(file.size>15*1024*1024)throw new Error("IMAGE_TOO_LARGE");
 const input=await toDataUrl(file);
 const pipe=await getPipe();
 const out=await pipe(input,{top_k:5});
 return (Array.isArray(out)?out:[]).map((x:any)=>({
  label:String(x.label||"").replaceAll("_"," ").trim(),
  score:Number(x.score||0),
  source:"food101" as const,
 })).filter((x:FoodVisionPrediction)=>x.label&&Number.isFinite(x.score));
}
