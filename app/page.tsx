import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/","灵犀场 LINGXIFIELD｜SASI全球多模型智能创作平台","100+在线实用工具＋SASI创作。PDF、图片、视频音频、文件表格与隐私工具，以及短剧视频生成、网站构建、书本、学习与科研多模型创作。");

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
