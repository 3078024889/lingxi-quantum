import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCatalogClient from "@/app/products/ProductCatalogClient";

export const metadata:Metadata={
 title:"产品中心｜灵犀场 LINGXIFIELD",
 description:"从正在做的事进入：SASI、实用工具、余额与账户服务。",
 alternates:{canonical:"/products"},
};

export default function Page(){
 return <><Nav/><ProductCatalogClient/><Footer/></>;
}
