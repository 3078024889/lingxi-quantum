import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata:Metadata={
  title:"灵犀场｜AI创作 · 资料智能体 · 免费实用工具",
  description:"灵犀场是一个会随着你的问题、资料与创作继续生长的场智能体。把一个念头、一份文件或一个现实问题交给它，继续推进到可使用的结果。",
  alternates:{canonical:"/"}
};

export default function Home(){
  return <><Nav/><HomeProblemHub/><Footer/></>;
}
