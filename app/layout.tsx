import type { Metadata } from "next";
import "./globals.css";
import "./unified-shell.css";
import "./v201-quality.css";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import AdSenseLoader from "@/components/AdSenseLoader";
import CurrencyPreferenceProvider from "@/components/CurrencyPreferenceProvider";
import SiteStructuredData from "@/components/SiteStructuredData";

const SITE="https://lingxifield.com";
const SHARE_IMAGE=`${SITE}/og-lingxifield-20260925.jpg`;

export const metadata:Metadata={
 metadataBase:new URL(SITE),
 title:{
  default:"灵犀场 LINGXIFIELD｜免费实用工具 · AI 短剧 · SASI 智能体",
  template:"%s ｜ 灵犀场 LINGXIFIELD"
 },
 description:"灵犀场提供 PDF、图片、视频、字幕、OCR 与文件处理工具，以及 AI 短剧生成、书本与文档 SASI、学习 SASI、科研 SASI、网站与应用构建。",
 applicationName:"灵犀场 LINGXIFIELD",
 keywords:[
  "灵犀场","LINGXIFIELD","SASI","免费在线工具",
  "PDF压缩","PDF合并","PDF拆分","PDF编辑","电子签名",
  "图片压缩","图片格式转换","图片OCR","视频转文字","音频转文字","字幕翻译",
  "临时邮箱","阅后即焚","AI 短剧生成","AI 视频生成",
  "书本智能体","文档智能体","学习智能体","科研智能体","AI 网站生成"
 ],
 alternates:{
  canonical:SITE,
  languages:{
   "zh-CN":SITE,
   "en":SITE+"/en",
   "ja":SITE+"/ja",
   "ko":SITE+"/ko",
   "fr":SITE+"/fr",
   "de":SITE+"/de",
   "es":SITE+"/es",
   "pt":SITE+"/pt",
   "ar":SITE+"/ar",
   "x-default":SITE
  }
 },
 openGraph:{
  type:"website",
  siteName:"灵犀场 LINGXIFIELD",
  title:"灵犀场｜免费实用工具 · AI 短剧 · SASI 智能体",
  description:"PDF、图片、视频与文件处理，以及 AI 短剧、书本/文档智能体、学习、科研和网站构建。",
  url:SITE,
  images:[{url:SHARE_IMAGE,width:1200,height:630,alt:"灵犀场 LINGXIFIELD"}]
 },
 twitter:{
  card:"summary_large_image",
  title:"灵犀场 LINGXIFIELD",
  description:"免费实用工具、AI 短剧与 SASI 智能体工作区。",
  images:[SHARE_IMAGE]
 },
 robots:{index:true,follow:true,"max-snippet":-1,"max-image-preview":"large","max-video-preview":-1},
 manifest:"/manifest.webmanifest",
 icons:{
  icon:[
   {url:"/favicon.ico",sizes:"any"},
   {url:"/favicon-32x32.png",sizes:"32x32",type:"image/png"},
   {url:"/icon-192.png",sizes:"192x192",type:"image/png"},
   {url:"/icon-512.png",sizes:"512x512",type:"image/png"}
  ],
  apple:[{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]
 },
 verification:{
  google:["Q8hQ5NseO-vRkzeFaFHbjMWljGBYNZKlvclKWBghetk","p6pCOqQydWyeU9ubwvBSUUROUKG8Hac8xXucbtjy1mg"],
  other:{
   "baidu-site-verification":"codeva-QeLvo6OqH7",
   "msvalidate.01":"0E5B44454CD5DC0433DDBFAFA31CDB67"
  }
 }
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN" suppressHydrationWarning><head>
  <SiteStructuredData/>
  </head><body className="antialiased"><MiniEmbedMode/><AdSenseLoader/><CurrencyPreferenceProvider><div className="lx-site-content">{children}</div></CurrencyPreferenceProvider></body></html>;
}
