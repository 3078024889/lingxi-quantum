import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfHalvePagesWorkbench from "@/components/tools/PdfHalvePagesWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";

export const metadata:Metadata={
 title:"PDF 页面拆半｜灵犀场",
 description:"把双页扫描、A3 横版或长页面从中间拆成两个独立 PDF 页面，尽量保留原始 PDF 内容。",
 alternates:{canonical:"/tools/pdf-halve-pages",languages:languageAlternates("/tools/pdf-halve-pages")}
};

export default function Page(){
 return <AdvancedToolPage title="PDF 页面拆半" intro="把双页扫描、A3 横版或长页面从中间拆成两个独立 PDF 页面，尽量保留原始 PDF 内容。"><PdfHalvePagesWorkbench/></AdvancedToolPage>
}
