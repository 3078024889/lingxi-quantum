import type {Metadata} from 'next';
import Home from '../market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../../lib/region-billing.mjs';
import {searchPlatforms} from '../../lib/platform-repository';
import {mayIndexMarket,alternatesForMarket} from '../../lib/market-index-policy';

export function generateMetadata():Metadata{
 const indexable=mayIndexMarket('zh');
 return {
  title:'灵犀场全球SIAI排行榜｜LINGXIFIELD',
  description:'灵犀场全球SIAI排行榜，提供全球人工智能产品、模型与服务的查询、行情比较、价格套餐、免费额度、地区支持、商用授权及排行榜。',
  robots:{index:indexable,follow:indexable},
  // The root URL is the Chinese entry alias; /zh/ai is the canonical locale route.
  // Never publish a canonical to the old main site from an unverified preview.
  alternates:indexable?alternatesForMarket('zh'):undefined
 };
}
export default async function Page(){
 const h=await headers();
 return <Home initialCurrency={currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry'))} initialPlatforms={searchPlatforms({limit:24}).items}/>;
}
