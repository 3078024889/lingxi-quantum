import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import ImageConvertWorkbench from "@/components/tools/ImageConvertWorkbench";
export default function Page(){return <AdvancedToolPage title="WebP 转 JPG" intro="选择 WebP，转成兼容性更高的 JPG。"><ImageConvertWorkbench output="jpeg" accept="image/webp" title="WebP 转 JPG" /></AdvancedToolPage>}
