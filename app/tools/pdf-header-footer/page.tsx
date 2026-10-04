import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfFinishingWorkbench from "@/components/tools/PdfFinishingWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 页眉页脚｜灵犀场",description:"给 PDF 添加统一页眉、页脚和页码。",alternates:{canonical:"/tools/pdf-header-footer",languages:languageAlternates("/tools/pdf-header-footer")}};
export default function Page(){return <AdvancedToolPage title="PDF 页眉页脚" intro="给整份 PDF 添加统一页眉、页脚和页码。"><PdfFinishingWorkbench mode="header-footer"/></AdvancedToolPage>}
