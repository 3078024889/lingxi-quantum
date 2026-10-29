import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url),q=(url.searchParams.get('q')||'').toLowerCase().slice(0,100);
 const limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||25));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
  const source=JSON.parse(await readFile(resolve(dir,'model-price-changes.json'),'utf8'));
  if(source.status!=='compared'||!Array.isArray(source.changes))throw Error('INVALID_HISTORY');
  const results=source.changes.filter((r:{id:string})=>!q||r.id.toLowerCase().includes(q));
  return NextResponse.json({total:results.length,items:results.slice(0,limit),previousAt:source.previousAt,latestAt:source.latestAt,
   source:'models.dev',verification:'third_party_aggregated_change_not_publisher_confirmed'},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({total:0,items:[],status:'no_comparable_snapshots',explanation:'Price changes require at least two valid, separate collected snapshots.'},{headers:{'Cache-Control':'no-store'}})}
}
