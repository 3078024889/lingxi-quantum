import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfStructuralWorkbench from "@/components/tools/PdfStructuralWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"解除 PDF 密码｜灵犀场",description:"输入你已知的 PDF 密码，在浏览器本地生成无需密码的副本。",alternates:{canonical:"/tools/pdf-unlock",languages:languageAlternates("/tools/pdf-unlock")}};
export default function Page(){return <AdvancedToolPage title="解除 PDF 密码" intro="知道原密码，就可以在本地解除保护，不上传文件。"><PdfStructuralWorkbench mode="unlock"/></AdvancedToolPage>}
