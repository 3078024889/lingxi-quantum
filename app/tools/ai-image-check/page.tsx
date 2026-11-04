import {languageAlternates} from "@/lib/seo/global-seo";
import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
import ToolGuide from "@/components/seo/ToolGuide";
export const metadata:Metadata={title:"AI 图片检测｜灵犀场",description:"核验 C2PA 图片来源签名，按需查看本机 AI 图像特征检测结果。分数不代表真实性证明。",alternates:{canonical:"/tools/ai-image-check",languages:languageAlternates("/tools/ai-image-check")}};
export default function Page(){return <><MediaOriginStarter mode="image"/><ToolGuide slug="ai-image-check"/></>;}
