import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Home from '../../market-workbench';
import {searchPlatforms} from '../../../lib/platform-repository';
import {supportedLocales,localeCopy,type Locale} from '../../../lib/locale-pages';
// Localized routes render the same interactive market, search, price and comparison
// logic as the default route; do not silently replace it with a static placeholder.
export const dynamicParams=false;
export function generateStaticParams(){return supportedLocales.map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))return {robots:{index:false}};
 return {title:`LINGXIFIELD | ${localeCopy[lang as Locale].headline}`,
 description:localeCopy[lang as Locale].subtitle,
 robots:{index:false,follow:false}};
}
export default async function LocalizedMarket({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;if(!supportedLocales.includes(lang as Locale))notFound();
 return <div lang={lang} dir={lang==='ar'?'rtl':'ltr'}>
  <Home initialLanguage={lang as Locale} initialPlatforms={searchPlatforms({limit:24}).items}/>
 </div>;
}
