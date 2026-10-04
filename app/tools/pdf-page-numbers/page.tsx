import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 加页码｜灵犀场",description:"给 PDF 批量添加页码。",alternates:{canonical:"/tools/pdf-page-numbers",languages:languageAlternates("/tools/pdf-page-numbers")}};
export default function Page(){return <AdvancedToolPage title="PDF 加页码" intro="给 PDF 批量添加页码。"><PdfExtraWorkbench mode="page-numbers"/></AdvancedToolPage>}
