import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import ImageWatermarkWorkbench from '@/components/tools/ImageWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="批量图片去水印" intro="多张图水印位置相同时，在第一张框一次，灵犀场按相同区域逐张修复。" note="批量 AI 修复会产生逐张模型成本，正式上线应在开始前显示本次总价。"><ImageWatermarkWorkbench batch/></AdvancedToolPage>}
