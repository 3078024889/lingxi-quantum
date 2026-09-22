import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import OcrWorkbench from "@/components/tools/OcrWorkbench";
export default function Page(){return <AdvancedToolPage title="图片 / 扫描件 OCR" intro="把图片里的文字提取出来。首次使用会加载对应语言模型。"><OcrWorkbench/></AdvancedToolPage>}
