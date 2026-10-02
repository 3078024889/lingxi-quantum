import ToolGuide from "@/components/seo/ToolGuide";
import {languageAlternates} from "@/lib/seo/global-seo";
import type { Metadata } from "next";
import BurnAfterReadWorkbench from "@/components/tools/BurnAfterReadWorkbench";
import ToolPromoStrip from "@/components/tools/ToolPromoStrip";

export const metadata:Metadata={
 title:"阅后即焚｜文字、文件与临时链接｜灵犀场",
 description:"把文字或文件生成临时访问链接，可按时间或查看次数失效。适合临时报价、草稿、资料与敏感信息的短期分享；重要资料请自行保留原件。",
 alternates:{canonical:"/tools/burn-after-read",languages:languageAlternates("/tools/burn-after-read")} ,
};

const images=Array.from({length:9},(_,i)=>({
 src:`/images/tool-stories/burn-after-read/burn-after-read-${String(i+1).padStart(2,"0")}.webp`,
 alt:`灵犀场阅后即焚使用说明 ${i+1}`,
}));

export default function Page(){
 return <main className="lx11-page"><div className="lx11-wrap py-10">
  <ToolPromoStrip eyebrow="LINGXIFIELD · PRIVATE SHARE" title="阅后即焚：9 个场景放在页面上方，一排浏览。"
   intro="文字、文件与临时资料可生成短期链接；按时间或查看次数失效。视觉说明改为紧凑横向展示。"
   images={images}/>
  <BurnAfterReadWorkbench/>
 </div><ToolGuide slug="burn-after-read"/></main>;
}