import type {Metadata} from "next";import Nav from "@/components/Nav";import Footer from "@/components/Footer";import SasiByokImageStudio from "@/components/SasiByokImageStudio";
export const metadata:Metadata={title:"SASI 图片生成｜灵犀场",description:"输入一句描述，生成封面、故事卡、概念图和信息视觉。写下你想看到的画面，确认费用后开始生成。",alternates:{canonical:"/sasi/image"}};
export default function Page(){return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)]"><SasiByokImageStudio/></main><Footer/></>}
