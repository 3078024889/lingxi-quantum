"use client";
import { useEffect,useState } from "react";
import { downloadBlob } from "@/lib/tools/pdf-render-client";

type Props={output:"jpeg"|"png"|"webp";accept?:string;title:string};
export default function ImageConvertWorkbench({output,accept="image/*",title}:Props){
  const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(""),[quality,setQuality]=useState(.92),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  async function run(){
    if(!file)return;setBusy(true);setError("");
    try{
      const bmp=await createImageBitmap(file),c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const x=c.getContext("2d")!;if(output==="jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}x.drawImage(bmp,0,0);bmp.close?.();
      const mime=`image/${output}`,blob=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Your browser cannot encode this output format.")),mime,quality));
      if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(blob));
      const ext=output==="jpeg"?"jpg":output;downloadBlob(blob,`${file.name.replace(/\.[^.]+$/,"")}.${ext}`);c.width=1;c.height=1;
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }
  return <div className="space-y-4"><label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><input type="file" accept={accept} className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/><b>{title}</b><p className="mt-1 text-sm text-slate-500">Local conversion. Nothing is uploaded.</p></label>{output!=="png"&&<label className="block text-sm">Quality <input type="range" min=".4" max="1" step=".05" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="ml-3 align-middle"/><span className="ml-2">{Math.round(quality*100)}%</span></label>}<button disabled={!file||busy} onClick={run} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white disabled:opacity-40">{busy?"Converting...":"Convert and download"}</button>{preview&&<img src={preview} alt="Converted" className="max-h-[420px] rounded-2xl border border-slate-200"/>}{error&&<p className="text-sm text-rose-600">{error}</p>}</div>;
}
