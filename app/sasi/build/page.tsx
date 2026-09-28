import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
export const metadata:Metadata={title:"SASI 网站构建｜灵犀场",description:"描述网站目标，拖入品牌资料、图片、文档或代码，直接开始构建。",alternates:{canonical:"/sasi/build"}};
export default function Page(){return <><Nav/><SasiChatCreationStudio mode="website"/><Footer/></>}
