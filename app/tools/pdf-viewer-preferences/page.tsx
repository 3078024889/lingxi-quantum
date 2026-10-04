import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfFinishingWorkbench from "@/components/tools/PdfFinishingWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 打开方式｜灵犀场",description:"设置 PDF 打开时的页面布局、书签/缩略图、窗口显示和阅读方向。",alternates:{canonical:"/tools/pdf-viewer-preferences",languages:languageAlternates("/tools/pdf-viewer-preferences")}};
export default function Page(){return <AdvancedToolPage title="PDF 打开方式" intro="设置 PDF 打开时的页面布局、侧栏和窗口显示方式。"><PdfFinishingWorkbench mode="viewer-preferences"/></AdvancedToolPage>}
