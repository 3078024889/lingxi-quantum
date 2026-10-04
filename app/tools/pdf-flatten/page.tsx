import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfExtraWorkbench from "@/components/tools/PdfExtraWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 扁平化｜灵犀场",description:"将表单字段写入页面内容，生成更适合提交和归档的 PDF。",alternates:{canonical:"/tools/pdf-flatten",languages:languageAlternates("/tools/pdf-flatten")}};
export default function Page(){return <AdvancedToolPage title="PDF 扁平化" intro="将表单字段写入页面内容，生成更适合提交和归档的 PDF。"><PdfExtraWorkbench mode="flatten"/></AdvancedToolPage>}
