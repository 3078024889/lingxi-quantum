import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoTranslateWorkbench from "@/components/tools/VideoTranslateWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"视频翻译｜批量视频、链接翻译、字幕与 AI 配音｜灵犀场",
 description:"批量上传视频或导入支持的公开视频链接，自动转写并翻译，导出带翻译字幕的视频、SRT/VTT/TXT，可选 AI 配音。按起始分钟计费。",
 alternates:{canonical:"/tools/video-translate",languages:languageAlternates("/tools/video-translate")}
};

export default function Page(){
 return <AdvancedToolPage
  title="视频翻译"
  intro="批量上传视频或导入支持的公开视频链接，自动识别语音并翻译。可导出带翻译字幕的高质量 MP4、SRT/VTT/TXT，并可选 AI 配音。按起始分钟计费，执行前先确认价格。"
 ><VideoTranslateWorkbench/></AdvancedToolPage>
}
