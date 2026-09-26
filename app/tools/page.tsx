import type { Metadata } from "next";
import ToolsHubV11 from "@/components/tools/ToolsHubV11";

export const metadata:Metadata={
  title:"灵犀场免费实用工具｜PDF、图片、视频、OCR 与文件处理",
  description:"免费实用工具：PDF、图片、视频、OCR、字幕、批量处理、隐私清理与更多在线工具。能在直接完成的任务优先本地处理。",
  alternates:{canonical:"/tools"}
};

export default function ToolsHubPage(){
  return <ToolsHubV11/>;
}
