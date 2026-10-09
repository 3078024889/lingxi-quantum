import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import ImageWatermarkWorkbench from '@/components/tools/ImageWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="图片去水印" intro="上传图片，用精细画笔只涂住水印，或快速框选简单区域；灵犀场会在浏览器中修复选区并导出 PNG。" note="仅处理你拥有版权、已获授权或自己制作的图片。"><ImageWatermarkWorkbench/></AdvancedToolPage>}
