import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 加水印｜灵犀场",description:"给 PDF 每页添加可见文字水印。",alternates:{canonical:"/tools/pdf-watermark",languages:languageAlternates("/tools/pdf-watermark")}};
export default function Page(){return <AdvancedToolPage title="PDF 加水印" intro="给 PDF 每页添加可见文字水印。"><PdfExtraWorkbench mode="watermark"/></AdvancedToolPage>}
