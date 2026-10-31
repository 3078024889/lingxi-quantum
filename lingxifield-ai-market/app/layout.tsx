import type { Metadata } from 'next';
import './globals.css';
import {mayIndexMarket} from '../lib/market-index-policy';
export const metadata: Metadata = {metadataBase:new URL('https://lingxifield.com'),title:'全球 SI AI 行情平台｜灵犀场 LINGXIFIELD',description:'全球 SI AI 行情平台：从需求出发比较智能伙伴、模型和产品的功能、官方价格、免费额度、商用授权、地区可用性、用户体验及 SEO/GEO 证据。',keywords:['全球 SI AI 行情平台','全球 AI 工具排行榜','AI 工具行情','全球 SI 工具','Super Intelligence','AI platform rankings','SEO GEO ranking'],robots:{index:mayIndexMarket(),follow:mayIndexMarket()}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}
