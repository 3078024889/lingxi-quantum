import type { Metadata } from "next";import Nav from "@/components/Nav";import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
export const metadata:Metadata={title:"灵犀场科研助手",description:"论文阅读与研究资料库。",alternates:{canonical:"/ai-research"}};
export default function Page(){return <><Nav/><main className="lx10-page"><div className="lx10-wrap"><p className="lx10-kicker">科研助手</p><h1 className="lx10-title">让下一步研究，从可追溯的证据出发。</h1><KnowledgeWorkspace mode="research"/></div></main></>}
