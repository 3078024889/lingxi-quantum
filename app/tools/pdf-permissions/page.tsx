import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructuralWorkbench from "@/components/tools/PdfStructuralWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 权限设置｜灵犀场",description:"设置 PDF 的打印、修改和复制权限，浏览器本地完成。",alternates:{canonical:"/tools/pdf-permissions",languages:languageAlternates("/tools/pdf-permissions")}};
export default function Page(){return <AdvancedToolPage title="PDF 权限设置" intro="控制别人能否打印、修改或复制内容。"><PdfStructuralWorkbench mode="permissions"/></AdvancedToolPage>}
