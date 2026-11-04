import {languageAlternates} from "@/lib/seo/global-seo";
import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
import ToolGuide from "@/components/seo/ToolGuide";
export const metadata:Metadata={title:"AI 视频音频检测｜灵犀场",description:"核验视频音频 C2PA 来源签名，可选分析视频抽取的三帧或录音开头最多12秒人声。结果仅作参考。",alternates:{canonical:"/tools/ai-video-audio-check",languages:languageAlternates("/tools/ai-video-audio-check")}};
export default function Page(){return <><MediaOriginStarter mode="media"/><ToolGuide slug="ai-video-audio-check"/></>;}
