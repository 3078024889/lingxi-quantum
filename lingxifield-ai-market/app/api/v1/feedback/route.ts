import {NextResponse} from 'next/server';
import {createHmac,randomBytes} from 'node:crypto';
import {validateVisitorFeedback} from '../../../../lib/visitor-feedback.mjs';
import {findPlatform} from '../../../../lib/platform-repository';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const privateHeaders={'Cache-Control':'private, no-store'};
function connection(){
 const url=process.env.AI_MARKET_SUPABASE_URL||process.env.SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 try{
  const base=new URL(url);
  if(base.protocol!=='https:'||!base.hostname.endsWith('.supabase.co'))return null;
  return {base,key};
 }catch{return null;}
}
function authHeaders(key:string){
 const h:Record<string,string>={apikey:key,'Content-Type':'application/json'};
 if(key.startsWith('eyJ'))h.Authorization='Bearer '+key;
 return h;
}
export async function GET(request:Request){
 const db=connection();
 if(!db)return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});
 const qp=new URL(request.url).searchParams;
 const productId=qp.get('product')||'';
 if(productId&&!/^[a-z0-9][a-z0-9-]{0,79}$/.test(productId))
  return NextResponse.json({error:'INVALID_PRODUCT'},{status:400,headers:privateHeaders});
 const url=new URL('/rest/v1/ai_market_visitor_feedback',db.base);
 url.searchParams.set('select','id,category,product_id,nickname,body,locale,created_at');
 url.searchParams.set('status','eq.approved');
 if(productId)url.searchParams.set('product_id','eq.'+productId);
 url.searchParams.set('order','created_at.desc');
 url.searchParams.set('limit','12');
 try{
  const r=await fetch(url,{headers:authHeaders(db.key),signal:AbortSignal.timeout(8000),cache:'no-store'});
  if(!r.ok)return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});
  const rows=await r.json();
  return NextResponse.json({items:Array.isArray(rows)?rows:[]},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)
  return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers:privateHeaders});
 const db=connection(),secret=process.env.AI_MARKET_FEEDBACK_HMAC_KEY;
 if(!db||!secret||secret.length<48)return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});
 if(Number(request.headers.get('content-length')||0)>5500)
  return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers:privateHeaders});
 let data:unknown;
 try{
  const raw=await request.text();
  if(Buffer.byteLength(raw,'utf8')>5500)throw new Error('length');
  data=JSON.parse(raw);
 }catch{return NextResponse.json({error:'INVALID_JSON'},{status:400,headers:privateHeaders});}
 if(data&&typeof data==='object'&&'websiteAddress' in data&&Boolean((data as Record<string,unknown>).websiteAddress))
  return NextResponse.json({accepted:true,reviewRequired:true},{status:202,headers:privateHeaders});
 const parsed=validateVisitorFeedback(data);
 if(!parsed)return NextResponse.json({error:'INVALID_FEEDBACK'},{status:400,headers:privateHeaders});
 if(parsed.productId&&!findPlatform(parsed.productId))
  return NextResponse.json({error:'INVALID_PRODUCT'},{status:400,headers:privateHeaders});
 // Pseudonymize network fingerprint; never store raw IP or expose email.
 const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown';
 // Rotate the pseudonymous fingerprint daily; no raw IP is stored in the database.
 const visitorHash=createHmac('sha256',secret).update(new Date().toISOString().slice(0,10)+'|'+ip.split(',')[0].trim()).digest('hex');
 const nonce=randomBytes(16).toString('hex');
 const issuedAt=Math.floor(Date.now()/1000);
 const signature=createHmac('sha256',secret).update([nonce,issuedAt,visitorHash].join('.')).digest('hex');
 const rpc=new URL('/rest/v1/rpc/ai_market_submit_visitor_feedback',db.base);
 const doc={...parsed,nonce,issuedAt,visitorHash};
 try{
  const response=await fetch(rpc,{method:'POST',headers:authHeaders(db.key),
   body:JSON.stringify({p_document:doc,p_signature:signature}),signal:AbortSignal.timeout(9000),redirect:'error',cache:'no-store'});
  if(!response.ok){
   if(response.status===400||response.status===409){
    const failure=await response.json().catch(()=>({}));
    if(/RATE_LIMITED/.test(failure.message||''))return NextResponse.json({error:'RATE_LIMITED'},{status:429,headers:privateHeaders});
   }
   return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});
  }
  const saved=await response.json();
  if(saved?.accepted!==true)return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});
  return NextResponse.json({accepted:true,reviewRequired:saved.reviewRequired===true,published:saved.published===true,nickname:saved.nickname},{status:saved.published===true?201:202,headers:privateHeaders});
 }catch{return NextResponse.json({error:'FEEDBACK_NOT_AVAILABLE'},{status:503,headers:privateHeaders});}
}
