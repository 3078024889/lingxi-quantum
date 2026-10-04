import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 裁边｜灵犀场",description:"按统一边距裁剪 PDF 页面可视区域。",alternates:{canonical:"/tools/pdf-crop",languages:languageAlternates("/tools/pdf-crop")}};
export default function Page(){return <AdvancedToolPage title="PDF 裁边" intro="按统一边距裁剪 PDF 页面可视区域。"><PdfExtraWorkbench mode="crop"/></AdvancedToolPage>}
