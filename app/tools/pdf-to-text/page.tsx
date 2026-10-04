import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 转 TXT｜灵犀场",description:"提取 PDF 文本层并导出纯文本。",alternates:{canonical:"/tools/pdf-to-text",languages:languageAlternates("/tools/pdf-to-text")}};
export default function Page(){return <AdvancedToolPage title="PDF 转 TXT" intro="提取 PDF 文本层并导出纯文本。"><PdfExtraWorkbench mode="text"/></AdvancedToolPage>}
