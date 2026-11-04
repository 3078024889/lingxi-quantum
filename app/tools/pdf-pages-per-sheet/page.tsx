import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfNicheWorkbench from "@/components/tools/PdfNicheWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"PDF 多页合一｜灵犀场",description:"把 2、4、6 或 9 页排到一张 A4，保留清晰可搜索文字。",alternates:{canonical:"/tools/pdf-pages-per-sheet",languages:languageAlternates("/tools/pdf-pages-per-sheet")}};
export default function Page(){return <AdvancedToolPage title={<LxText zh="PDF 多页合一" en="PDF Pages per Sheet" ja="PDFページを1枚にまとめる" ko="PDF 여러 페이지를 한 장에" fr="Plusieurs pages PDF par feuille" de="Mehrere PDF-Seiten pro Blatt" es="Varias páginas PDF por hoja" pt="Várias páginas PDF por folha" ar="دمج صفحات PDF في ورقة"/>} intro={<LxText zh="把 2、4、6 或 9 页排到一张 A4，保留清晰可搜索文字。" en="Combine 2, 4, 6 or 9 pages on A4 while keeping searchable vector text." ja="PDFページを1枚にまとめる" ko="PDF 여러 페이지를 한 장에" fr="Plusieurs pages PDF par feuille" de="Mehrere PDF-Seiten pro Blatt" es="Varias páginas PDF por hoja" pt="Várias páginas PDF por folha" ar="دمج صفحات PDF في ورقة"/>}><PdfNicheWorkbench mode="nup"/></AdvancedToolPage>}