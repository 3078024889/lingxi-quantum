import {NextResponse} from 'next/server';
import {listPublishers,marketRegistrySummary} from '../../../../lib/market-publisher-registry';
import {marketRegistryParams} from '../../../../lib/market-registry-params.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){
 const sp=new URL(request.url).searchParams,p=marketRegistryParams(sp);
 if(!p)return NextResponse.json({error:'INVALID_QUERY'},{status:400});
 const kind=sp.get('kind')||undefined;
 if(kind&&!['company','open_source_project','software_library'].includes(kind))
  return NextResponse.json({error:'INVALID_PUBLISHER_KIND'},{status:400});
 const rows=listPublishers({...p,kind:kind as 'company'|'open_source_project'|'software_library'|undefined});
 return NextResponse.json({scope:'curated_32_publishers',...marketRegistrySummary(),...rows},
  {headers:{'Cache-Control':'public, s-maxage=300','X-Content-Type-Options':'nosniff'}});
}
