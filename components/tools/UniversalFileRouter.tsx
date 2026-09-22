"use client";
import Link from "next/link";
import { useRef, useState } from "react";

type Choice={href:string;title:string;description:string};
function choices(file:File):Choice[]{
  const type=(file.type||"").toLowerCase(), name=file.name.toLowerCase();
  if(type==="application/pdf"||name.endsWith(".pdf")) return [
    {href:"/tools/pdf-editor",title:"编辑 PDF",description:"改文字、加图片、签名、盖章、页面处理"},
    {href:"/tools/e-sign-pdf",title:"签名 / 盖章 / 骑缝章",description:"多页签章与骑缝章"},
    {href:"/tools/pdf-merge-split",title:"合并 / 拆分 / 旋转",description:"浏览器本地处理页面"},
    {href:"/tools/privacy-cleaner",title:"清理隐私信息",description:"移除 PDF 作者、标题等元数据"},
  ];
  if(type.startsWith("image/")||/\.(heic|heif|jpe?g|png|webp|avif)$/i.test(name)) return [
    {href:"/tools/batch-image",title:"压缩 / 改尺寸 / 转格式",description:"单张或批量处理"},
    {href:"/tools/image-watermark-remover",title:"去文字 / 去物体",description:"框选区域后智能修复"},
    {href:"/tools/ocr",title:"提取图片文字",description:"OCR 识别并复制文字"},
    {href:"/tools/privacy-cleaner",title:"清除照片定位",description:"去除 GPS / EXIF 元数据"},
    {href:"/tools/image-to-pdf-pro",title:"转成 PDF",description:"多张图可合成一个 PDF"},
  ];
  if(type.startsWith("video/")||/\.(mp4|mov|mkv|webm|m4v)$/i.test(name)) return [
    {href:"/tools/video-toolkit",title:"压缩 / 裁剪 / 提取音频",description:"本地 FFmpeg 处理"},
    {href:"/tools/video-dubbing",title:"翻译 / 配音",description:"生成其他语言版本"},
    {href:"/tools/video-watermark-remover",title:"清理固定区域",description:"处理你有权编辑的视频"},
  ];
  if(type.startsWith("audio/")||/\.(mp3|wav|m4a|aac|ogg)$/i.test(name)) return [
    {href:"/tools/video-toolkit",title:"音频转换 / 裁剪",description:"复用本地媒体处理引擎"},
    {href:"/tools/video-dubbing",title:"语音翻译",description:"转写并生成目标语言"},
  ];
  return [];
}

export default function UniversalFileRouter(){
  const input=useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const [items,setItems]=useState<Choice[]>([]);
  function accept(f:File){setFile(f);setItems(choices(f));}
  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,.04)] sm:p-5">
    <div className="flex items-center justify-between gap-4">
      <div><h2 className="text-base font-semibold text-slate-900">不知道该选哪个？把文件丢进来</h2><p className="mt-1 text-sm text-slate-500">我先看文件类型，再只给你能真正执行的操作。</p></div>
      <button onClick={()=>input.current?.click()} className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-blue-300">选择文件</button>
    </div>
    <input ref={input} type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)accept(f);e.target.value="";}}/>
    <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)accept(f);}}
      className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      拖一个文件到这里
    </div>
    {file&&<div className="mt-4">
      <div className="rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white"><b>{file.name}</b><span className="ml-2 opacity-80">{(file.size/1024/1024).toFixed(2)} MB</span></div>
      {items.length?<div className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(x=><Link key={x.href} href={x.href} className="rounded-2xl border border-slate-200 p-3 hover:border-blue-200"><div className="font-medium text-slate-900">{x.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{x.description}</div></Link>)}</div>
      :<p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">暂时没有适合这个文件类型的本地处理入口。我不会给你假按钮。</p>}
    </div>}
  </section>;
}
