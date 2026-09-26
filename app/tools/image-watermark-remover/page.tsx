import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import ImageWatermarkWorkbench from '@/components/tools/ImageWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="图片去水印" intro="上传图片，在画面上框出水印，灵犀场会修复选中区域并尽量还原背景。" note="仅处理你拥有版权、已获授权或自己制作的图片。"><ImageWatermarkWorkbench/></AdvancedToolPage>}
