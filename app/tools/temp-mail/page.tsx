import type { Metadata } from "next";
import TempMailWorkbench from "@/components/tools/TempMailWorkbench";
export const metadata:Metadata={title:"10分钟临时邮箱｜灵犀场",description:"生成一个只用于临时收信的邮箱地址，到期后邮箱与收件内容自动销毁。",alternates:{canonical:"/tools/temp-mail"}};
export default function Page(){return <main className="lx11-page"><div className="lx11-wrap py-10"><TempMailWorkbench/></div></main>}
