import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolJobResultsClient from "@/components/tools/ToolJobResultsClient";

export const metadata:Metadata={
  title:"工具任务与已保存结果｜灵犀场 LINGXIFIELD",
  robots:{index:false,follow:false},
};

export default function Page({searchParams}:{searchParams?:{quoteId?:string}}){
  const quoteId=String(searchParams?.quoteId||"");
  return <><Nav/><main className="pt-24"><div className="mx-auto max-w-3xl px-6 pb-24"><ToolJobResultsClient quoteId={quoteId}/></div></main><Footer/></>;
}
