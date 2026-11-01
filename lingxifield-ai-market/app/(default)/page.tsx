import type {Metadata} from 'next';
import Home from '../market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../../lib/region-billing.mjs';
import {searchPlatforms} from '../../lib/platform-repository';
import {mayIndexMarket,alternatesForMarket} from '../../lib/market-index-policy';

export function generateMetadata():Metadata{
 const indexable=mayIndexMarket('zh');
 return {
  title:'全球 SI AI 行情平台｜灵犀场 LINGXIFIELD',
  description:'按实际任务查找全球 SI AI 工具，比较免费额度、官方价格、地区可用性、商用条件与来源证据。',
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
