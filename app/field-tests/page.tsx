import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FieldInsightsSection from "@/components/FieldInsightsSection";
import Bi from "@/components/Bi";

export const metadata: Metadata = {
  title: "场域精测｜灵犀场 LINGXIFIELD",
  description: "进入灵犀场的生命图谱、关系共振、生命韧性、财富创造地图等数字报告服务。",
  alternates: { canonical: "/field-tests" },
};

export default function FieldTestsPage() {
  return <><Nav /><main className="min-h-screen px-6 pb-24 pt-32"><section className="mx-auto max-w-6xl"><p className="font-display text-sm uppercase tracking-widest2 text-lattice">FIELD INSIGHTS</p><h1 className="mt-5 font-display text-5xl font-light text-bone sm:text-7xl"><Bi zh="场域精测" en="Field Insights" /></h1><p className="mt-6 max-w-2xl text-base leading-8 text-bone-dim"><Bi zh="这是 SASI 第二层中的个人数字报告空间。每项服务拥有独立输入、计算、报告与交付路径。" en="This is the personal digital-report layer beneath SASI. Every service has its own intake, calculation, report and delivery path." /></p><Link href="/" className="mt-8 inline-block border border-lattice/40 px-6 py-3 text-sm text-lattice"><Bi zh="返回 SASI" en="Back to SASI" /></Link></section><div className="mt-12"><FieldInsightsSection /></div></main><Footer /></>;
}
