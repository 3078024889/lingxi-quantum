import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import '../globals.css';
import MarketLegalFooter from '../market-legal-footer';
import SiteReleaseAnnouncement from '../../components/SiteReleaseAnnouncement';
import {marketLocales,mayIndexMarket,verifiedMarketOrigin,type MarketLocale} from '../../lib/market-index-policy';
import {MARKET_SHARE_IMAGE,MARKET_SHARE_IMAGES} from '../../lib/share-card';
export const dynamicParams=false;
export function generateStaticParams(){return marketLocales.map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))return {robots:{index:false,follow:false}};
 const indexable=mayIndexMarket(lang),origin=indexable?verifiedMarketOrigin():null;
 return {...(origin?{metadataBase:new URL(origin)}:{}),robots:{index:indexable,follow:indexable},
  openGraph:{type:'website',siteName:'灵犀场 LINGXIFIELD',images:MARKET_SHARE_IMAGES},
  twitter:{card:'summary_large_image',images:[MARKET_SHARE_IMAGE]}};
}
export default async function LocalizedRootLayout({children,params}:{children:React.ReactNode,params:Promise<{lang:string}>}){
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))notFound();
 return <html lang={lang==='zh'?'zh-CN':lang} dir={lang==='ar'?'rtl':'ltr'}><body>{children}<MarketLegalFooter language={lang}/><SiteReleaseAnnouncement site="market"/></body></html>;
}
