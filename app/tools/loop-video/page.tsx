import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoEffectsWorkbench from "@/components/tools/VideoEffectsWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"视频循环｜灵犀场",
 description:"把视频重复 2–20 次并导出连续 MP4，适合循环背景、展示动画和短视频。",
 alternates:{canonical:"/tools/loop-video",languages:languageAlternates("/tools/loop-video")}
};

export default function Page(){
 return <AdvancedToolPage title="视频循环" intro="把视频重复 2–20 次并导出连续 MP4，适合循环背景、展示动画和短视频。"><VideoEffectsWorkbench mode="loop"/></AdvancedToolPage>
}
