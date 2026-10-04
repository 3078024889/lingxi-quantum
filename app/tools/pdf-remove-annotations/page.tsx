import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfDocumentWorkbench from "@/components/tools/PdfDocumentWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"删除 PDF 批注｜灵犀场",description:"一次移除 PDF 中的高亮、便签、批注、标记等页面注释，文件在浏览器本地处理。",alternates:{canonical:"/tools/pdf-remove-annotations",languages:languageAlternates("/tools/pdf-remove-annotations")}};
export default function Page(){return <AdvancedToolPage title="删除 PDF 批注" intro="清掉高亮、便签和页面批注，正文内容保持不变。"><PdfDocumentWorkbench mode="remove-annotations"/></AdvancedToolPage>}
