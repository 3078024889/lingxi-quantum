import {buildSearchOptimizedToolMetadata} from "@/lib/seo/search-tool-metadata";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import SvgToPngWorkbench from "@/components/tools/SvgToPngWorkbench";
export default function Page(){return <AdvancedToolPage title="SVG 转 PNG" intro="本地把 SVG 渲染成高清 PNG。"><SvgToPngWorkbench/></AdvancedToolPage>}
export const metadata=buildSearchOptimizedToolMetadata("svg-to-png","zh");
