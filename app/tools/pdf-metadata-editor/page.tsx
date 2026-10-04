import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfDocumentWorkbench from "@/components/tools/PdfDocumentWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"编辑 PDF 文件信息｜灵犀场",description:"查看并修改 PDF 标题、作者、主题和关键词，文件只在浏览器本地处理。",alternates:{canonical:"/tools/pdf-metadata-editor",languages:languageAlternates("/tools/pdf-metadata-editor")}};
export default function Page(){return <AdvancedToolPage title="编辑 PDF 文件信息" intro="修改 PDF 的标题、作者、主题和关键词。"><PdfDocumentWorkbench mode="metadata"/></AdvancedToolPage>}
