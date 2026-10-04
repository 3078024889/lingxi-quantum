import type {Metadata} from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import HandwritingOcrWorkbench from "@/components/tools/HandwritingOcrWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"手写文字识别｜灵犀场",description:"上传手写笔记、课堂笔记、表单或扫描图片，支持英文 TrOCR 手写模型和多语言 OCR，并可导出 TXT / Word。",alternates:{canonical:"/tools/handwriting-ocr",languages:languageAlternates("/tools/handwriting-ocr")}};
export default function Page(){return <AdvancedToolPage title="手写文字识别" intro="上传手写笔记、课堂笔记、表单或扫描图片，支持英文 TrOCR 手写模型和多语言 OCR，并可导出 TXT / Word。"><HandwritingOcrWorkbench/></AdvancedToolPage>}
