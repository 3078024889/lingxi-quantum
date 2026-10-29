import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type App={id:string;name:string;provider:string;url:string;description:string|null;categories:string[];likes:number|null;source:string;verification:string};
export async function GET(request:Request){
 const query=new URL(request.url).searchParams,q=(query.get('q')||'').toLowerCase().trim().slice(0,120);
 const limit=Math.max(1,Math.min(40,Math.trunc(Number(query.get('limit'))||20)));
 const cursor=Math.max(0,Math.min(10000,Math.trunc(Number(query.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
  const data=JSON.parse(await readFile(resolve(dir,'hf-spaces-catalog.json'),'utf8')) as {source:string;collectedAt:string;records:App[]};
  if(data.source!=='huggingface_spaces'||!Array.isArray(data.records))throw Error('INVALID_HF_SOURCE');
  const matched=data.records.filter(x=>!q||[x.id,x.name,x.provider,x.description||'',...(x.categories||[])].some(v=>v.toLowerCase().includes(q)));
  const items=matched.slice(cursor,cursor+limit);
  return NextResponse.json({total:matched.length,cursor,limit,nextCursor:cursor+items.length<matched.length?cursor+items.length:null,
   items,source:'Hugging Face Spaces',sourceCollectedAt:data.collectedAt,
   caveat:'Space likes are Hugging Face signals only, not site visits, downloads, independent quality, or commercial pricing.'},
   {headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({total:0,items:[],status:'app_catalog_not_collected',explanation:'The separate public application source needs a successful batch collection.'},{status:503})}
}
