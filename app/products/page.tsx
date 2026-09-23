import type {Metadata} from "next";
import ProductCatalogClient from "./ProductCatalogClient";
export const metadata:Metadata={
 title:"产品与价格｜灵犀场 LINGXIFIELD",
 description:"灵犀场真实数字服务目录：产品名称、价格、交付方式、购买入口、退款与售后说明。",
 alternates:{canonical:"/products"},
};
export default function Page(){return <ProductCatalogClient/>;}
