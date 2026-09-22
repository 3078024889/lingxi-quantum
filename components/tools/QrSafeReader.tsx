"use client";
import { useState } from "react";
export default function QrSafeReader(){
 const [value,setValue]=useState("");const [error,setError]=useState("");
 async function read(file:File){setError("");setValue("");try{const jsQR=(await import("jsqr")).default;const b=await createImageBitmap(file);const c=document.createElement("canvas");c.width=b.width;c.height=b.height;const x=c.getContext("2d");if(!x)throw new Error("浏览器不支持画布");x.drawImage(b,0,0);const d=x.getImageData(0,0,c.width,c.height);b.close?.();const r=jsQR(d.data,d.width,d.height,{inversionAttempts:"attemptBoth"});if(!r)throw new Error("没有识别到二维码");setValue(r.data);}catch(e){setError(e instanceof Error?e.message:String(e));}}
 const isUrl=/^https?:\/\//i.test(value);
 return <div className="space-y-4"><label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)read(f)}}/><b>上传二维码截图 / 图片</b><p className="mt-1 text-sm text-slate-500">先本地解析，不会自动打开二维码里的网址。</p></label>{value&&<div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs text-slate-400">识别内容</div><div className="mt-2 break-all font-mono text-sm text-slate-900">{value}</div>{isUrl&&<a href={value} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm">我确认后打开 ↗</a>}</div>}{error&&<p className="text-sm text-rose-600">{error}</p>}</div>;
}
