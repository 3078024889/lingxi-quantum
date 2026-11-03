import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DomainCenter from "@/components/domains/DomainCenter";

export const metadata: Metadata = {
  title: "全球域名中心｜域名查询、品牌命名与建站｜灵犀场",
  description: "搜索心仪的品牌域名，了解域名注册与续费服务，并使用 SASI 开始建设网站。",
  alternates: {canonical: "https://lingxifield.com/domains"},
  // Domain sales are not yet live. Enable SEO after registrar, pricing and compliance acceptance.
  robots: {index: false, follow: false},
};

export default function DomainsPage() {
  return <><Nav/><DomainCenter/><Footer/></>;
}
