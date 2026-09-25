import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCatalogClient from "./ProductCatalogClient";

export const metadata:Metadata={
  title:"从这里开始｜灵犀场 LINGXIFIELD",
  description:"按你现在要解决的事情进入：AI短剧、书本与资料智能体、学习、科研、免费实用工具与余额。",
  alternates:{canonical:"/products"},
};

export default function Page(){
  return <><Nav/><ProductCatalogClient/><Footer/></>;
}
