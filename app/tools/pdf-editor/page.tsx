import {TOOL_INTROS} from "@/lib/tools/product-copy";
import LxText from "@/components/LxText";
import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import PdfEditorWorkbench from '@/components/tools/PdfEditorWorkbench';
export default function Page(){return <AdvancedToolPage title={<LxText zh="PDF 自由编辑" en="Edit PDF" ja="PDFを編集" ko="PDF 편집" fr="Modifier un PDF" de="PDF bearbeiten" es="Editar PDF" pt="Editar PDF" ar="تحرير PDF"/>} intro={<LxText {...TOOL_INTROS["pdf-editor"]}/>}><PdfEditorWorkbench/></AdvancedToolPage>}
