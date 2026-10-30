import Home from './market-workbench';
import {headers} from 'next/headers';
import {currencyFromCountry} from '../lib/region-billing.mjs';
import {searchPlatforms} from '../lib/platform-repository';
export default async function Page(){const h=await headers();return <Home initialCurrency={currencyFromCountry(h.get('x-vercel-ip-country')||h.get('cf-ipcountry'))} initialPlatforms={searchPlatforms({limit:24}).items}/>;}
