import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
const ITEMS=[['openai','openai-python'],['anthropics','anthropic-sdk-python'],['huggingface','transformers'],['langchain-ai','langchain'],['ollama','ollama']] as const;
export async function GET(){
 const results=await Promise.all(ITEMS.map(async([owner,repo])=>{
  const sourceUrl='https://github.com/'+owner+'/'+repo;
  try{
   const controller=AbortSignal.timeout(7000);
   const r=await fetch('https://api.github.com/repos/'+owner+'/'+repo,{signal:controller,headers:{Accept:'application/vnd.github+json','User-Agent':'LINGXIFIELD-Market-Research'},next:{revalidate:3600}});
   if(!r.ok)return {id:owner+'/'+repo,sourceUrl,status:'unavailable',httpStatus:r.status};
   const x=await r.json();
   if(x.full_name!==owner+'/'+repo||x.private===true)return {id:owner+'/'+repo,sourceUrl,status:'unavailable'};
   return {id:x.full_name,name:x.name,description:typeof x.description==='string'?x.description.slice(0,240):null,
    sourceUrl:x.html_url,stars:Number.isSafeInteger(x.stargazers_count)?x.stargazers_count:null,
    forks:Number.isSafeInteger(x.forks_count)?x.forks_count:null,
    updatedAt:x.updated_at,pushedAt:x.pushed_at,license:x.license?.spdx_id&&x.license.spdx_id!=='NOASSERTION'?x.license.spdx_id:null,source:'GitHub public repository API',status:'public_repository_unverified_product'};
  }catch{return {id:owner+'/'+repo,sourceUrl,status:'unavailable'};}
 }));
 return NextResponse.json({retrievedAt:new Date().toISOString(),records:results,
 explanation:'Official public repository metadata. Stars and forks do not represent users, revenue, quality, global rankings or app downloads.'},
 {headers:{'Cache-Control':'public, max-age=0, s-maxage=1800'}});
}
