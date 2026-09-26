import type { Metadata } from "next";
import "./globals.css";
import "./unified-shell.css";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import AdSenseLoader from "@/components/AdSenseLoader";
import CurrencyPreferenceProvider from "@/components/CurrencyPreferenceProvider";
import SiteStructuredData from "@/components/SiteStructuredData";

const SITE="https://lingxifield.com";
const SHARE_IMAGE=`${SITE}/og-lingxifield-20260925.jpg`;

export const metadata:Metadata={
 metadataBase:new URL(SITE),
 title:{default:"灵犀场 LINGXIFIELD｜SASI 创作、资料知识与免费实用工具",template:"%s ｜ 灵犀场 LINGXIFIELD"},
 description:"灵犀场是一个让想法被理解、让问题被处理、让结果真正发生的数字工作空间。提供 SASI 创作与构建、资料知识、学习研究，以及 PDF、图片、视频、字幕、临时邮箱、阅后即焚等实用工具。",
 applicationName:"灵犀场 LINGXIFIELD",
 keywords:["灵犀场","LINGXIFIELD","SASI","实用工具","PDF工具","图片工具","视频转文字","字幕工具","临时邮箱","阅后即焚","资料知识","学习工具","科研工具","电子签名","电子签章","PDF盖章","骑缝章"],
 alternates:{canonical:SITE},
 openGraph:{
  type:"website",siteName:"灵犀场 LINGXIFIELD",
  title:"灵犀场｜SASI 创作、资料知识与免费实用工具",
  description:"从文件、图片和视频处理，到资料知识、学习研究、短剧和网站构建，把事情直接推进到可使用的结果。",
  url:SITE,images:[{url:SHARE_IMAGE,width:1200,height:630,alt:"灵犀场 LINGXIFIELD"}]
 },
 twitter:{card:"summary_large_image",title:"灵犀场 LINGXIFIELD",description:"SASI 创作、资料知识与免费实用工具。",images:[SHARE_IMAGE]},
 robots:{index:true,follow:true,"max-snippet":-1,"max-image-preview":"large","max-video-preview":-1},
 manifest:"/manifest.webmanifest",
 icons:{icon:[{url:"/favicon.ico",sizes:"any"},{url:"/favicon-32x32.png",sizes:"32x32",type:"image/png"},{url:"/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icon-512.png",sizes:"512x512",type:"image/png"}],apple:[{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]},
 verification:{google:["Q8hQ5NseO-vRkzeFaFHbjMWljGBYNZKlvclKWBghetk","p6pCOqQydWyeU9ubwvBSUUROUKG8Hac8xXucbtjy1mg"],other:{"baidu-site-verification":"codeva-QeLvo6OqH7","msvalidate.01":"0E5B44454CD5DC0433DDBFAFA31CDB67"}},
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN" suppressHydrationWarning><head>
  <SiteStructuredData/>
  </head><body className="antialiased"><MiniEmbedMode/><AdSenseLoader/><CurrencyPreferenceProvider><div className="lx-site-content">{children}</div></CurrencyPreferenceProvider></body></html>;
}
