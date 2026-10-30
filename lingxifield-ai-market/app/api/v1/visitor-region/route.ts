import {NextResponse} from 'next/server';
import {headers} from 'next/headers';
import {ALL_REGIONS} from '../../../../lib/global-region-market';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Coarse Vercel country code only; no precise location, IP tracking, or account required.
export async function GET(){
 const h=await headers();
 const raw=(h.get('x-vercel-ip-country')||'').toUpperCase();
 const region=ALL_REGIONS.includes(raw as (typeof ALL_REGIONS)[number])?raw:'GLOBAL';
 return NextResponse.json({region,source:region==='GLOBAL'?'unavailable':'edge_country'},{headers:{'Cache-Control':'private, no-store'}});
}
