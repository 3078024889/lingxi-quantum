"use client";
import Link from "next/link";
import {useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {publicHubText} from "@/lib/public-hub-i18n";
type Choice={href:string;titleZh:string;titleEn:string;descriptionZh:string;descriptionEn:string};
function choices(file:File):Choice[]{const type=(file.type||"").toLowerCase(),name=file.name.toLowerCase();
 if(type==="application/pdf"||name.endsWith(".pdf"))return[
  {href:"/tools/pdf-editor",titleZh:"编辑 PDF",titleEn:"Edit PDF",descriptionZh:"改文字、加图片、签名、盖章、页面处理",descriptionEn:"Edit text, add images, authorized signatures or stamps, and manage pages"},
  {href:"/tools/e-sign-pdf",titleZh:"签名 / 盖章 / 骑缝章",titleEn:"Sign / stamp / page-edge seal",descriptionZh:"多页签章与骑缝章",descriptionEn:"Multi-page authorized signing and page-edge seals"},
  {href:"/tools/pdf-merge-split",titleZh:"合并 / 拆分 / 旋转",titleEn:"Merge / split / rotate",descriptionZh:"直接处理页面",descriptionEn:"Process pages locally in the browser"},
  {href:"/tools/privacy-cleaner",titleZh:"清理隐私信息",titleEn:"Clean private metadata",descriptionZh:"移除 PDF 作者、标题等元数据",descriptionEn:"Remove PDF author, title and related metadata"}];
 if(type.startsWith("image/")||/\.(heic|heif|jpe?g|png|webp|avif)$/i.test(name))return[
  {href:"/tools/batch-image",titleZh:"压缩 / 改尺寸 / 转格式",titleEn:"Compress / resize / convert",descriptionZh:"单张或批量处理",descriptionEn:"Process one image or a batch"},
  {href:"/tools/image-watermark-remover",titleZh:"去文字 / 去物体",titleEn:"Remove text / objects",descriptionZh:"框选区域后智能修复",descriptionEn:"Select an area and reconstruct the background"},
  {href:"/tools/ocr",titleZh:"提取图片文字",titleEn:"Extract image text",descriptionZh:"OCR 识别并复制文字",descriptionEn:"OCR text recognition and copy"},
  {href:"/tools/privacy-cleaner",titleZh:"清除照片定位",titleEn:"Remove photo location data",descriptionZh:"去除 GPS / EXIF 元数据",descriptionEn:"Remove GPS / EXIF metadata"},
  {href:"/tools/image-to-pdf-pro",titleZh:"转成 PDF",titleEn:"Convert to PDF",descriptionZh:"多张图可合成一个 PDF",descriptionEn:"Combine multiple images into one PDF"}];
 if(type.startsWith("video/")||/\.(mp4|mov|mkv|webm|m4v)$/i.test(name))return[
  {href:"/tools/video-toolkit",titleZh:"压缩 / 裁剪 / 提取音频",titleEn:"Compress / trim / extract audio",descriptionZh:"视频处理 处理",descriptionEn:"Local FFmpeg processing"},
  {href:"/tools/video-dubbing",titleZh:"翻译 / 配音",titleEn:"Translate / dub",descriptionZh:"生成其他语言版本",descriptionEn:"Create another-language version"},
  {href:"/tools/video-watermark-remover",titleZh:"清理固定区域",titleEn:"Clean a fixed region",descriptionZh:"处理你有权编辑的视频",descriptionEn:"Process video you are authorized to edit"}];
 if(type.startsWith("audio/")||/\.(mp3|wav|m4a|aac|ogg)$/i.test(name))return[
  {href:"/tools/video-toolkit",titleZh:"音频转换 / 裁剪",titleEn:"Convert / trim audio",descriptionZh:"复用本地媒体处理引擎",descriptionEn:"Use the local media engine"},
  {href:"/tools/video-dubbing",titleZh:"语音翻译",titleEn:"Speech translation",descriptionZh:"转写并生成目标语言",descriptionEn:"Transcribe and create the target language"}];
 return[];
}
export default function UniversalFileRouter(){const{lang}=useLingxiLang();const t=(zh:string,en:string)=>publicHubText(lang,zh,en);const input=useRef<HTMLInputElement>(null);const[file,setFile]=useState<File|null>(null),[items,setItems]=useState<Choice[]>([]);function accept(f:File){setFile(f);setItems(choices(f));}
 return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,.04)] sm:p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-slate-900">{t("不知道该选哪个？把文件丢进来","Not sure which tool to use? Drop the file here")}</h2><p className="mt-1 text-sm text-slate-500">{t("我先看文件类型，再只给你能真正执行的操作。","I will check the file type first and only show actions that can actually run.")}</p></div><button onClick={()=>input.current?.click()} className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-blue-300">{t("选择文件","Choose file")}</button></div><input ref={input} type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)accept(f);e.target.value="";}}/><div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)accept(f);}} className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{t("拖一个文件到这里","Drop a file here")}</div>{file&&<div className="mt-4"><div className="rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white"><b>{file.name}</b><span className="ml-2 opacity-80">{(file.size/1024/1024).toFixed(2)} MB</span></div>{items.length?<div className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(x=><Link key={x.href} href={x.href} className="rounded-2xl border border-slate-200 p-3 hover:border-blue-200"><div className="font-medium text-slate-900">{lang==="zh"?x.titleZh:x.titleEn}</div><div className="mt-1 text-xs leading-5 text-slate-500">{lang==="zh"?x.descriptionZh:x.descriptionEn}</div></Link>)}</div>:<p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{t("暂时没有适合这个文件类型的本地处理入口。我不会给你假按钮。","There is no local tool for this file type yet. I will not show a fake button.")}</p>}</div>}</section>;
}
