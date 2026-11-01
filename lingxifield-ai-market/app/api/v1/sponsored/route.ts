import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
type Item={project_id:string;label:string;target_url:string;placement:string;ends_at:string};
const noStore={'Cache-Control':'public, s-maxage=300, stale-while-revalidate=300'};
export async function GET(){
 const empty=()=>NextResponse.json({items:[],type:'sponsored',affectsOrganicRank:false},{headers:noStore});
 const base=process.env.AI_MARKET_SUPABASE_URL||process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!base||!key)return empty();
 try{
  const url=new URL('/rest/v1/ai_market_sponsored_disclosure',base);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))return empty();
  url.searchParams.set('select','project_id,label,target_url,placement,ends_at');
  url.searchParams.set('placement','eq.home_feature');
  url.searchParams.set('order','ends_at.asc');
  url.searchParams.set('limit','3');
  const r=await fetch(url,{headers:{apikey:key,accept:'application/json'},next:{revalidate:300},signal:AbortSignal.timeout(7000),redirect:'error'});
  if(!r.ok)return empty();
  const rows=await r.json() as Item[];
  if(!Array.isArray(rows)||rows.length>3)return empty();
  const items=rows.filter(x=>x&&typeof x.label==='string'&&typeof x.target_url==='string'&&x.placement==='home_feature')
   .filter(x=>{try{const u=new URL(x.target_url);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}})
   .map(({project_id,label,target_url})=>({projectId:project_id,label,targetUrl:target_url,sponsored:true}));
  return NextResponse.json({items,type:'sponsored',affectsOrganicRank:false},{headers:noStore});
 }catch{return empty()}
}
