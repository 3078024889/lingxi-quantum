import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
type HubModel={id?:unknown;downloads?:unknown;likes?:unknown;private?:unknown};
const upstream='https://huggingface.co/api/models?sort=downloads&direction=-1&limit=25';
export async function GET(){
 try{
  const response=await fetch(upstream,{headers:{Accept:'application/json','User-Agent':'LINGXIFIELD-market-research/1.0'},next:{revalidate:1800},signal:AbortSignal.timeout(9000)});
  if(!response.ok)throw Error('UPSTREAM_'+response.status);
  const raw=await response.json() as unknown;
  if(!Array.isArray(raw)||raw.length>25)throw Error('INVALID_UPSTREAM');
  const items=raw.filter((m):m is HubModel=>m!==null&&typeof m==='object')
   .filter(m=>typeof m.id==='string'&&/^[\w.-]+\/[\w.-]+$/.test(m.id)&&m.private!==true&&Number.isSafeInteger(m.downloads)&&Number(m.downloads)>=0)
   .map((m,i)=>({rank:i+1,id:m.id,downloads:m.downloads as number,likes:Number.isSafeInteger(m.likes)?Number(m.likes):null,sourceUrl:'https://huggingface.co/'+m.id}));
  if(items.length===0)throw Error('NO_VALID_RECORDS');
  return NextResponse.json({source:'Hugging Face Hub public API',upstream,metric:'model_repository_downloads',scope:'Hugging Face model repositories only',isGlobalProductRanking:false,isThirdPartyTrafficEstimate:false,
   collectedAt:new Date().toISOString(),completeGlobalCoverage:false,items},{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=600','X-Robots-Tag':'noindex'}});
 }catch{
  return NextResponse.json({error:'SOURCE_TEMPORARILY_UNAVAILABLE',items:[],isGlobalProductRanking:false},
   {status:503,headers:{'Cache-Control':'public,s-maxage=60','X-Robots-Tag':'noindex'}});
 }
}
