import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 转 Markdown｜灵犀场",description:"按页面提取 PDF 文本并生成 Markdown。",alternates:{canonical:"/tools/pdf-to-markdown",languages:languageAlternates("/tools/pdf-to-markdown")}};
export default function Page(){return <AdvancedToolPage title="PDF 转 Markdown" intro="按页面提取 PDF 文本并生成 Markdown。"><PdfExtraWorkbench mode="markdown"/></AdvancedToolPage>}
