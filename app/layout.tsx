import type { Metadata } from "next";
import "./globals.css";
import "./unified-shell.css";
import MiniEmbedMode from "@/components/MiniEmbedMode";

const SITE="https://lingxifield.com";
const SHARE_IMAGE=`${SITE}/og-sasi-20260920.png`;

export const metadata: Metadata = {
  metadataBase:new URL(SITE),
  title:{default:"灵犀场 LINGXIFIELD｜免费实用工具、AI 创作与一念显化",template:"%s ｜ 灵犀场 LINGXIFIELD"},
  description:"灵犀场是一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。免费实用工具、AI 创作与构建、探索与显化，都从同一个入口开始。",
  alternates:{canonical:"/"},
  openGraph:{type:"website",siteName:"灵犀场 LINGXIFIELD",title:"灵犀场｜一键即达，一念显化",description:"免费实用工具、AI 创作与构建、探索与显化，让想法被理解，让问题被处理，让结果真正发生。",url:SITE,images:[{url:SHARE_IMAGE,width:1672,height:941,alt:"灵犀场 LINGXIFIELD"}]},
  twitter:{card:"summary_large_image",title:"灵犀场 LINGXIFIELD",description:"一念即达 · 一念显化。把问题、资料与想法带进来，让下一步变得清晰。",images:[SHARE_IMAGE]},
  robots:{index:true,follow:true},manifest:"/manifest.webmanifest",
  icons:{icon:[{url:"/favicon.ico",sizes:"any"},{url:"/favicon-32x32.png",sizes:"32x32",type:"image/png"},{url:"/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icon-512.png",sizes:"512x512",type:"image/png"}],apple:[{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]},
  verification:{google:["Q8hQ5NseO-vRkzeFaFHbjMWljGBYNZKlvclKWBghetk","p6pCOqQydWyeU9ubwvBSUUROUKG8Hac8xXucbtjy1mg"],other:{"baidu-site-verification":"codeva-QeLvo6OqH7","msvalidate.01":"0E5B44454CD5DC0433DDBFAFA31CDB67"}},
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN" suppressHydrationWarning><head>
  <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet"/>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7627015374349065" crossOrigin="anonymous"/>
 </head><body className="antialiased"><MiniEmbedMode/><div className="lx-site-content">{children}</div></body></html>;
}
