import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfNicheWorkbench from "@/components/tools/PdfNicheWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 栅格化｜灵犀场",description:"把 PDF 页转换为图片，不等于安全脱敏。",alternates:{canonical:"/tools/pdf-rasterize",languages:languageAlternates("/tools/pdf-rasterize")}};
export default function Page(){return <AdvancedToolPage title={<LxText zh="PDF 栅格化" en="Rasterize PDF" ja="PDFを画像化" ko="PDF 이미지화" fr="Pixelliser un PDF" de="PDF rasterisieren" es="Rasterizar PDF" pt="Rasterizar PDF" ar="تحويل PDF إلى صور"/>} intro={<LxText zh="把 PDF 页转换为图片，不等于安全脱敏。" en="Convert PDF pages to images. This does not securely redact visible information." ja="PDFを画像化" ko="PDF 이미지화" fr="Pixelliser un PDF" de="PDF rasterisieren" es="Rasterizar PDF" pt="Rasterizar PDF" ar="تحويل PDF إلى صور"/>}><PdfNicheWorkbench mode="rasterize"/></AdvancedToolPage>}