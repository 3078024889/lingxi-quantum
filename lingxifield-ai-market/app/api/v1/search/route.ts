import {NextResponse} from 'next/server';
import {searchPlatforms,toPlatform} from '../../../../lib/platform-repository';
import {entries} from '../../../../lib/catalog-store';
import {discoverCatalog} from '../../../../lib/catalog-insights.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){const sp=new URL(request.url).searchParams,q=(sp.get('q')||'').trim();if(q.length>120)return NextResponse.json({error:'QUERY_TOO_LONG'},{status:400});const category=(sp.get('category')||'').slice(0,60);const result=searchPlatforms({q,category:category==='全部平台'?'':category,limit:Number(sp.get('limit')||24),cursor:Number(sp.get('cursor')||0)});const fallback=q&&result.total===0?discoverCatalog(entries,q,{limit:Math.min(30,Math.max(1,Number(sp.get('limit')||24)))}):null;
 const matched=fallback&&fallback.items.length?{...result,total:fallback.matched,items:fallback.items.filter(x=>!category||category==='全部平台'||x.category===category).map(toPlatform),nextCursor:null}:result;
 return NextResponse.json({...matched,query:q,kind:fallback&&fallback.items.length?'task_relevance_suggestions':'catalog_matches',rankingVerified:false},{headers:{'Cache-Control':'public, max-age=0, s-maxage=60, stale-while-revalidate=120'}});}
