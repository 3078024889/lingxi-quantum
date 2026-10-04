import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructureInfoWorkbench from "@/components/tools/PdfStructureInfoWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 附件管理｜灵犀场",description:"查看、添加或移除 PDF 内嵌附件，全部在浏览器本地完成。",alternates:{canonical:"/tools/pdf-attachments",languages:languageAlternates("/tools/pdf-attachments")}};
export default function Page(){return <AdvancedToolPage title="PDF 附件管理" intro="查看、添加或移除 PDF 内嵌附件，全部在浏览器本地完成。"><PdfStructureInfoWorkbench mode="attachments"/></AdvancedToolPage>}
