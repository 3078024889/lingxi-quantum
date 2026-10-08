import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
export const metadata:Metadata={title:"AI 视频音频检测｜灵犀场",description:"选择视频或音频文件，查看检测结果和文件格式。"};
export default function Page(){return <MediaOriginStarter mode="media"/>;}
