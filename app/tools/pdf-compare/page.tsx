import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 比较｜灵犀场",description:"比较两个 PDF 的文本层并按页面导出差异。",alternates:{canonical:"/tools/pdf-compare",languages:languageAlternates("/tools/pdf-compare")}};
export default function Page(){return <AdvancedToolPage title="PDF 比较" intro="比较两个 PDF 的文本层并按页面导出差异。"><PdfExtraWorkbench mode="compare"/></AdvancedToolPage>}
