import {notFound} from 'next/navigation';
import Home from '../../market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../../../lib/region-billing.mjs';
import {findPlatform} from '../../../lib/platform-repository';
import {mayIndexMarket,marketCanonicalOrigin} from '../../../lib/market-index-policy';
import {capabilityProfile} from '../../../lib/capability-profiles';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);return {title:product?`${product.name} 功能、费用与使用条件｜灵犀场`:'产品未找到',robots:{index:Boolean(product&&capabilityProfile(id)&&mayIndexMarket('zh')),follow:Boolean(product&&capabilityProfile(id)&&mayIndexMarket('zh'))},alternates:product?{canonical:marketCanonicalOrigin+'/platform/'+encodeURIComponent(id)}:undefined};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);if(!product)notFound();const h=await headers();return <Home initialCurrency={currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry'))} initialPlatforms={[product]} initialSelected={product.id}/>;}
