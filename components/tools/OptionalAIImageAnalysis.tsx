"use client";
import {useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";

/** Experimental on-device classification, separate from C2PA provenance or authenticity claims. */
const MODEL_ID="onnx-community/ai-image-detection-ONNX";
type Prediction={label:string;score:number};
type Classifier=(input:Blob)=>Promise<Prediction[]|Prediction>;
let classifierPromise:Promise<Classifier>|null=null;
async function loadClassifier():Promise<Classifier>{
  if(!classifierPromise){
    classifierPromise=import("@huggingface/transformers").then(async ({pipeline})=>{
      // Explicitly opt-in: downloading ONNX weights can consume considerable bandwidth.
      const classifier=await pipeline("image-classification",MODEL_ID,{device:"wasm",dtype:"q8"});
      return classifier as unknown as Classifier;
    }).catch(error=>{classifierPromise=null;throw error});
  }
  return classifierPromise;
}
function normalize(output:Prediction[]|Prediction):Prediction[]{
  const entries=Array.isArray(output)?output:[output];
  return entries.filter(p=>p&&typeof p.label==="string"&&Number.isFinite(p.score)&&p.score>=0&&p.score<=1);
}
export default function OptionalAIImageAnalysis({file,lang}:{file:File;lang:LingxiLang}){
  const zh=lang==="zh";
  const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle");
  const [result,setResult]=useState<Prediction[]>([]);
  const [error,setError]=useState("");
  const [seenFile,setSeenFile]=useState(file);
  // A new selected file must never inherit predictions from the previous file.
  if(seenFile!==file){setSeenFile(file);setState("idle");setResult([]);setError("");}
  async function analyze(){
    setState("loading");setError("");setResult([]);
    try{
      if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)){throw Error(zh?"目前模型仅支持 JPG、PNG、WebP、GIF 图片。":"This model currently accepts JPG, PNG, WebP or GIF images.");}
      const model=await loadClassifier();
      const predictions=normalize(await model(file));
      if(!predictions.length)throw Error(zh?"模型没有返回有效结果。":"The model did not return valid predictions.");
      setResult(predictions);setState("done");
    }catch(e){setError(e instanceof Error?e.message:String(e));setState("error");}
    finally{ /* Keep file processing local; the library decodes the supplied Blob. */ }
  }
  return <div className="mt-3 space-y-2 border-t pt-3">
    <p className="text-sm font-semibold">{zh?"可选 AI 图像模型分析（实验性）":"Optional AI image-model analysis (experimental)"}</p>
    <p className="text-sm opacity-80">{zh?"启动后需下载约87MB量化开源模型，可能耗费流量且部分网络无法连接。图片在当前浏览器推理；模型分数不是图片真伪证明。":"Opt in to download an ~87 MB quantized open-source model; connectivity and bandwidth are required. Image inference runs in your browser. Model scores do not prove authenticity."}</p>
    <button type="button" onClick={()=>void analyze()} disabled={state==="loading"} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60">{state==="loading"?(zh?"正在加载并分析…":"Loading and analyzing…"):(zh?"启动图片模型分析":"Run image-model analysis")}</button>
    {state==="error"&&<p role="alert" className="text-sm">{zh?"模型不可用或分析失败：":"Model unavailable or analysis failed: "}{error}</p>}
    {state==="done"&&<div className="space-y-1 text-sm" aria-live="polite">
      {result.map((p,i)=><p key={i}>{p.label==="Fake"?(zh?"模型倾向：AI 生成":"Model label: AI-generated"):p.label==="Real"?(zh?"模型倾向：真实图片":"Model label: real image"):p.label} — {(p.score*100).toFixed(1)}% {zh?"模型分类分数":"model classification score"}</p>)}
      <p className="opacity-75">{zh?"仅是模型分类分数，不是客观真实概率；不能用于证明 AI 生成或来源可信。没有进行 C2PA 签名验证。":"A model classification score, not calibrated real-world probability or proof. No C2PA signature verification was performed."}</p>
      <a href="https://huggingface.co/onnx-community/ai-image-detection-ONNX" target="_blank" rel="noopener noreferrer" className="underline">{MODEL_ID}</a>
    </div>}
  </div>;
}
