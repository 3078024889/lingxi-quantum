import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import ImageWatermarkWorkbench from '@/components/tools/ImageWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="批量图片去水印" intro="上传多张图片，在第一张图上框出同一位置的水印区域；灵犀场会在浏览器中批量修复，并逐张导出结果。" note="确认本次图片数量后会先显示总价，付款后开始处理。"><ImageWatermarkWorkbench batch/></AdvancedToolPage>}
