'use client';

import { useEffect, useState } from 'react';

export default function VideoWatermarkWorkbench(){
  const [file,setFile]=useState<File|null>(null);const [preview,setPreview]=useState('');const [meta,setMeta]=useState({w:0,h:0});const [x,setX]=useState(72);const [y,setY]=useState(78);const [w,setW]=useState(24);const [h,setH]=useState(14);const [busy,setBusy]=useState(false);const [progress,setProgress]=useState('');const [result,setResult]=useState('');const [error,setError]=useState('');
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);if(result)URL.revokeObjectURL(result);},[preview,result]);
  async function run(){if(!file||!meta.w||!meta.h)return;setBusy(true);setError('');setProgress('正在加载本地视频引擎…');try{
    const [{FFmpeg},{fetchFile,toBlobURL}]=await Promise.all([import('@ffmpeg/ffmpeg'),import('@ffmpeg/util')]);
    const ffmpeg=new FFmpeg();ffmpeg.on('progress',({progress})=>setProgress(`处理中 ${Math.round(progress*100)}%`));
    await ffmpeg.load({coreURL:await toBlobURL('/media/ffmpeg-0.12.10/ffmpeg-core.js','text/javascript'),wasmURL:await toBlobURL('/media/ffmpeg-0.12.10/ffmpeg-core.wasm','application/wasm')});
    const ext=file.name.split('.').pop()||'mp4';const input=`input.${ext}`;await ffmpeg.writeFile(input,await fetchFile(file));
    const px=Math.round(meta.w*x/100),py=Math.round(meta.h*y/100),pw=Math.max(8,Math.round(meta.w*w/100)),ph=Math.max(8,Math.round(meta.h*h/100));
    await ffmpeg.exec(['-i',input,'-vf',`delogo=x=${px}:y=${py}:w=${pw}:h=${ph}:show=0`,'-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','-b:a','160k','output.mp4']);
    const data=await ffmpeg.readFile('output.mp4');const bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data));const copy=new Uint8Array(bytes.length);copy.set(bytes);setResult(URL.createObjectURL(new Blob([copy.buffer],{type:'video/mp4'})));setProgress('处理完成');ffmpeg.terminate();
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
  return <div className="space-y-5">
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);setResult('');if(preview)URL.revokeObjectURL(preview);setPreview(f?URL.createObjectURL(f):'');}}/><div className="font-medium">上传你有权编辑的视频</div><div className="mt-1 text-sm text-slate-500">固定位置水印可直接在浏览器本地处理，不上传服务器。</div></label>
    {preview&&<div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black"><video src={preview} controls className="w-full" onLoadedMetadata={e=>setMeta({w:e.currentTarget.videoWidth,h:e.currentTarget.videoHeight})}/><div className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/20" style={{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`}}/></div>}
    {file&&<div className="grid gap-3 sm:grid-cols-4">{[['左侧 X',x,setX],['顶部 Y',y,setY],['宽度',w,setW],['高度',h,setH]].map(([n,v,s]:any)=><label key={n} className="text-sm text-slate-600">{n} %<input type="range" min={0} max={n==='宽度'||n==='高度'?50:95} value={v} onChange={e=>s(Number(e.target.value))} className="mt-2 w-full"/><span className="text-xs text-slate-400">{v}%</span></label>)}</div>}
    <button onClick={run} disabled={!file||busy} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">{busy?'正在处理…':'去掉固定水印'}</button>
    {progress&&<p className="text-sm text-slate-600">{progress}</p>}{error&&<p className="text-sm text-rose-600">{error}</p>}
    {result&&<div><video src={result} controls className="max-w-3xl rounded-2xl"/><a href={result} download="lingxifield-clean-video.mp4" className="mt-3 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white">下载处理结果</a></div>}
    <p className="text-xs leading-5 text-slate-500">这个版本真实处理固定位置的水印/遮挡。移动水印或穿过人物的复杂背景需要逐帧检测与视频修复模型，未接入前不会假装已经能无痕修复。</p>
  </div>;
}
