import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import VideoWatermarkWorkbench from '@/components/tools/VideoWatermarkWorkbench';
export default function Page(){return <AdvancedToolPage title="视频去水印" intro="固定位置水印可直接本地处理。选择水印所在区域，浏览器用 FFmpeg 重建该块画面并导出 MP4。" note="仅处理你拥有版权、已获授权或自己制作的内容。"><VideoWatermarkWorkbench/></AdvancedToolPage>}
