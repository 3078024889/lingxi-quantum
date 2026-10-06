import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {createAdminClient} from '@/lib/supabase/admin';
import {publicMediaRange,MEDIA_CHUNK_BYTES} from '@/lib/security/public-media-range';
export const runtime='nodejs';export const maxDuration=30;
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:'AUTH_REQUIRED'},{status:401});
 const id=req.nextUrl.searchParams.get('taskId')||'',start=Number(req.nextUrl.searchParams.get('start')||0);
 if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isSafeInteger(start)||start<0||start>150*1024*1024||start%MEDIA_CHUNK_BYTES)return NextResponse.json({error:'INVALID_RANGE'},{status:400});
 const guard=await enforceAbuseGuard(req,{scope:'sasi-video-file',userId:user.id,accountLimit:1200,ipLimit:3600});if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status});
 const {data:task}=await createAdminClient().from('sasi_byok_video_tasks').select('output').eq('id',id).eq('user_id',user.id).eq('state','succeeded').maybeSingle();
 if(typeof task?.output?.videoUrl!=='string')return NextResponse.json({error:'VIDEO_NOT_FOUND'},{status:404});
 try{const file=await publicMediaRange(task.output.videoUrl,start);return new NextResponse(new Uint8Array(file.body),{status:206,headers:{'Content-Type':'application/octet-stream','Content-Range':file.range,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
 catch{return NextResponse.json({error:'VIDEO_DOWNLOAD_UNAVAILABLE'},{status:502})}
}
