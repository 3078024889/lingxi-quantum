import type { Metadata } from "next";
import "./globals.css";
import "./unified-shell.css";
import "./siai-home.css";
import "./siai-detail.css";
import "./v201-quality.css";
import "./v40-mobile.css";
import "./v43-product-visuals.css";
import "./brand-home-v2.css";
import "./site-news-ribbon.css";
import "./celestial-ui-20261109.css";
import "./lingxifield-premium-20261109.css";
import "./growth-pages.css";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import AdSenseLoader from "@/components/AdSenseLoader";
import CurrencyPreferenceProvider from "@/components/CurrencyPreferenceProvider";
import SiteStructuredData from "@/components/SiteStructuredData";
import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";
import MainSiteReleaseNotice from "@/components/MainSiteReleaseNotice";
import PublicUpgradeAnnouncementModal from "@/components/PublicUpgradeAnnouncementModal";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {PUBLIC_FEATURE_COPY} from "@/lib/public-feature-copy";
import {SHARE_IMAGE_URL} from "@/lib/share-image";

const SITE=PRIMARY_SITE;
const SHARE_IMAGE=SHARE_IMAGE_URL;

const LINGXIFIELD_HTML_LOCALE_BOOTSTRAP=`(()=>{try{const locales=['en','ja','ko','fr','de','es','pt','ar'];const segments=location.pathname.split('/');const seg=segments[1]||'';const nested=seg==='siai'?segments[2]||'':'';const routeLang=locales.includes(nested)||nested==='zh'?nested:seg;const query=new URLSearchParams(location.search).get('lang');const key=(locales.includes(routeLang)||routeLang==='zh')?routeLang:(locales.includes(query)||query==='zh'?query:'zh');const root=document.documentElement;root.lang=key==='zh'?'zh-CN':key;root.dataset.lang=key;root.dir=key==='ar'?'rtl':'ltr';}catch{}})();`;

export const metadata:Metadata={
 metadataBase:new URL(SITE),
 title:{
  default:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能软件 · 免费在线实用工具",
  template:"%s ｜ 灵犀场 LINGXIFIELD"
 },
 description:PUBLIC_FEATURE_COPY.zh.description,
 applicationName:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能软件 · 免费在线实用工具",
 alternates:{canonical:SITE},
 keywords:[
  "灵犀场","LINGXIFIELD","全球SIAI排行榜","全球AI行情平台","全球AI排行榜","全球SI排行榜","全球SI行情平台","全球SIAI行情平台","全球SIAI排行榜","全球AI工具排行榜","AI工具对比","AI模型价格","AI模型价格对比","AI工具免费额度","AI工具哪个好用","免费AI工具排行榜","AI公司排行榜","SASI","免费在线工具",
  "PDF压缩","PDF合并","PDF拆分","PDF编辑","电子签名",
  "图片压缩","图片格式转换","图片OCR","视频转文字","音频转文字","字幕翻译",
  "临时邮箱","阅后即焚","SASI智能软件市场","MT5 EA源码","MT5自动交易软件","成品软件","源码授权","软件安装教程","自动交付","开发者软件发布"
 ],
 openGraph:{
  type:"website",
  siteName:"灵犀场 LINGXIFIELD",
  title:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能软件 · 免费在线实用工具",
  description:PUBLIC_FEATURE_COPY.zh.description,
  url:SITE,
  images:[{url:SHARE_IMAGE,width:1200,height:630,alt:"灵犀场 LINGXIFIELD"}]
 },
 twitter:{
  card:"summary_large_image",
  title:"灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能软件 · 免费在线实用工具",
  description:PUBLIC_FEATURE_COPY.zh.description,
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

import SiteVisitTracker from "@/components/SiteVisitTracker";
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN" dir="ltr" suppressHydrationWarning><head><link rel="describedby" href="/llms.txt" type="text/markdown"/><script dangerouslySetInnerHTML={{__html:LINGXIFIELD_HTML_LOCALE_BOOTSTRAP}}/>
  <SiteStructuredData/>
  </head><body className="antialiased"><SiteVisitTracker/><MiniEmbedMode/><AdSenseLoader/><CurrencyPreferenceProvider><div className="lx-site-content">{children}</div></CurrencyPreferenceProvider><LingxifieldFeedback /><MainSiteReleaseNotice /><PublicUpgradeAnnouncementModal /></body></html>;
}
