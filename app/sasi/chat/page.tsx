import Link from "next/link";
import SasiChat from "../SasiChat";
export const metadata = { title: "SASI 通用对话", description: "从一个问题，到一个好想法。解释知识、写作、编程和创作方案。" };
export default function ChatPage() { return <main className="min-h-screen bg-[#fafaff] px-4 py-10 text-[#242334]"><div className="mx-auto mb-6 max-w-3xl"><Link href="/">← 返回创作工作台</Link></div><SasiChat /></main>; }
