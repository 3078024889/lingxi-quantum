import {buildSearchOptimizedToolMetadata} from "@/lib/seo/search-tool-metadata";
import LxText from "@/components/LxText";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import ScreenshotRedactWorkbench from "@/components/tools/ScreenshotRedactWorkbench";
export default function Page(){return <AdvancedToolPage
 title={<LxText zh="截图隐私遮盖" en="Redact a Screenshot" ja="スクリーンショットの黒塗り" ko="스크린샷 개인정보 가리기" fr="Masquer les informations d’une capture" de="Screenshot-Daten schwärzen" es="Ocultar datos de capturas" pt="Ocultar dados de capturas" ar="حجب البيانات في لقطة الشاشة"/>}
 intro={<LxText zh="直接框选敏感内容，使用不透明黑块后保存新图片。适合截图中的姓名、证件号和聊天内容。" en="Select sensitive areas directly, apply opaque black, and save a new image. Useful for names, IDs and chats." ja="機密の範囲を選び、不透明な黒で覆って新しい画像を保存します。" ko="민감한 영역을 선택하고 불투명한 검은색으로 가린 뒤 새 이미지를 저장합니다." fr="Sélectionnez les zones sensibles, masquez-les en noir opaque, puis enregistrez une nouvelle image." de="Vertrauliche Bereiche markieren, vollständig schwärzen und als neues Bild speichern." es="Selecciona las zonas sensibles, cúbrelas de negro opaco y guarda una imagen nueva." pt="Selecione as áreas sensíveis, cubra-as com preto opaco e salve uma nova imagem." ar="حدد المناطق الحساسة وغطّها باللون الأسود المعتم ثم احفظ صورة جديدة."/>}>
 <ScreenshotRedactWorkbench/>
 </AdvancedToolPage>}
export const metadata=buildSearchOptimizedToolMetadata("screenshot-redact","zh");
