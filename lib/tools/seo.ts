import type { Metadata } from "next";
import { getTool } from "@/lib/tools/registry";

const SITE="https://lingxifield.com";

type SeoEntry={title:string;description:string;keywords:string[]};

const SEO:Record<string,SeoEntry>={
 "e-sign-pdf":{
  title:"PDF电子签名与电子签章｜在线签字、盖章、骑缝章",
  description:"在线给 PDF 添加手写签名、电子签章、公章图片或骑缝章。上传后定位、调整大小、预览并导出，适合合同签字、PDF盖章等常见场景。",
  keywords:["PDF电子签名","电子签名","电子签章","PDF盖章","合同签名","合同盖章","PDF签字","在线签字","骑缝章","PDF骑缝章","公章图片"]
 },
 "pdf-editor":{title:"在线PDF编辑｜加文字、图片、签名与印章",description:"直接编辑 PDF：添加文字、图片、签名和印章，遮盖内容、旋转页面、选择页码并导出。",keywords:["PDF编辑","在线PDF编辑","PDF签名","PDF盖章"]},
 "pdf-merge-split":{title:"PDF合并与拆分｜在线合并PDF、按页拆分",description:"合并多个 PDF，或把一个 PDF 按页面拆分，处理完成后直接保存结果。",keywords:["PDF合并","合并PDF","PDF拆分","拆分PDF"]},
 "pdf-compress":{title:"PDF压缩｜在线减小PDF文件大小",description:"压缩扫描件和图片型 PDF，降低文件体积并尽量保留可用质量。",keywords:["PDF压缩","压缩PDF","PDF变小"]},
 "pdf-pages":{title:"PDF页面整理｜删除、提取、排序页面",description:"重新排列、提取或删除 PDF 页面，快速整理文档页序。",keywords:["PDF页面排序","PDF删除页面","PDF提取页面"]},
 "pdf-redact":{title:"PDF永久脱敏｜遮盖敏感信息",description:"对 PDF 中的身份证号、地址、账号等敏感区域进行不可逆遮盖。",keywords:["PDF脱敏","PDF打码","PDF遮盖"]},
 "pdf-ocr":{title:"扫描PDF文字识别｜提取可复制文字",description:"识别扫描 PDF 中的文字，得到可复制、可整理的文本内容。",keywords:["PDF文字识别","扫描PDF转文字","PDF OCR"]},
 "pdf-to-jpg":{title:"PDF转JPG｜把PDF每页导出为图片",description:"把 PDF 页面转换为 JPG 图片并保存。",keywords:["PDF转JPG","PDF转图片","PDF转JPEG"]},
 "image-to-pdf-pro":{title:"图片转PDF｜多张图片合成一个PDF",description:"把 JPG、PNG 等多张图片按顺序排版并生成 PDF。",keywords:["图片转PDF","JPG转PDF","PNG转PDF"]},
 "ocr":{title:"图片文字识别｜图片转文字",description:"从照片、截图和扫描图片中识别并提取可复制文字。",keywords:["图片转文字","图片文字识别","截图转文字","OCR"]},
 "video-transcription":{title:"视频转文字｜提取视频语音和字幕文本",description:"把视频中的语音转成可编辑文字，并可导出字幕文件。",keywords:["视频转文字","视频提取文字","视频字幕提取","视频转字幕"]},
 "audio-transcription":{title:"音频转文字｜录音转文字",description:"把录音、采访、会议等音频内容转成可编辑文字。",keywords:["音频转文字","录音转文字","语音转文字"]},
 "subtitle-translate":{title:"字幕翻译｜保留时间轴翻译SRT/VTT",description:"翻译 SRT、VTT 字幕内容并保留原有时间轴结构。",keywords:["字幕翻译","SRT翻译","VTT翻译","视频字幕翻译"]},
 "subtitle-tools":{title:"字幕工具｜SRT/VTT转换与时间轴调整",description:"调整字幕时间、转换 SRT/VTT/TXT，整理字幕文件。",keywords:["SRT工具","VTT工具","字幕时间轴"]},
 "video-toolkit":{title:"在线视频工具｜压缩、裁剪、提取音频",description:"处理常见视频任务：压缩、裁剪、提取音频并保存结果。",keywords:["视频压缩","视频裁剪","视频提取音频"]},
 "video-dubbing":{title:"视频翻译配音｜字幕翻译与配音预览",description:"从视频提取语音，生成翻译字幕并试听目标语言配音。",keywords:["视频配音","视频翻译","翻译配音"]},
 "image-watermark-remover":{title:"图片去水印｜修复选中区域",description:"框选图片中需要移除的水印或覆盖区域并修复背景。仅处理有权使用的内容。",keywords:["图片去水印","去水印","图片修复"]},
 "batch-image-watermark-remover":{title:"批量图片去水印｜多图同位置处理",description:"批量处理多张图片相同位置的水印或覆盖区域。",keywords:["批量去水印","图片批量去水印"]},
 "video-watermark-remover":{title:"视频去水印｜处理固定区域",description:"处理视频中的固定水印区域并导出结果。仅处理有权使用的内容。",keywords:["视频去水印","去视频水印"]},
 "temp-mail":{title:"临时邮箱｜接收验证码与一次性邮件",description:"创建临时邮箱，用于接收验证码、确认链接和一次性通知。",keywords:["临时邮箱","一次性邮箱","验证码邮箱"]},
 "burn-after-read":{title:"阅后即焚｜一次性私密链接",description:"发送文字和附件，设置有效期与查看次数，访问后按规则失效。",keywords:["阅后即焚","一次性链接","私密分享"]},
 "id-photo-ai":{title:"证件照换底｜白底、蓝底、红底证件照",description:"上传照片后生成常用背景色的证件照结果，提交前请核对目标机构尺寸要求。",keywords:["证件照换底","白底证件照","蓝底证件照","红底证件照"]},
 "food-calorie":{title:"食物热量估算｜记录一餐的食物与卡路里",description:"记录食物和份量，估算一餐的热量与营养信息。",keywords:["卡路里计算","食物热量","热量估算"]},
 "heic-local":{title:"HEIC转JPG｜iPhone照片转JPG",description:"把 iPhone 常见 HEIC/HEIF 照片转换为 JPG。",keywords:["HEIC转JPG","HEIF转JPG","苹果照片转JPG"]},
 "avif-to-jpg":{title:"AVIF转JPG｜在线图片格式转换",description:"把 AVIF 图片转换为更通用的 JPG。",keywords:["AVIF转JPG","AVIF转换"]},
 "jpg-to-png":{title:"JPG转PNG｜在线图片格式转换",description:"把 JPG/JPEG 转换为 PNG 并保存。",keywords:["JPG转PNG","JPEG转PNG"]},
 "png-to-jpg":{title:"PNG转JPG｜在线图片格式转换",description:"把 PNG 转换为 JPG 并保存。",keywords:["PNG转JPG","PNG转JPEG"]},
 "webp-to-jpg":{title:"WebP转JPG｜在线图片格式转换",description:"把 WebP 转换为 JPG 或 PNG。",keywords:["WebP转JPG","WebP转JPEG"]},
 "svg-to-png":{title:"SVG转PNG｜矢量图导出PNG",description:"把 SVG 矢量图导出为 PNG 图片。",keywords:["SVG转PNG","SVG转换"]},
 "qr-safe-reader":{title:"二维码识别｜先看内容再决定是否打开",description:"上传二维码图片，先读取其中的文本或链接，再决定是否访问。",keywords:["二维码识别","二维码读取","QR识别"]},
 "privacy-cleaner":{title:"文件隐私清理｜删除图片EXIF与常见元数据",description:"清理图片 GPS、设备信息和常见文件元数据，减少隐私暴露。",keywords:["EXIF删除","图片GPS删除","文件隐私清理"]},
 "screenshot-redact":{title:"截图打码与脱敏｜遮盖敏感信息",description:"在截图上遮盖姓名、账号、地址等敏感区域并导出。",keywords:["截图打码","图片脱敏","截图遮盖"]},
 "long-image":{title:"长图拼接｜多张图片拼成长图",description:"把多张图片按顺序拼接为一张长图。",keywords:["长图拼接","图片拼接","多图拼接"]},
 "document-copy-layout":{title:"证件复印排版｜正反面排到A4",description:"把证件正反面排版到 A4，并可添加用途水印后导出。",keywords:["身份证复印排版","证件A4排版","证件复印"]},
 "batch-image":{title:"批量图片处理｜批量压缩与格式转换",description:"一次处理多张图片，批量压缩、转换格式并保存结果。",keywords:["批量图片处理","批量图片压缩","批量图片转换"]},
};

function fallbackTitle(slug:string){
 return slug.split("-").map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ");
}

export function toolSeo(slug:string):SeoEntry{
 const custom=SEO[slug];if(custom)return custom;
 const tool=getTool(slug);
 if(tool)return{
  title:tool.titleZh,
  description:tool.oneLinerZh,
  keywords:[tool.titleZh,tool.titleEn,slug.replaceAll("-"," ")]
 };
 return{title:fallbackTitle(slug),description:"在线处理文件、图片、PDF、文本与常见日常任务。",keywords:[slug.replaceAll("-"," ")]};
}

export function buildToolMetadata(slug:string):Metadata{
 const seo=toolSeo(slug),canonical=`/tools/${slug}`;
 return{
  title:seo.title,
  description:seo.description,
  keywords:seo.keywords,
  alternates:{canonical},
  openGraph:{type:"website",url:`${SITE}${canonical}`,title:`${seo.title}｜灵犀场 LINGXIFIELD`,description:seo.description},
  twitter:{card:"summary",title:`${seo.title}｜灵犀场 LINGXIFIELD`,description:seo.description},
  robots:{index:true,follow:true,"max-snippet":-1,"max-image-preview":"large"},
 };
}
