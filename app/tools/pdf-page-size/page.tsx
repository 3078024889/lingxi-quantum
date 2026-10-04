import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfDocumentWorkbench from "@/components/tools/PdfDocumentWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"调整 PDF 页面尺寸｜灵犀场",description:"把 PDF 页面统一调整为 A4、A3、Letter 或原始比例，自动居中并完整保留页面内容。",alternates:{canonical:"/tools/pdf-page-size",languages:languageAlternates("/tools/pdf-page-size")}};
export default function Page(){return <AdvancedToolPage title="调整 PDF 页面尺寸" intro="统一页面大小，内容自动缩放并居中，不裁掉边缘。"><PdfDocumentWorkbench mode="page-size"/></AdvancedToolPage>}
