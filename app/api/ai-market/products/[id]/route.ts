import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient,isSupabaseAdminConfigured} from '@/lib/supabase/admin';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export async function GET(_request:NextRequest,{params}:{params:{id:string}}){
 const id=decodeURIComponent(params.id||'');
 if(!id||id.length>250||/[\x00-\x1f]/.test(id))return NextResponse.json({error:'INVALID_ID'},{status:400,headers});
 if(!isSupabaseAdminConfigured())return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
 try{
  const db=createAdminClient();
  const {data,error}=await db.from('ai_market_identity')
   .select('id,name,entity_type,official_website,source_url,status,verified_at')
   .eq('id',id).eq('entity_type','product').eq('status','verified').single();
  if(error||!data)return NextResponse.json({error:'NOT_FOUND'},{status:404,headers});
  const {data:claims,error:claimError}=await db.from('ai_market_profile_claims')
   .select('field,field_value,source_url,source_name,checked_at,reviewed_at')
   .eq('entity_id',id).not('reviewed_at','is',null).order('checked_at',{ascending:false}).limit(100);
  if(claimError)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const fields:Record<string,unknown>={};
  const values=new Map<string,Set<string>>();
  for(const c of claims||[]){const v=values.get(c.field)||new Set<string>();v.add(c.field_value);values.set(c.field,v);}
  for(const [key,v] of values)fields[key]=v.size===1?(claims||[]).find(c=>c.field===key):null;
  return NextResponse.json({id:data.id,name:data.name,officialUrl:data.official_website,sourceUrl:data.source_url,verifiedAt:data.verified_at,fields,
   conflictingFields:[...values].filter(([,v])=>v.size>1).map(([k])=>k),feedback:[],metrics:[],
   note:'No unverified reviews, rankings or prices are inferred'},{headers});
 }catch{return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});}
}
