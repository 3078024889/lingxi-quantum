import {languageAlternates} from "@/lib/seo/global-seo";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

export const metadata:Metadata={
 title:"灵犀场｜免费实用工具 · AI 短剧 · SASI 智能体",
 description:"PDF、图片、视频、字幕、OCR 与文件处理，以及 AI 短剧生成、书本与文档 SASI、学习 SASI、科研 SASI、网站与应用构建。",
 keywords:[
  "免费在线工具","PDF压缩","PDF合并","PDF拆分","图片压缩","视频转文字","OCR",
  "AI 短剧生成","书本智能体","文档智能体","学习智能体","科研智能体","AI 网站生成"
 ],
 alternates:{canonical:"/",languages:languageAlternates("/")} 
};

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
