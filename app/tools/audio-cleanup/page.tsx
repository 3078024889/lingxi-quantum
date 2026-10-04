import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import AudioCleanupWorkbench from "@/components/tools/AudioCleanupWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"音频降噪 / 人声增强｜灵犀场",
 description:"本地降低背景噪声、低频嗡声并进行响度标准化，支持音频和视频中的音轨。",
 alternates:{canonical:"/tools/audio-cleanup",languages:languageAlternates("/tools/audio-cleanup")}
};

export default function Page(){
 return <AdvancedToolPage title="音频降噪 / 人声增强" intro="本地降低背景噪声、低频嗡声并进行响度标准化，支持音频和视频中的音轨。"><AudioCleanupWorkbench/></AdvancedToolPage>
}
