import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata:Metadata={
  title:"灵犀场｜免费实用工具 · SASI创作 · AI工作区",
  description:"一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。免费实用工具、SASI创作与构建、书本SASI、学习SASI、科研SASI。",
  alternates:{canonical:"/"}
};

export default function Home(){
  return <><Nav/><HomeProblemHub/><Footer/></>;
}
