import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import VideoEffectsWorkbench from "@/components/tools/VideoEffectsWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"视频定格 / Stop Motion｜灵犀场",
 description:"按时间间隔抽帧重新组成定格视频，可追加倒放生成 Boomerang 效果。",
 alternates:{canonical:"/tools/stop-motion-video",languages:languageAlternates("/tools/stop-motion-video")}
};

export default function Page(){
 return <AdvancedToolPage title="视频定格 / Stop Motion" intro="按时间间隔抽帧重新组成定格视频，可追加倒放生成 Boomerang 效果。"><VideoEffectsWorkbench mode="stop-motion"/></AdvancedToolPage>
}
