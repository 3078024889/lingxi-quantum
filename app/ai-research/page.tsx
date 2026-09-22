import type { Metadata } from "next";
import Nav from "@/components/Nav";
import KnowledgeWorkspace from "@/components/KnowledgeWorkspace";
import Bi from "@/components/Bi";

export const metadata:Metadata={title:"灵犀场科研 SASI",description:"论文阅读与研究资料库。",alternates:{canonical:"/ai-research"}};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <p className="lx10-kicker"><Bi zh="科研 SASI" en="Research SASI"/></p>
    <h1 className="lx10-title"><Bi zh="让下一步研究，从可追溯的证据出发。" en="Let the next research step begin with traceable evidence."/></h1>
    <KnowledgeWorkspace mode="research"/>
  </div></main></>;
}
