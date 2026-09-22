import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import ImageConvertWorkbench from "@/components/tools/ImageConvertWorkbench";
export default function Page(){return <AdvancedToolPage title="AVIF 转 JPG" intro="选择 AVIF，浏览器可解码时直接转成 JPG。"><ImageConvertWorkbench output="jpeg" accept="image/avif,.avif" title="AVIF 转 JPG" /></AdvancedToolPage>}
