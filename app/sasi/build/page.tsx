import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SasiChatCreationStudio from "@/components/SasiChatCreationStudio";

export const metadata:Metadata={
  title:"SASI 网站构建｜灵犀场",
  description:"描述你想要的网站，加入资料与图片，生成可预览、可下载并可继续完善的网站结果。",
  alternates:{canonical:"/sasi/build"},
};

export default function Page(){
  return <><Nav/><SasiChatCreationStudio mode="website"/><Footer/></>;
}
