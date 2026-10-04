import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfFinishingWorkbench from "@/components/tools/PdfFinishingWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 叠加｜灵犀场",description:"把一份 PDF 页面叠加到另一份 PDF，适合抬头纸、背景和统一模板。",alternates:{canonical:"/tools/pdf-overlay",languages:languageAlternates("/tools/pdf-overlay")}};
export default function Page(){return <AdvancedToolPage title="PDF 叠加" intro="把抬头纸、背景或模板直接叠加到 PDF 页面。"><PdfFinishingWorkbench mode="overlay"/></AdvancedToolPage>}
