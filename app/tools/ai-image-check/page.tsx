import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
export const metadata:Metadata={title:"AI 图片检测｜灵犀场",description:"免费检查图片文件头，并前往官方 C2PA 来源验证。不会伪造 AI 真假检测结论。"};
export default function Page(){return <MediaOriginStarter mode="image"/>;}
