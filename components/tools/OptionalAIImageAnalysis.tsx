"use client";
import {useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";

/** Experimental on-device classification, separate from C2PA provenance or authenticity claims. */
const MODEL_ID="onnx-community/ai-image-detection-ONNX";
type Prediction={label:string;score:number};
type Classifier=(input:Blob)=>Promise<Prediction[]|Prediction>;
let classifierPromise:Promise<Classifier>|null=null;
export async function loadClassifier():Promise<Classifier>{
  if(!classifierPromise){
    classifierPromise=import("@huggingface/transformers").then(async ({pipeline})=>{
      // Explicitly opt-in: downloading ONNX weights can consume considerable bandwidth.
      const classifier=await pipeline("image-classification",MODEL_ID,{dtype:"q8"});
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
    <p className="text-sm font-semibold">{zh?"AI 生成痕迹分析":"AI-generation indicator analysis"}</p>
    <p className="text-sm opacity-80">{zh?"点击开始后，将在当前设备分析图片。首次使用会下载检测所需资料，可能需要一点时间。检测结果仅供参考。":"Analyze the image on this device. The first check downloads required resources. Results are indicators, not proof."}</p>
    <button type="button" onClick={()=>void analyze()} disabled={state==="loading"} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60">{state==="loading"?(zh?"正在加载并分析…":"Loading and analyzing…"):(zh?"分析图片":"Analyze image")}</button>
    {state==="error"&&<p role="alert" className="text-sm">{zh?"模型不可用或分析失败：":"Model unavailable or analysis failed: "}{error}</p>}
    {state==="done"&&<div className="space-y-1 text-sm" aria-live="polite">
      {result.map((p,i)=><p key={i}>{p.label.toUpperCase()==="FAKE"?(zh?"检测到较明显的 AI 生成特征":"Model label: AI-generated"):p.label.toUpperCase()==="REAL"?(zh?"未发现明显的 AI 生成特征":"Model label: real image"):p.label} — {(p.score*100).toFixed(1)}% {zh?"参考分数":"indicator score"}</p>)}
      <p className="opacity-75">{zh?"这里的数字只用于辅助观察，不能单独判断图片是否由 AI 制作。文件的来源信息请查看上方“文件来源与签名”。":"These scores are only clues, not proof of how the image was created. Check “File origin and signature” above for available source details."}</p>
    </div>}
  </div>;
}
