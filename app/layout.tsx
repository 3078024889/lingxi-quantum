import type { Metadata } from "next";
import "./globals.css";
import "./unified-shell.css";
import "./v201-quality.css";
import "./v40-mobile.css";
import "./v43-product-visuals.css";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import AdSenseLoader from "@/components/AdSenseLoader";
import CurrencyPreferenceProvider from "@/components/CurrencyPreferenceProvider";
import SiteStructuredData from "@/components/SiteStructuredData";
import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";

const SITE="https://lingxifield.com";
const SHARE_IMAGE=`${SITE}/og-lingxifield-20260928.png`;

const LINGXIFIELD_HTML_LOCALE_BOOTSTRAP=`(()=>{try{const seg=location.pathname.split('/')[1]||'';const locales={en:'en',ja:'ja',ko:'ko',fr:'fr',de:'de',es:'es',pt:'pt',ar:'ar'};const locale=locales[seg]||'zh-CN';const root=document.documentElement;root.lang=locale;root.dir=seg==='ar'?'rtl':'ltr';}catch{}})();`;

export const metadata:Metadata={
 metadataBase:new URL(SITE),
 title:{
  default:"灵犀场 LINGXIFIELD｜SASI智能生态与全球智能工具平台",
  template:"%s ｜ 灵犀场 LINGXIFIELD"
 },
 description:"AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。",
 applicationName:"灵犀场 LINGXIFIELD｜SASI智能生态",
 keywords:[
  "灵犀场","LINGXIFIELD","SASI","免费在线工具",
  "PDF压缩","PDF合并","PDF拆分","PDF编辑","电子签名",
  "图片压缩","图片格式转换","图片OCR","视频转文字","音频转文字","字幕翻译",
  "临时邮箱","阅后即焚","AI 短剧生成","AI 视频生成",
  "书本智能体","文档智能体","学习智能体","科研智能体","AI 网站生成"
 ],
 openGraph:{
  type:"website",
  siteName:"灵犀场 LINGXIFIELD",
  title:"灵犀场 LINGXIFIELD｜SASI智能生态与全球智能工具平台",
  description:"AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。",
  url:SITE,
  images:[{url:SHARE_IMAGE,width:1200,height:630,alt:"灵犀场 LINGXIFIELD"}]
 },
 twitter:{
  card:"summary_large_image",
  title:"灵犀场 LINGXIFIELD｜SASI智能生态",
  description:"AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。",
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
 return <html lang="zh-CN" dir="ltr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:LINGXIFIELD_HTML_LOCALE_BOOTSTRAP}}/>
  <SiteStructuredData/>
  </head><body className="antialiased"><MiniEmbedMode/><AdSenseLoader/><CurrencyPreferenceProvider><div className="lx-site-content">{children}</div></CurrencyPreferenceProvider><LingxifieldFeedback /></body></html>;
}
