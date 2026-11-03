import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {marketLocales,mayIndexMarket,indexableMarketLocales,marketCanonicalOrigin,type MarketLocale} from '../../../../lib/market-index-policy';
import {modelsCopy} from '../../../../lib/market-secondary-i18n';
type Props={params:Promise<{lang:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {lang}=await params;
 if(!marketLocales.includes(lang as MarketLocale))return {robots:{index:false,follow:false}};
 const title=modelsCopy(lang as MarketLocale).title;
 const description=modelsCopy(lang as MarketLocale).intro;
 const indexed=mayIndexMarket(lang);
 const languages=Object.fromEntries(indexableMarketLocales().map(l=>[l,marketCanonicalOrigin+'/'+l+'/models']));
 return {title,description,robots:{index:indexed,follow:indexed},
  alternates:indexed?{canonical:marketCanonicalOrigin+'/'+lang+'/models',languages}:undefined};
}
export default function SecondaryLayout({children}:{children:React.ReactNode}){return children;}
