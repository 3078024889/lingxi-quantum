import {languageAlternates} from "@/lib/seo/global-seo";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

export const metadata:Metadata={
 title:"灵犀场 LINGXIFIELD｜SASI全球多模型智能创作生态平台",
 description:"AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。",
 keywords:[
  "免费在线工具","PDF压缩","PDF合并","PDF拆分","图片压缩","视频转文字","OCR",
  "AI 短剧生成","书本智能体","文档智能体","学习智能体","科研智能体","AI 网站生成"
 ],
 alternates:{canonical:"/",languages:languageAlternates("/")}
};

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
