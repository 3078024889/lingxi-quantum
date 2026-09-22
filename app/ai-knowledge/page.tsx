import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Bi from "@/components/Bi";

export const metadata:Metadata={title:"灵犀场书本 SASI",description:"让书本、论文与资料变成可检索、可追溯的私人知识。",alternates:{canonical:"/ai-knowledge"}};

export default function Page(){
  return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
    <p className="lx10-kicker"><Bi zh="书本 SASI" en="Book SASI"/></p>
    <h1 className="lx10-title"><Bi zh="让资料活起来。" en="Bring your sources to life."/></h1>
    <p className="lx10-lead"><Bi zh="把书、论文、教材与私人资料放进来。先找到原文，再回答、比较、学习与继续研究。" en="Bring in books, papers, study materials and private sources. Find the original text first, then answer, compare, learn and continue researching."/></p>
    <div className="lx10-divider"/>
    <div className="lx10-grid">
      <Link href="/ai-learning" className="lx10-card lg">
        <h2><Bi zh="学习 SASI" en="Learning SASI"/></h2>
        <p><Bi zh="教材、试卷、错题与笔记，围绕真实原文建立自己的学习资料库。" en="Build your own study library around real source text from textbooks, papers, mistakes and notes."/></p>
        <div className="meta"><Bi zh="进入 →" en="Enter →"/></div>
      </Link>
      <Link href="/ai-research" className="lx10-card lg">
        <h2><Bi zh="科研 SASI" en="Research SASI"/></h2>
        <p><Bi zh="论文、书籍与实验记录集中检索、定位出处、比较证据。" en="Search papers, books and experiment records together, locate sources and compare evidence."/></p>
        <div className="meta"><Bi zh="进入 →" en="Enter →"/></div>
      </Link>
    </div>
  </div></main></>;
}
