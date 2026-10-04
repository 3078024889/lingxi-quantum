import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/","灵犀场｜PDF、图片与实用工具","处理 PDF、图片、视频和文字，整理资料并围绕原文提问。各项功能的处理方式和费用在使用前说明。");

export default function Home(){return <><Nav/><HomeProblemHub/><Footer/></>;}
