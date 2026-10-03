import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfPageManagerWorkbench from "@/components/tools/PdfPageManagerWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "PDF 页面删除 / 排序 / 旋转", "en": "Delete / Reorder / Rotate PDF Pages", "ja": "PDFページ削除 / 並べ替え / 回転", "ko": "PDF 페이지 삭제 / 정렬 / 회전", "fr": "Supprimer / réordonner / pivoter les pages PDF", "de": "PDF-Seiten löschen / sortieren / drehen", "es": "Eliminar / ordenar / rotar páginas PDF", "pt": "Excluir / ordenar / girar páginas PDF", "ar": "حذف / ترتيب / تدوير صفحات PDF"}}/>} intro={<LxText {...TOOL_INTROS["pdf-pages"]}/>}> <PdfPageManagerWorkbench/></AdvancedToolPage>}
