import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";
import SasiAutonomousChat from "@/components/SasiAutonomousChat";
export const metadata={title:"SASI 自主工作台｜灵犀场",description:"整理内容、生成结构、把故事变成镜头方案；基础能力无需连接外部模型。"};
export default function ChatPage(){return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)] px-4 py-10 text-[var(--lx-ink)]"><div className="mx-auto mb-6 max-w-3xl"><Link href="/sasi">← 返回 SASI</Link></div><SasiAutonomousChat/></main><Footer/></>;}
