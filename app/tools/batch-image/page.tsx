import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import BatchImageWorkbench from "@/components/tools/BatchImageWorkbench";
export default function Page(){return <AdvancedToolPage
 title={<LxText zh="批量图片处理" en="Batch Image Processing" ja="画像をまとめて変換" ko="이미지 일괄 변환" fr="Traitement d’images par lot" de="Bilder stapelweise verarbeiten" es="Procesar imágenes por lotes" pt="Processamento de imagens em lote" ar="معالجة الصور دفعة واحدة"/>}
 intro={<LxText zh="一次选择多张图片，点选尺寸和质量，生成后核对再保存单张图片或 ZIP。"
 en="Select multiple images, choose a size and quality, then review and save files or a ZIP."
 ja="複数の画像を選び、サイズと画質を指定して保存します。" ko="여러 이미지를 선택하고 크기와 품질을 설정해 저장하세요。"
 fr="Choisissez des images, puis la taille et la qualité. Vérifiez avant d’enregistrer."
 de="Bilder auswählen, Größe und Qualität wählen und vor dem Speichern prüfen."
 es="Selecciona imágenes, elige tamaño y calidad y revisa antes de guardar."
 pt="Escolha imagens, tamanho e qualidade. Confira antes de salvar."
 ar="اختر عدة صور وحدد الحجم والجودة ثم راجع النتائج قبل الحفظ."/>}>
 <BatchImageWorkbench/>
 </AdvancedToolPage>}