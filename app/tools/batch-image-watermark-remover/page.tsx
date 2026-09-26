import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import ImageWatermarkWorkbench from '@/components/tools/ImageWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="批量图片去水印" intro="多张图片位置相同时，只需在第一张标记一次，后续图片会按同一区域处理。" note="确认本次图片数量后会先显示总价，付款后开始处理。"><ImageWatermarkWorkbench batch/></AdvancedToolPage>}
