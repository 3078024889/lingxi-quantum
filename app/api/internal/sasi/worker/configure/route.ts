import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {createAdminClient} from '@/lib/supabase/admin';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:NextRequest){
 const secret=process.env.SASI_WORKER_SECRET||'';
 const expected=Buffer.from('Bearer '+secret),actual=Buffer.from(request.headers.get('authorization')||'');
 if(secret.length<24||actual.length!==expected.length||!timingSafeEqual(actual,expected))return NextResponse.json({error:'NOT_FOUND'},{status:404});
 const {data,error}=await createAdminClient().rpc('configure_sasi_worker_v78',{p_secret:secret});
 return NextResponse.json(error||data!==true?{error:'WORKER_CONFIGURATION_FAILED'}:{configured:true},{status:error||data!==true?503:200,headers:{'Cache-Control':'no-store'}});
}
