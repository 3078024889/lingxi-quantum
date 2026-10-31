import {NextResponse} from 'next/server';
import {coverageForSeoGeo,groupedSeoGeo,seoGeoObservations} from '../../../../lib/seo-geo-observations';
import {mayIndexMarket} from '../../../../lib/market-index-policy';
export const dynamic='force-dynamic';
export function GET(request:Request){
 const url=new URL(request.url);
 const source=url.searchParams.get('source'),country=url.searchParams.get('country'),product=url.searchParams.get('product');
 const items=seoGeoObservations.filter(o=>(!source||o.source===source)&&(!country||o.country===country)&&(!product||o.platformId===product)).slice(0,500);
 const summary=coverageForSeoGeo();
 return NextResponse.json({summary,method:'same query + country + language + model + measurement date + review method; no cross-cohort rank',observations:items,comparisons:groupedSeoGeo(),indexedCatalog:mayIndexMarket()},
 {headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
