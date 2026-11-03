import type {Metadata} from "next";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfCompressWorkbench from "@/components/tools/PdfCompressWorkbench";
import {languageAlternates} from "@/lib/seo/global-seo";
export const metadata:Metadata={
 title:"PDF 压缩｜灵犀场",
 description:"三档 PDF 压缩质量，适合扫描件和图片型 PDF；支持查看体积变化、取消和下载。",
 alternates:{canonical:"/tools/pdf-compress",languages:languageAlternates("/tools/pdf-compress")}
};
export default function Page(){return <AdvancedToolPage
 title={<LxText zh="PDF 压缩" en="Compress PDF" ja="PDF圧縮" ko="PDF 압축" fr="Compresser PDF" de="PDF komprimieren" es="Comprimir PDF" pt="Comprimir PDF" ar="ضغط PDF"/>}
 intro={<LxText zh="适合扫描件或图片型 PDF，提供轻度、推荐和强力三档压缩；文字和矢量可能转为图片。" en="Three compression presets for scanned and image-heavy PDFs; selectable text and vectors may become images." ja="スキャン・画像中心のPDFを3つのモードで圧縮します。テキストやベクターは画像になる場合があります。" ko="스캔 및 이미지형 PDF를 세 가지 모드로 압축합니다. 텍스트와 벡터는 이미지로 바뀔 수 있습니다." fr="Trois niveaux de compression pour les PDF scannés ou riches en images ; le texte et les vecteurs peuvent devenir des images." de="Drei Kompressionsstufen für gescannte und bildreiche PDFs; Text und Vektoren können als Bilder ausgegeben werden." es="Tres niveles de compresión para PDF escaneados o con imágenes; el texto y los vectores pueden convertirse en imágenes." pt="Três níveis de compressão para PDF digitalizados ou com imagens; texto e vetores podem tornar-se imagens." ar="ثلاثة مستويات لضغط ملفات PDF الممسوحة ضوئيًا والغنية بالصور؛ قد تتحول النصوص والعناصر المتجهية إلى صور."/>}>
 <PdfCompressWorkbench/>
 </AdvancedToolPage>}
