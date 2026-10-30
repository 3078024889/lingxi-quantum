import type { Metadata } from 'next';
import './globals.css';
import './market-matrix.css';
export const metadata: Metadata = {metadataBase:new URL('https://lingxifield.com'),title:'LINGXIFIELD | Global AI Market',description:'AI platforms, pricing, SEO/GEO visibility and corporate intelligence. Verified sources when available.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>}
