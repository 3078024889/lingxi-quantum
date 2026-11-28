import {buildSearchOptimizedToolMetadata} from '@/lib/seo/search-tool-metadata';
import AdvancedToolPage from '@/components/tools/AdvancedToolPage';
import ImageWorkspace from '@/components/tools/ImageWorkspace';
import LxText from '@/components/LxText';
export const metadata=buildSearchOptimizedToolMetadata('image-workspace','zh');
export default function Page(){return <AdvancedToolPage title={<LxText zh="图片编辑工作区" en="Image workspace"/>} intro="裁剪、缩放、签名与水印，在一个工作区完成。"><ImageWorkspace/></AdvancedToolPage>}
