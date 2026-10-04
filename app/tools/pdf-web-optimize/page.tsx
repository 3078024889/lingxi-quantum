import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructuralWorkbench from "@/components/tools/PdfStructuralWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 网页快速打开｜灵犀场",description:"重新整理 PDF 结构，让网页中第一页更快显示。浏览器本地完成，不上传文件。",alternates:{canonical:"/tools/pdf-web-optimize",languages:languageAlternates("/tools/pdf-web-optimize")}};
export default function Page(){return <AdvancedToolPage title="PDF 网页快速打开" intro="优化 PDF 打开顺序，让网页预览更快看到第一页。"><PdfStructuralWorkbench mode="linearize"/></AdvancedToolPage>}
