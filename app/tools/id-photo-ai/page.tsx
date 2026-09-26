import type { Metadata } from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import IdPhotoAiWorkbench from "@/components/tools/IdPhotoAiWorkbench";
import ToolVisualStory from "@/components/tools/ToolVisualStory";

export const metadata:Metadata={
 title:"证件照换背景与常用尺寸｜灵犀场",
 description:"上传正面清晰照片，生成白、蓝、红等常用背景和常见证件尺寸电子照。不同证件要求可能不同，提交前请以对应机构最新规范为准。",
 alternates:{canonical:"/tools/id-photo-ai"},
};

const images=[{
 src:"/images/tool-stories/id-photo/id-photo-01.webp",
 alt:"灵犀场证件照常用底色、尺寸与使用场景说明",
}];

export default function Page(){
 return <AdvancedToolPage title="证件照换背景与常用尺寸" intro="上传一张清晰正面照片，选择背景和尺寸，生成可下载的电子证件照。">
  <IdPhotoAiWorkbench/>
  <ToolVisualStory eyebrow="LINGXIFIELD · ID PHOTO" title="一张照片，准备多种常用规格。"
   intro="白底、蓝底、红底与常用报名、简历、护照签证尺寸集中说明。正式提交前，请以对应机构最新照片规范为准。"
   images={images}/>
 </AdvancedToolPage>;
}
