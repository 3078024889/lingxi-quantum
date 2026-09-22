import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import ImageConvertWorkbench from "@/components/tools/ImageConvertWorkbench";
export default function Page(){return <AdvancedToolPage title="PNG 转 JPG" intro="选择 PNG，转成更通用的 JPG。"><ImageConvertWorkbench output="jpeg" accept="image/png" title="PNG 转 JPG" /></AdvancedToolPage>}
