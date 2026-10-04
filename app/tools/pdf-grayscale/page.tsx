import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfDocumentWorkbench from "@/components/tools/PdfDocumentWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 转灰度｜灵犀场",description:"把彩色 PDF 转成黑白灰，适合打印、归档和降低彩色打印成本。",alternates:{canonical:"/tools/pdf-grayscale",languages:languageAlternates("/tools/pdf-grayscale")}};
export default function Page(){return <AdvancedToolPage title="PDF 转灰度" intro="把整份 PDF 统一转成黑白灰，适合打印和归档。"><PdfDocumentWorkbench mode="grayscale"/></AdvancedToolPage>}
