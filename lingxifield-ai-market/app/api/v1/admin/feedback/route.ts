import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const COOKIE='lf_market_admin';
const NO_STORE={'Cache-Control':'private, no-store'};
function backend(){
 const endpoint=process.env.AI_MARKET_SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY;
 if(!endpoint||!key)return null;
 try{const url=new URL(endpoint);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))return null;return {url,key};}catch{return null;}
}
async function callModerator(name:string,body:Record<string,unknown>){
 const store=await cookies();const token=store.get(COOKIE)?.value;
 const db=backend();
 if(!token||!db)return NextResponse.json({error:'UNAUTHORIZED'},{status:401,headers:NO_STORE});
 const endpoint=new URL('/rest/v1/rpc/'+name,db.url);
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{apikey:db.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify(body),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(9500)});
  if(response.status===401||response.status===403)return NextResponse.json({error:'UNAUTHORIZED'},{status:403,headers:NO_STORE});
  if(!response.ok)return NextResponse.json({error:'MODERATION_FAILED'},{status:response.status===400?400:503,headers:NO_STORE});
  return NextResponse.json(await response.json(),{headers:NO_STORE});
 }catch{return NextResponse.json({error:'UNAVAILABLE'},{status:503,headers:NO_STORE});}
}
export async function GET(){return callModerator('ai_market_pending_feedback',{p_limit:40});}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)
  return NextResponse.json({error:'FORBIDDEN'},{status:403,headers:NO_STORE});
 let payload:unknown;
 try{const raw=await request.text();if(raw.length>1100)throw 1;payload=JSON.parse(raw);}
 catch{return NextResponse.json({error:'BAD_REQUEST'},{status:400,headers:NO_STORE});}
 if(!payload||typeof payload!=='object'||Array.isArray(payload))
  return NextResponse.json({error:'BAD_REQUEST'},{status:400,headers:NO_STORE});
 const doc=payload as Record<string,unknown>;
 const id=typeof doc.id==='string'?doc.id:'';
 const decision=doc.decision;
 const reason=typeof doc.reason==='string'?doc.reason:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
 ||!['approved','rejected'].includes(String(decision))||reason.length>500)
  return NextResponse.json({error:'BAD_REQUEST'},{status:400,headers:NO_STORE});
 return callModerator('ai_market_moderate_feedback',{p_id:id,p_decision:decision,p_reason:reason});
}
