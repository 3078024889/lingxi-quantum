import {buildSearchOptimizedToolMetadata} from '@/lib/seo/search-tool-metadata';
import AdvancedToolPage from '@/components/tools/AdvancedToolPage';
import PdfWorkspace from '@/components/tools/PdfWorkspace';
import LxText from '@/components/LxText';
export const metadata=buildSearchOptimizedToolMetadata('pdf-workspace','zh');
export default function Page(){return <AdvancedToolPage title={<LxText zh="PDF 页面整理" en="Organize PDF pages"/>} intro="合并、拆分、旋转、删除与排序页面，文件在你的设备上处理。"><PdfWorkspace/></AdvancedToolPage>}
