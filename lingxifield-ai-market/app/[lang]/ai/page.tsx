import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Home from '../../market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../../../lib/region-billing.mjs';
import {searchPlatforms} from '../../../lib/platform-repository';
import {supportedLocales,localeCopy,type Locale} from '../../../lib/locale-pages';
import {mayIndexMarket,alternatesForMarket} from '../../../lib/market-index-policy';
// Localized routes render the same interactive market, search, price and comparison
// logic as the default route; do not silently replace it with a static placeholder.
export const dynamicParams=false;
export function generateStaticParams(){return supportedLocales.map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))return {robots:{index:false}};
 return {title:`LINGXIFIELD | ${localeCopy[lang as Locale].headline}`,
 description:localeCopy[lang as Locale].subtitle,
 robots:{index:mayIndexMarket(lang),follow:mayIndexMarket(lang)},
 alternates:mayIndexMarket(lang)?alternatesForMarket(lang):undefined};
}
export default async function LocalizedMarket({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))notFound();
 const h=await headers();const currency=currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry'));
 return <div lang={lang} dir={lang==='ar'?'rtl':'ltr'}>
  <Home initialLanguage={lang as Locale} initialCurrency={currency} initialPlatforms={searchPlatforms({limit:24}).items}/>
 </div>;
}
