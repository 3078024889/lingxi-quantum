import type { Metadata } from "next";
import TempMailWorkbench from "@/components/tools/TempMailWorkbench";
import ToolVisualStory from "@/components/tools/ToolVisualStory";

export const metadata:Metadata={
 title:"临时邮箱｜即开即用、接收验证码与临时通知｜灵犀场",
 description:"灵犀场临时邮箱用于短期注册、验证码、下载链接和一次性通知。生成后直接收信，不必暴露常用邮箱；重要账号仍建议使用长期邮箱。",
 alternates:{canonical:"/tools/temp-mail"},
};

const images=Array.from({length:9},(_,i)=>({
 src:`/images/tool-stories/temp-mail/temp-mail-${String(i+1).padStart(2,"0")}.webp`,
 alt:`灵犀场临时邮箱使用说明 ${i+1}`,
}));

export default function Page(){
 return <main className="lx11-page"><div className="lx11-wrap py-10">
  <TempMailWorkbench/>
  <ToolVisualStory eyebrow="LINGXIFIELD · TEMP MAIL" title="临时用途和常用邮箱分开，收完即走。"
   intro="适合临时注册、验证码、下载链接、测试通知等短期场景。下面用真实场景说明什么时候适合用、怎么用，以及哪些重要账号不建议使用临时邮箱。"
   images={images}/>
 </div></main>;
}
