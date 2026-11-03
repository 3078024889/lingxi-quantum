import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const NO_STORE={'Cache-Control':'private, no-store'};
const COOKIE='lf_market_admin';
function backend(){
 const endpoint=process.env.AI_MARKET_SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY;
 if(!endpoint||!key)return null;
 try{const url=new URL(endpoint);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))return null;
  return {url,key};
 }catch{return null;}
}
function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'FORBIDDEN'},{status:403,headers:NO_STORE});
 const db=backend();if(!db)return NextResponse.json({error:'UNAVAILABLE'},{status:503,headers:NO_STORE});
 if(Number(request.headers.get('content-length')||0)>3072)return NextResponse.json({error:'BAD_INPUT'},{status:400,headers:NO_STORE});
 let data:unknown;
 try{const raw=await request.text();if(raw.length>3072)throw 1;data=JSON.parse(raw);}
 catch{return NextResponse.json({error:'BAD_INPUT'},{status:400,headers:NO_STORE});}
 if(!data||typeof data!=='object')return NextResponse.json({error:'BAD_INPUT'},{status:400,headers:NO_STORE});
 const o=data as Record<string,unknown>;
 const email=typeof o.email==='string'?o.email.trim().toLowerCase():'';
 const password=typeof o.password==='string'?o.password:'';
 if(!/^[^\s@]{1,80}@[^\s@]{1,160}$/.test(email)||password.length<6||password.length>200)
  return NextResponse.json({error:'BAD_INPUT'},{status:400,headers:NO_STORE});
 try{
  const url=new URL('/auth/v1/token',db.url);url.searchParams.set('grant_type','password');
  const a=await fetch(url,{method:'POST',headers:{apikey:db.key,'Content-Type':'application/json'},
   body:JSON.stringify({email,password}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000)});
  if(!a.ok)return NextResponse.json({error:'INVALID_LOGIN'},{status:401,headers:NO_STORE});
  const session=await a.json();
  if(!session?.access_token||typeof session.access_token!=='string')
   return NextResponse.json({error:'INVALID_LOGIN'},{status:401,headers:NO_STORE});
  // Authorization must also succeed in the database; valid passwords alone do not grant moderator access.
  const rpc=new URL('/rest/v1/rpc/ai_market_pending_feedback',db.url);
  const authorized=await fetch(rpc,{method:'POST',headers:{apikey:db.key,
   Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({p_limit:1}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(9000)});
  if(!authorized.ok)return NextResponse.json({error:'NOT_AUTHORIZED'},{status:403,headers:NO_STORE});
  const response=NextResponse.json({ok:true},{headers:NO_STORE});
  response.cookies.set(COOKIE,session.access_token,{
   httpOnly:true,secure:true,sameSite:'strict',path:'/api/v1/admin',
   maxAge:Math.min(Math.max(Number(session.expires_in)||3600,60),3600)
  });
  return response;
 }catch{return NextResponse.json({error:'UNAVAILABLE'},{status:503,headers:NO_STORE});}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'FORBIDDEN'},{status:403,headers:NO_STORE});
 const jar=await cookies();jar.delete(COOKIE);
 const r=NextResponse.json({ok:true},{headers:NO_STORE});
 r.cookies.set(COOKIE,'',{httpOnly:true,secure:true,sameSite:'strict',path:'/api/v1/admin',maxAge:0});
 return r;
}
