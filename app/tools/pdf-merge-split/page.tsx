import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfBasicWorkbench from "@/components/tools/PdfBasicWorkbench";
export default function Page(){
 return <AdvancedToolPage
  title={<LxText zh="PDF 合并、拆分与旋转" en="Merge, Split & Rotate PDFs" ja="PDFの結合・分割・回転" ko="PDF 병합·분할·회전" fr="Fusionner, diviser et pivoter des PDF" de="PDFs zusammenfügen, teilen und drehen" es="Unir, dividir y girar PDF" pt="Mesclar, dividir e girar PDFs" ar="دمج وتقسيم وتدوير ملفات PDF"/>}
  intro={<LxText
    zh="上传 PDF，合并文件、提取需要的页码，或旋转指定页面。处理完直接下载。"
    en="Upload PDFs to merge files, extract selected pages or rotate pages. Download the result directly."
    ja="PDFを追加し、結合、ページ抽出、回転を行ってそのまま保存できます。"
    ko="PDF를 업로드해 병합, 페이지 추출, 회전을 수행하고 결과를 저장하세요."
    fr="Importez des PDF pour les fusionner, extraire des pages ou les faire pivoter, puis téléchargez le résultat."
    de="PDFs hochladen, zusammenfügen, ausgewählte Seiten extrahieren oder drehen und direkt herunterladen."
    es="Sube PDF para unirlos, extraer páginas o girarlas y descarga el resultado."
    pt="Envie PDFs para mesclar, extrair páginas ou girar e baixe o resultado."
    ar="ارفع ملفات PDF لدمجها أو استخراج صفحات محددة أو تدويرها، ثم نزّل النتيجة."
  />}>
  <PdfBasicWorkbench/>
 </AdvancedToolPage>;
}
