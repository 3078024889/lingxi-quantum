import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient,isSupabaseAdminConfigured} from '@/lib/supabase/admin';
import {assembleProductResponse} from '@/lib/ai-market/profile-response.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id:rawId}=await params;
 const id=rawId||'';
 if(!id||id.length>250||/[\x00-\x1f]/.test(id))return NextResponse.json({error:'INVALID_ID'},{status:400,headers});
 if(!isSupabaseAdminConfigured())return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
 try{
  const db=createAdminClient();
  const {data,error}=await db.from('ai_market_identity')
   .select('id,name,entity_type,official_website,source_url,status,verified_at')
   .eq('id',id).eq('entity_type','product').eq('status','verified').single();
  if(error||!data)return NextResponse.json({error:'NOT_FOUND'},{status:404,headers});
  const {data:claims,error:claimError}=await db.from('ai_market_profile_claims')
   .select('field,field_value,source_url,source_name,checked_at,reviewed_at,reviewed_by')
   .eq('entity_id',id).not('reviewed_at','is',null).order('checked_at',{ascending:false}).limit(100);
  if(claimError)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const result=assembleProductResponse(data,claims||[]);
  if(!result)return NextResponse.json({error:'NOT_FOUND'},{status:404,headers});
  return NextResponse.json(result,{headers});
 }catch{return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});}
}
