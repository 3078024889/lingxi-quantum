import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfFinishingWorkbench from "@/components/tools/PdfFinishingWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF Bates 编号｜灵犀场",description:"给合同、证据材料和归档 PDF 添加连续 Bates 编号。",alternates:{canonical:"/tools/pdf-bates-numbering",languages:languageAlternates("/tools/pdf-bates-numbering")}};
export default function Page(){return <AdvancedToolPage title="PDF Bates 编号" intro="给整份 PDF 添加连续、固定格式的归档编号。"><PdfFinishingWorkbench mode="bates"/></AdvancedToolPage>}
