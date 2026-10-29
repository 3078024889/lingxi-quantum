import {notFound} from 'next/navigation';
import AiMarketSearch from '@/components/ai-market/AiMarketSearch';
import {MARKET_LOCALES,MARKET_LABELS,marketDirection} from '@/lib/ai-market/i18n-market.mjs';
export const dynamicParams=false;
export function generateStaticParams(){return MARKET_LOCALES.map(locale=>({locale}));}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;
 if(!MARKET_LOCALES.includes(locale))return {robots:{index:false}};
 return {title:MARKET_LABELS[locale].search+' | LINGXIFIELD',robots:{index:false,follow:false}};
}
export default async function LocalizedMarket({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!MARKET_LOCALES.includes(locale))notFound();
 return <div lang={locale} dir={marketDirection(locale)}><AiMarketSearch locale={locale} labels={MARKET_LABELS[locale]}/></div>;
}
