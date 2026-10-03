import LxText from "@/components/LxText";
import {TOOL_INTROS} from "@/lib/tools/product-copy";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import OcrWorkbench from "@/components/tools/OcrWorkbench";
export default function Page(){return <AdvancedToolPage title={<LxText {...{"zh": "图片 / 扫描件 OCR", "en": "Image / Scan OCR", "ja": "画像 / スキャンOCR", "ko": "이미지 / 스캔 OCR", "fr": "OCR image / scan", "de": "Bild-/Scan-OCR", "es": "OCR de imagen / escaneo", "pt": "OCR de imagem / digitalização", "ar": "OCR للصور / المسح"}}/>} intro={<LxText {...TOOL_INTROS["ocr"]}/>}> <OcrWorkbench/></AdvancedToolPage>}
