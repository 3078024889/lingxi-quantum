import {languageAlternates} from "@/lib/seo/global-seo";
import type { Metadata } from "next";
import TempMailWorkbench from "@/components/tools/TempMailWorkbench";
import ToolPromoStrip from "@/components/tools/ToolPromoStrip";

export const metadata:Metadata={
 title:"临时邮箱｜即开即用、接收验证码与临时通知｜灵犀场",
 description:"灵犀场临时邮箱用于短期注册、验证码、下载链接和一次性通知。生成后直接收信，不必暴露常用邮箱；重要账号仍建议使用长期邮箱。",
 alternates:{canonical:"/tools/temp-mail",languages:languageAlternates("/tools/temp-mail")} ,
};

const images=Array.from({length:9},(_,i)=>({
 src:`/images/tool-stories/temp-mail/temp-mail-${String(i+1).padStart(2,"0")}.webp`,
 alt:`灵犀场临时邮箱使用说明 ${i+1}`,
}));

export default function Page(){
 return <main className="lx11-page"><div className="lx11-wrap py-10">
  <ToolPromoStrip eyebrow="LINGXIFIELD · TEMP MAIL" title="临时邮箱：9 个真实使用场景，一眼看懂怎么用。"
   intro="临时注册、验证码、下载链接与测试通知分开处理。图片已采用紧凑横向浏览，不再把页面拉得很长。"
   images={images}/>
  <TempMailWorkbench/>
 </div></main>;
}