import type {Metadata} from "next";
import MediaOriginStarter from "@/components/tools/MediaOriginStarter";
export const metadata:Metadata={title:"AI 图片检测｜灵犀场",description:"上传图片，查看检测结果及是否能够识别文件格式。"};
export default function Page(){return <MediaOriginStarter mode="image"/>;}
