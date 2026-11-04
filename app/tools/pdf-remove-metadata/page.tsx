import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfNicheWorkbench from "@/components/tools/PdfNicheWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={title:"清理 PDF 元数据｜灵犀场",description:"清除标题、作者、XMP 等属性，不会删除页面上的个人信息。",alternates:{canonical:"/tools/pdf-remove-metadata",languages:languageAlternates("/tools/pdf-remove-metadata")}};
export default function Page(){return <AdvancedToolPage title={<LxText zh="清理 PDF 元数据" en="Remove PDF Metadata" ja="PDFメタデータを削除" ko="PDF 메타데이터 제거" fr="Supprimer les métadonnées PDF" de="PDF-Metadaten entfernen" es="Quitar metadatos PDF" pt="Remover metadados PDF" ar="إزالة بيانات PDF الوصفية"/>} intro={<LxText zh="清除标题、作者、XMP 等属性，不会删除页面上的个人信息。" en="Clear document properties, not visible private information." ja="PDFメタデータを削除" ko="PDF 메타데이터 제거" fr="Supprimer les métadonnées PDF" de="PDF-Metadaten entfernen" es="Quitar metadatos PDF" pt="Remover metadados PDF" ar="إزالة بيانات PDF الوصفية"/>}><PdfNicheWorkbench mode="remove-metadata"/></AdvancedToolPage>}