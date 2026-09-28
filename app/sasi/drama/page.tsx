import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";
export const metadata:Metadata={title:"SASI 短剧与视频创作｜灵犀场",description:"把剧本、图片和素材直接拖进来，描述想完成的结果。",alternates:{canonical:"/sasi/drama"}};
export default function Page(){return <><Nav/><SasiChatCreationStudio mode="drama"/><Footer/></>}
