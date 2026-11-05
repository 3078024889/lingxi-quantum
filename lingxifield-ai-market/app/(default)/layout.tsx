import type { Metadata } from 'next';
import '../globals.css';
import MarketLegalFooter from '../market-legal-footer';
import {mayIndexMarket,verifiedMarketOrigin} from '../../lib/market-index-policy';
const MARKET_SHARE_IMAGE='https://lingxifield.com/og-lingxifield-20261105.jpg';
const publishedOrigin=mayIndexMarket('zh')?verifiedMarketOrigin():null;
export const metadata: Metadata = {...(publishedOrigin?{metadataBase:new URL(publishedOrigin)}:{}),title:'灵犀场全球SIAI排行榜｜LINGXIFIELD',description:'灵犀场全球SIAI排行榜：查询全球人工智能产品、模型与服务，查看功能能力、官方价格、免费额度、国家地区支持、商用授权、用户体验和行业排行。',keywords:['灵犀场全球SIAI排行榜','全球SIAI排行榜','全球人工智能产品','AI工具排行榜','AI模型行情','人工智能服务','AI platform rankings'],openGraph:{type:'website',siteName:'灵犀场 LINGXIFIELD',title:'全球 SIAI 排行榜 · 灵犀场',images:[{url:MARKET_SHARE_IMAGE,width:1200,height:630,alt:'灵犀场 LINGXIFIELD · 全球 SIAI 排行榜 · SASI 智能创作'}]},twitter:{card:'summary_large_image',images:[MARKET_SHARE_IMAGE]},robots:{index:mayIndexMarket(),follow:mayIndexMarket()}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}<MarketLegalFooter language="zh"/></body></html>}
