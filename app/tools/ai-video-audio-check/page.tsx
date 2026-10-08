import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
export const metadata:Metadata={title:"AI 视频音频来源初检｜灵犀场",description:"免费检查视频音频文件格式与来源验证途径，不把格式线索冒充 AI 鉴定。"};
export default function Page(){return <MediaOriginStarter mode="media"/>;}
