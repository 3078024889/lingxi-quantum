import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Candidate={id:string;name:string;url:string;description?:string|null;category?:string|null;capabilities?:string[];evidence?:{kind:string;url:string;observedAt:string|null};reviewStatus?:string};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams;
 const website=sp.get('website')||'';
 let domain='';
 try{const url=new URL(website);if(!['https:','http:'].includes(url.protocol))throw Error('protocol');domain=url.hostname.toLowerCase().replace(/^www\./,'')}catch{return NextResponse.json({error:'INVALID_WEBSITE'},{status:400})}
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/source-pipeline');
  const data=JSON.parse(await readFile(resolve(dir,'products-unified.json'),'utf8')) as {schema:string;generatedAt:string;products:Candidate[]};
  if(data.schema!=='lingxifield_product_candidates_v1'||!Array.isArray(data.products))throw Error('INVALID_DATA');
  // Strict hostname equality: do not conflate arbitrary pages or sibling vendors.
  const matching=data.products.filter(p=>{try{return new URL(p.url).hostname.toLowerCase().replace(/^www\./,'')===domain}catch{return false}}).slice(0,12);
  return NextResponse.json({matches:matching,updatedAt:data.generatedAt,identityRule:'exact_normalized_hostname_only',verified:false,
    caveat:'Candidate product metadata only. The domain match does not verify company ownership, pricing or product equivalence.'},
    {headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({matches:[],status:'unified_catalog_not_available',verified:false},{headers:{'Cache-Control':'no-store'}})}
}
