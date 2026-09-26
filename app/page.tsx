import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

export const metadata:Metadata={
 title:"灵犀场｜SASI 创作 · 资料知识 · 免费实用工具",
 description:"从一个文件、一张图片、一段视频、一本书或一个还没理清的想法开始。灵犀场提供 SASI 创作、资料知识、学习研究和一组打开就能用的实用工具。",
 alternates:{canonical:"/"}
};

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
