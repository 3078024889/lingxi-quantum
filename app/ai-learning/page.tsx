import type { Metadata } from "next";import Nav from "@/components/Nav";import Footer from "@/components/Footer";import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
export const metadata:Metadata={title:"灵犀场学习 SASI",description:"教材与笔记知识库。",alternates:{canonical:"/ai-learning"}};
export default function Page(){return <><Nav/><main className="lx10-page"><div className="lx10-wrap"><p className="lx10-kicker">学习 SASI</p><h1 className="lx10-title">把一次读懂，变成下一次可以找到。</h1><KnowledgeWorkspace mode="learning"/></div></main></>}
