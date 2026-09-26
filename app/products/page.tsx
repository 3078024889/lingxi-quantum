import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCatalogClient from "./ProductCatalogClient";

export const metadata:Metadata={
 title:"产品中心｜SASI、资料知识与实用工具｜灵犀场",
 description:"按现在要完成的事情进入：SASI 创作与构建、资料知识、学习研究、免费实用工具、创作余额与账户服务。",
 alternates:{canonical:"/products"},
};

export default function Page(){return <><Nav/><ProductCatalogClient/><Footer/></>;}
