import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {metadataBase:new URL('https://lingxifield.com'),title:'全球SI AI工具行情平台｜灵犀场 LINGXIFIELD',description:'全球SI AI工具、模型和平台行情：查功能、免费额度、价格、地区限制、用户体验、SEO/GEO 可见度与公司资料。只呈现可追溯的证据。',keywords:['全球SI AI工具行情平台','全球 AI 工具排行榜','AI 工具行情','全球 SI 工具','Super Intelligence','AI platform rankings','SEO GEO ranking'],robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}
