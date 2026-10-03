import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PrivacyCleanerWorkbench from "@/components/tools/PrivacyCleanerWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "文件隐私清理", "en": "File Privacy Cleaner", "ja": "ファイルのプライバシー清理", "ko": "파일 개인정보 정리", "fr": "Nettoyage de confidentialité des fichiers", "de": "Datei-Datenschutzbereinigung", "es": "Limpieza de privacidad de archivos", "pt": "Limpeza de privacidade de arquivos", "ar": "تنظيف خصوصية الملفات"}}/>} intro={<LxText {...TOOL_INTROS["privacy-cleaner"]}/>}> <PrivacyCleanerWorkbench/></AdvancedToolPage>}
