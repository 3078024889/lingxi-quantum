import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";

export const metadata:Metadata={
 title:"实用工具与 SASI 任务首页｜灵犀场 LINGXIFIELD",
 description:"从灵犀场任务首页使用 PDF、图片、视频、SASI 创作、书本问答、学习与科研工具。",
 alternates:{canonical:"/start"}
};
export default function StartHome(){return <><Nav/><HomeProblemHub/><Footer/></>;}
