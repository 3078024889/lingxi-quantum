import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructuralWorkbench from "@/components/tools/PdfStructuralWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 加密码｜灵犀场",description:"在浏览器本地为 PDF 添加 AES-256 密码保护，并可限制打印、修改和复制。",alternates:{canonical:"/tools/pdf-protect",languages:languageAlternates("/tools/pdf-protect")}};
export default function Page(){return <AdvancedToolPage title="PDF 加密码" intro="给 PDF 加密码，文件始终留在你的浏览器里。"><PdfStructuralWorkbench mode="protect"/></AdvancedToolPage>}
