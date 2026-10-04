import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/","灵犀场 LINGXIFIELD｜SASI全球多模型智能创作平台","SASI 多模型智能创作与在线实用工具平台。提供 PDF电子签名、PDF处理、图片去水印、OCR、视频转文字、字幕翻译、临时邮箱、阅后即焚、书本/学习/科研 SASI 等入口。");

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
