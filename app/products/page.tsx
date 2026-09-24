import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCatalogClient from "./ProductCatalogClient";

export const metadata: Metadata = {
  title: "产品中心｜灵犀场 LINGXIFIELD",
  description: "灵犀场产品中心：账户充值、AI 服务、SASI 创作余额、数字报告与其他在线数字服务。",
  alternates: { canonical: "/products" },
};

export default function Page() {
  return (
    <>
      <Nav />
      <ProductCatalogClient />
      <Footer />
    </>
  );
}
