import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoEffectsWorkbench from "@/components/tools/VideoEffectsWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"视频倒放｜灵犀场",
 description:"浏览器本地将视频和可选音频倒放，可调整倒放速度并导出 MP4。",
 alternates:{canonical:"/tools/reverse-video",languages:languageAlternates("/tools/reverse-video")}
};

export default function Page(){
 return <AdvancedToolPage title="视频倒放" intro="浏览器本地将视频和可选音频倒放，可调整倒放速度并导出 MP4。"><VideoEffectsWorkbench mode="reverse"/></AdvancedToolPage>
}
