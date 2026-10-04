import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructureInfoWorkbench from "@/components/tools/PdfStructureInfoWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 书签查看｜灵犀场",description:"查看 PDF 的书签层级和跳转页，不修改原文件。",alternates:{canonical:"/tools/pdf-bookmarks",languages:languageAlternates("/tools/pdf-bookmarks")}};
export default function Page(){return <AdvancedToolPage title="PDF 书签查看" intro="查看 PDF 的书签层级和跳转页，不修改原文件。"><PdfStructureInfoWorkbench mode="bookmarks"/></AdvancedToolPage>}
