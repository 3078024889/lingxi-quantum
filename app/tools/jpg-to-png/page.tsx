import {buildSearchOptimizedToolMetadata} from "@/lib/seo/search-tool-metadata";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import ImageConvertWorkbench from "@/components/tools/ImageConvertWorkbench";
export default function Page(){return <AdvancedToolPage title="JPG 转 PNG" intro="选择 JPG/JPEG，转成 PNG。"><ImageConvertWorkbench output="png" accept="image/jpeg" title="JPG 转 PNG" /></AdvancedToolPage>}
export const metadata=buildSearchOptimizedToolMetadata("jpg-to-png","zh");
