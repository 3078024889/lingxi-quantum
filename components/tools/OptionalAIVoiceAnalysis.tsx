"use client";
import {useState} from "react";
import type {LingxiLang} from "@/lib/lingxi-i18n";

const MODEL="ai8shiro/deepfake-audio-wav2vec2-ONNX";
type Prediction={label:string;score:number};
type Classifier=(wave:Float32Array)=>Promise<Prediction[]|Prediction>;
let loading:Promise<Classifier>|null=null;
function getModel():Promise<Classifier>{
 if(!loading)loading=import("@huggingface/transformers").then(async ({pipeline})=>
   await pipeline("audio-classification",MODEL,{dtype:"q8"}) as unknown as Classifier
 ).catch(e=>{loading=null;throw e});
 return loading;
}
async function extractSpeechSegment(file:File):Promise<Float32Array>{
 if(file.size>40*1024*1024)throw Error("Audio file exceeds 40 MB browser-analysis limit");
 const ctx=new AudioContext();
 let decoded:AudioBuffer;
 try{decoded=await ctx.decodeAudioData(await file.arrayBuffer())}
 finally{await ctx.close().catch(()=>{})}
 if(!Number.isFinite(decoded.duration)||decoded.duration<0.2)throw Error("Audio is empty or too short");
 const sampleRate=16000;
 const samples=Math.max(1,Math.floor(Math.min(decoded.duration,12)*sampleRate));
 const originalFrames=Math.min(decoded.length,Math.ceil(12*decoded.sampleRate));
 const offline=new OfflineAudioContext(1,samples,sampleRate);
 const input=offline.createBuffer(1,originalFrames,decoded.sampleRate);
 const mono=input.getChannelData(0);
 for(let ch=0;ch<decoded.numberOfChannels;ch++){
  const data=decoded.getChannelData(ch);
  for(let i=0;i<originalFrames;i++)mono[i]+=data[i]/decoded.numberOfChannels;
 }
 const source=offline.createBufferSource();
 source.buffer=input;source.connect(offline.destination);source.start();
 const rendered=await offline.startRendering();
 return new Float32Array(rendered.getChannelData(0));
}
export default function OptionalAIVoiceAnalysis({file,lang}:{file:File;lang:LingxiLang}){
 const zh=lang==="zh";
 const [state,setState]=useState<"idle"|"busy"|"done"|"error">("idle");
 const [results,setResults]=useState<Prediction[]>([]);
 const [message,setMessage]=useState("");
 async function run(){
  setState("busy");setMessage("");setResults([]);
  try{
   const samples=await extractSpeechSegment(file);
   const model=await getModel();
   const raw=await model(samples);
   const list=(Array.isArray(raw)?raw:[raw]).filter(x=>x&&typeof x.label==="string"&&Number.isFinite(x.score)&&x.score>=0&&x.score<=1);
   if(!list.length)throw Error("The model returned no valid classes");
   setResults(list);setState("done");
  }catch(e){setMessage(e instanceof Error?e.message:String(e));setState("error")}
 }
 return <div className="mt-3 space-y-2 border-t pt-3 text-sm">
  <p className="font-semibold">{zh?"可选 AI 人声反伪造分析（实验性）":"Optional AI speech spoofing analysis (experimental)"}</p>
  <p className="opacity-80">{zh?"仅分析音频最前12秒中的人声。需要联网下载开源模型，分析在本机进行。模型无法鉴别音乐或证明录音真实。":"Analyzes up to the first 12 seconds of speech only. Model download requires internet; audio inference stays on-device. Not suitable for music or proof of authenticity."}</p>
  <button type="button" disabled={state==="busy"} onClick={()=>void run()} className="rounded-lg border px-3 py-2 disabled:opacity-60">{state==="busy"?(zh?"分析中…":"Analyzing…"):(zh?"启动人声反伪造分析":"Analyze speech authenticity clues")}</button>
  {state==="error"&&<p role="alert">{zh?"暂时无法分析：":"Analysis unavailable: "}{message}</p>}
  {state==="done"&&<div aria-live="polite">
   {results.map((p,i)=><p key={i}>{p.label.toLowerCase()==="fake"?(zh?"模型倾向：合成语音":"Model label: synthetic speech"):p.label.toLowerCase()==="real"?(zh?"模型倾向：自然语音":"Model label: natural speech"):p.label} — {(p.score*100).toFixed(1)}% {zh?"模型分类分数":"model score"}</p>)}
   <p className="opacity-75">{zh?"分类分数不是真实概率；对新式语音克隆、混音及噪声可能误判。没有验证 C2PA 凭证。":"Scores are not calibrated real-world probabilities; voice cloning, edits and noise may mislead the model. No C2PA verification."}</p>
  </div>}
  <a className="underline" href="https://huggingface.co/ai8shiro/deepfake-audio-wav2vec2-ONNX" target="_blank" rel="noopener noreferrer">{MODEL}</a>
 </div>;
}
