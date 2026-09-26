import type {Metadata} from "next";import Nav from "@/components/Nav";import Footer from "@/components/Footer";import SasiAutonomousImageStudio from "@/components/SasiAutonomousImageStudio";
export const metadata:Metadata={title:"SASI 自主图片｜灵犀场",description:"输入一句描述，生成封面、故事卡、概念图和信息视觉。基础生成无需连接外部模型。",alternates:{canonical:"/sasi/image"}};
export default function Page(){return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)]"><SasiAutonomousImageStudio/></main><Footer/></>}
