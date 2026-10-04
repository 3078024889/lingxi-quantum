import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfToWordWorkbench from "@/components/tools/PdfToWordWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 转 Word｜灵犀场",description:"文本型 PDF 优先提取可编辑文字；扫描型 PDF 可自动 OCR。可同时生成可编辑 DOCX 与版式保真 DOCX。",alternates:{canonical:"/tools/pdf-to-word",languages:languageAlternates("/tools/pdf-to-word")}};
export default function Page(){return <AdvancedToolPage title="PDF 转 Word" intro="文本型 PDF 优先提取可编辑文字；扫描型 PDF 可自动 OCR。可同时生成可编辑 DOCX 与版式保真 DOCX。"><PdfToWordWorkbench/></AdvancedToolPage>}
