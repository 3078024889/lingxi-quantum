import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
export const metadata: Metadata = { title: "灵犀场 AI科研助手｜论文阅读与研究资料库", description: "整理论文、书籍与实验记录，检索原文、定位出处，构建有证据的研究资料库。", alternates: { canonical: "/ai-research" } };
export default function Page() { return <><Nav /><main className="mx-auto max-w-6xl px-6 py-20"><h1 className="text-4xl font-semibold">灵犀场 AI科研助手</h1><p className="mt-5 text-lg">让下一步研究，从可追溯的证据出发。</p><KnowledgeWorkspace mode="research" /></main><Footer /></>; }
