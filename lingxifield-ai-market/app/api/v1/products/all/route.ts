import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type Product={id:string;name:string;company?:string|null;category?:string|null;url:string;description:string|null;capabilities:string[];price:number|null;freeQuota:string|null;usageMetric:null;reviewStatus:string;evidence:{kind:string;url:string;observedAt:string|null}};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams,q=(sp.get('q')||'').toLowerCase().trim().slice(0,120);
 const limit=Math.max(1,Math.min(40,Math.trunc(Number(sp.get('limit'))||20)));
 const cursor=Math.max(0,Math.min(100000,Math.trunc(Number(sp.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/source-pipeline');
  const data=JSON.parse(await readFile(resolve(dir,'products-unified.json'),'utf8')) as {schema:string;generatedAt:string;products:Product[]};
  if(data.schema!=='lingxifield_product_candidates_v1'||!Array.isArray(data.products))throw Error('INVALID_PRODUCTS');
  const filtered=data.products.filter(p=>!q||[p.name,p.company||'',p.category||'',p.description||'',...(p.capabilities||[])].some(s=>s.toLowerCase().includes(q)));
  const items=filtered.slice(cursor,cursor+limit);
  return NextResponse.json({total:filtered.length,items,cursor,limit,nextCursor:cursor+items.length<filtered.length?cursor+items.length:null,
   updatedAt:data.generatedAt,disclosure:'Unverified candidate products; prices, usage, free quotas, company status and SEO/GEO ranking require independent sources.'},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({status:'product_inventory_missing',total:0,items:[],message:'Run the unified catalog builder using AI_MARKET_SNAPSHOT_DIR.'},{status:503})}
}
