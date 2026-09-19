import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
export const metadata: Metadata = { title: "灵犀场 AI学习助手｜教材与笔记知识库", description: "整理教材、笔记与错题资料，在本机检索知识点与原文出处。", alternates: { canonical: "/ai-learning" } };
export default function Page() { return <><Nav /><main className="mx-auto max-w-6xl px-6 py-20"><h1 className="text-4xl font-semibold">灵犀场 AI学习助手</h1><p className="mt-5 text-lg">把一次读懂，变成下一次可以找到。</p><KnowledgeWorkspace mode="learning" /></main><Footer /></>; }
