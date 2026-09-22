import type { Metadata } from "next";
import Nav from "@/components/Nav";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import Bi from "@/components/Bi";

export const metadata:Metadata={title:"灵犀场学习 SASI",description:"教材与笔记知识库。",alternates:{canonical:"/ai-learning"}};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <p className="lx10-kicker"><Bi zh="学习 SASI" en="Learning SASI"/></p>
    <h1 className="lx10-title"><Bi zh="把一次读懂，变成下一次可以找到。" en="Turn one moment of understanding into something you can find again."/></h1>
    <KnowledgeWorkspace mode="learning"/>
  </div></main></>;
}
