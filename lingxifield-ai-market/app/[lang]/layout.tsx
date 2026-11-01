import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import '../globals.css';
import {marketLocales,mayIndexMarket,marketCanonicalOrigin,type MarketLocale} from '../../lib/market-index-policy';
export const dynamicParams=false;
export function generateStaticParams(){return marketLocales.map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))return {robots:{index:false,follow:false}};
 return {metadataBase:new URL(marketCanonicalOrigin),robots:{index:mayIndexMarket(lang),follow:mayIndexMarket(lang)}};
}
export default async function LocalizedRootLayout({children,params}:{children:React.ReactNode,params:Promise<{lang:string}>}){
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))notFound();
 return <html lang={lang==='zh'?'zh-CN':lang} dir={lang==='ar'?'rtl':'ltr'}><body>{children}</body></html>;
}
