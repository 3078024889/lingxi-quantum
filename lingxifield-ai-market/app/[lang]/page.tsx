import {notFound,permanentRedirect} from 'next/navigation';
import {marketLocales,type MarketLocale} from '../../lib/market-index-policy';

// Short language entry points must resolve to the fully localized market page.
export const dynamicParams=false;
export function generateStaticParams(){
 return marketLocales.map(lang=>({lang}));
}
export default async function LocaleIndex({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))notFound();
 permanentRedirect('/'+lang+'/ai');
}
