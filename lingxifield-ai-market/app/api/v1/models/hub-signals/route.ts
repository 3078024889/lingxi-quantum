import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type Entry={id:string;name:string;task:string|null;license:string|null;downloadsOnHub:number|null;likesOnHub:number|null;url:string;sourceCollectedAt:string};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams;
 const q=(sp.get('q')||'').trim().toLowerCase().slice(0,120);
 const task=(sp.get('task')||'').trim().toLowerCase().slice(0,80);
 const limit=Math.min(40,Math.max(1,Math.trunc(Number(sp.get('limit'))||20)));
 const cursor=Math.min(10000,Math.max(0,Math.trunc(Number(sp.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
  const data=JSON.parse(await readFile(resolve(dir,'hf-models-catalog.json'),'utf8')) as {source:string;collectedAt:string;records:Entry[]};
  if(data.source!=='huggingface_hub_models'||!Array.isArray(data.records))throw Error('INVALID_SOURCE');
  const filtered=data.records.filter(x=>(!q||x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q))&&(!task||(x.task||'').toLowerCase()===task));
  const items=filtered.slice(cursor,cursor+limit);
  return NextResponse.json({total:filtered.length,items,limit,cursor,nextCursor:cursor+items.length<filtered.length?cursor+items.length:null,
   source:'Hugging Face Hub API',sourceCollectedAt:data.collectedAt,scope:'selected_public_hub_model_records',
   disclaimer:'Hub downloads are Hub-reported counts, not unique users, global downloads, performance rankings or SEO/GEO metrics. License tags require card review.'},
   {headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({status:'hf_models_not_collected',total:0,items:[]},{status:503})}
}
