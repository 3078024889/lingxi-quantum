import {notFound} from 'next/navigation';
import Home from '../../market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../../../lib/region-billing.mjs';
import {findPlatform} from '../../../lib/platform-repository';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);return {title:product?`${product.name} 功能、费用与使用条件｜灵犀场`:'产品未找到',robots:{index:false,follow:false}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=findPlatform(id);if(!product)notFound();const h=await headers();return <Home initialCurrency={currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry'))} initialPlatforms={[product]} initialSelected={product.id}/>;}
