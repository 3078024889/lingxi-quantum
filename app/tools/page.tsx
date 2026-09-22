import type { Metadata } from "next";
import ToolsHubV11 from "@/components/tools/ToolsHubV11";

export const metadata:Metadata={
  title:"灵犀场实用工具｜图片、PDF、视频、OCR 与隐私处理",
  description:"图片、PDF、OCR、视频、字幕、批量处理、隐私清理与更多实用工具。能本地完成的，优先留在浏览器本地。",
  alternates:{canonical:"/tools"}
};

export default function ToolsHubPage(){
  return <ToolsHubV11/>;
}
