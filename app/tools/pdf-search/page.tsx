import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfSearchWorkbench from "@/components/tools/PdfSearchWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"PDF 全文搜索｜灵犀场",
 description:"批量搜索多个 PDF 的文本层，支持大小写和正则表达式，并导出命中页面 CSV。",
 alternates:{canonical:"/tools/pdf-search",languages:languageAlternates("/tools/pdf-search")}
};

export default function Page(){
 return <AdvancedToolPage title="PDF 全文搜索" intro="批量搜索多个 PDF 的文本层，支持大小写和正则表达式，并导出命中页面 CSV。"><PdfSearchWorkbench/></AdvancedToolPage>
}
