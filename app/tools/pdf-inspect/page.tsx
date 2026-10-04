import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructureInfoWorkbench from "@/components/tools/PdfStructureInfoWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 结构检查｜灵犀场",description:"查看 PDF 页数、附件、书签和结构检查信息，文件不上传。",alternates:{canonical:"/tools/pdf-inspect",languages:languageAlternates("/tools/pdf-inspect")}};
export default function Page(){return <AdvancedToolPage title="PDF 结构检查" intro="查看 PDF 页数、附件、书签和结构检查信息，文件不上传。"><PdfStructureInfoWorkbench mode="inspect"/></AdvancedToolPage>}
