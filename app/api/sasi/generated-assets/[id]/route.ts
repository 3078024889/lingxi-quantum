import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {assertOwnedSasiObjectKey,presignSasiArtifact} from '@/lib/sasi-kernel/artifact-store/r2';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:'AUTH_REQUIRED'},{status:401});
 const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:'INVALID_ASSET'},{status:400});
 const admin=createAdminClient();const {data:asset,error}=await admin.from('sasi_generated_assets').select('*').eq('id',id).eq('user_id',user.id).eq('status','ready').maybeSingle();
 if(error)return NextResponse.json({error:'ASSET_UNAVAILABLE'},{status:503});if(!asset)return NextResponse.json({error:'ASSET_NOT_FOUND'},{status:404});
 try{
  const key=assertOwnedSasiObjectKey(user.id,asset.object_key);let url:string;
  if(asset.storage_provider==='r2')url=presignSasiArtifact(key);
  else{const signed=await admin.storage.from(asset.bucket).createSignedUrl(key,300,req.nextUrl.searchParams.get('download')==='1'?{download:`sasi-${asset.kind}-${asset.source_task_id}.${asset.kind==='video'?'mp4':asset.mime_type==='image/jpeg'?'jpg':asset.mime_type.split('/')[1]}`}:{ });if(signed.error||!signed.data)throw Error('SIGN_FAILED');url=signed.data.signedUrl}
  const response=NextResponse.redirect(url,307);response.headers.set('Cache-Control','private, no-store');response.headers.set('Referrer-Policy','no-referrer');return response;
 }catch{return NextResponse.json({error:'ASSET_DOWNLOAD_UNAVAILABLE'},{status:503})}
}
