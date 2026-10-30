import {headers} from 'next/headers';
import {currencyFromCountry} from '../../../lib/region-billing.mjs';
import VendorPricingClient from './pricing-client';
export const metadata={title:'厂商服务与收费｜LINGXIFIELD',description:'免费认领、品牌展示、新品推荐与分类推广服务。付费推广不影响客观排名。',robots:{index:false,follow:false}};
export default async function VendorPricingPage(){
 const h=await headers();
 const initialCurrency=currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry')) as 'CNY'|'USD';
 return <VendorPricingClient initialCurrency={initialCurrency}/>;
}
