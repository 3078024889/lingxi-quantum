import type{Metadata}from'next';
import AdvancedToolPage from '@/components/tools/AdvancedToolPage';
import UrlPromotionWorkbench from '@/components/tools/UrlPromotionWorkbench';
import{languageAlternates}from'@/lib/seo/global-seo';
export const metadata:Metadata={title:'网址生成推广视频｜灵犀场',description:'读取网站或商品网页，核对卖点后进入 SASI 制作推广视频，沿用短剧分辨率和报价流程。',alternates:{canonical:'/tools/url-to-video',languages:languageAlternates('/tools/url-to-video')}};
export default function Page(){return <AdvancedToolPage title="网址生成推广视频" intro="读取网站或商品网页，核对卖点后进入 SASI 制作推广视频，沿用短剧分辨率和报价流程。"><UrlPromotionWorkbench/></AdvancedToolPage>}
