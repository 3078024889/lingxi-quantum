import {NextResponse} from 'next/server';
import {listModelOffers} from '../../../../lib/market-publisher-registry';
import {marketRegistryParams,marketIdParam} from '../../../../lib/market-registry-params.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){
 const sp=new URL(request.url).searchParams,p=marketRegistryParams(sp);
 if(!p)return NextResponse.json({error:'INVALID_QUERY'},{status:400});
 const channel=sp.get('channel')||undefined,productId=sp.get('product')||'',companyId=sp.get('publisher')||'';
 if((channel&&!['token_api','video','api_unit'].includes(channel))||
    (productId&&!marketIdParam(productId))||(companyId&&!marketIdParam(companyId)))
  return NextResponse.json({error:'INVALID_FILTER'},{status:400});
 const offers=listModelOffers({...p,productId,companyId,
  channel:channel as 'token_api'|'video'|'api_unit'|undefined});
 return NextResponse.json({scope:'official_rate_rows_for_curated_32',...offers,
  note:'Each item is a published rate or plan row, not an independently counted model or global market ranking. Check source and date; rates may change.'},
  {headers:{'Cache-Control':'public, s-maxage=300','X-Content-Type-Options':'nosniff'}});
}
