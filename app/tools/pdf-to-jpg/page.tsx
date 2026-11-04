import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfToImageWorkbench from "@/components/tools/PdfToImageWorkbench";
export default function Page(){return <AdvancedToolPage
 title={<LxText zh="PDF 转 JPG / PNG" en="PDF to JPG / PNG" ja="PDFからJPG / PNG" ko="PDF를 JPG / PNG로" fr="PDF en JPG / PNG" de="PDF zu JPG / PNG" es="PDF a JPG / PNG" pt="PDF para JPG / PNG" ar="تحويل PDF إلى JPG / PNG"/>}
 intro={<LxText zh="选择页码，转换成图片，检查结果后再保存。" en="Select pages, convert to images, then review before saving." ja="ページを選んで画像に変換し、確認して保存します。" ko="페이지를 선택해 이미지로 변환하고 확인한 뒤 저장하세요." fr="Choisissez les pages, convertissez-les en images puis vérifiez avant d’enregistrer." de="Seiten auswählen, in Bilder umwandeln und vor dem Speichern prüfen." es="Selecciona páginas, convierte a imágenes y revisa antes de guardar." pt="Selecione páginas, converta em imagens e confira antes de salvar." ar="حدد الصفحات وحوّلها إلى صور ثم راجعها قبل الحفظ."/>}>
 <PdfToImageWorkbench/>
 </AdvancedToolPage>}