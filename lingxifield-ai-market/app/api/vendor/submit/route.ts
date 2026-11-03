import {NextResponse} from 'next/server';
import {validateVendorSubmission} from '../../../../lib/vendor-submission.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 const here=new URL(request.url);
 // Next.js can expose localhost/127.0.0.1 or the internal proxy origin in tests.
 // Compare the browser Origin with the actual HTTP Host as well as request.url.
 // Never rely on untrusted X-Forwarded-Host or accept a missing/foreign Origin.
 let sameOrigin=Boolean(origin&&origin===here.origin);
 if(!sameOrigin&&origin){
  try{
   const parsed=new URL(origin),httpHost=request.headers.get('host')?.toLowerCase();
   const loopback=(h:string)=>h==='localhost'||h==='127.0.0.1'||h==='[::1]';
   const localProtocol=parsed.protocol==='http:'&&loopback(parsed.hostname);
   const validProtocol=parsed.protocol==='https:'||localProtocol;
   if(parsed.origin===origin&&validProtocol){
    if(httpHost&&parsed.host.toLowerCase()===httpHost)sameOrigin=true;
    else if(localProtocol&&loopback(here.hostname)&&parsed.port===here.port&&here.protocol==='http:')sameOrigin=true;
   }
  }catch{sameOrigin=false;}
 }
 if(!sameOrigin)return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
 const length=Number(request.headers.get('content-length')||0);
 if(length>6500)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});
 let raw:string;try{raw=await request.text();}catch{return NextResponse.json({error:'INVALID_BODY'},{status:400,headers});}
 if(Buffer.byteLength(raw,'utf8')>6500)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});
 let payload:Record<string,unknown>;
 try{payload=JSON.parse(raw)}catch{return NextResponse.json({error:'INVALID_JSON'},{status:400,headers})}
 // Bot trap, deliberately absent from visible form.
 if(payload.websiteAddress)return NextResponse.json({accepted:true},{status:202,headers});
 const parsed=validateVendorSubmission(payload);
 if(!parsed)return NextResponse.json({error:'INVALID_SUBMISSION'},{status:400,headers});
 // Ownership applications require the existing LINGXIFIELD account and must never be accepted from this public lead form.
 if(parsed.request_type==='claim')return NextResponse.json({error:'LOGIN_REQUIRED_MAIN_ACCOUNT'},{status:401,headers});
 const base=process.env.AI_MARKET_SUPABASE_URL||process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!base||!key)return NextResponse.json({error:'SUBMISSION_NOT_AVAILABLE'},{status:503,headers});
 let url:URL;
 try{url=new URL('/rest/v1/rpc/ai_market_submit_vendor_submission',base)}catch{return NextResponse.json({error:'SUBMISSION_NOT_AVAILABLE'},{status:503,headers})}
 if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))return NextResponse.json({error:'SUBMISSION_NOT_AVAILABLE'},{status:503,headers});
 try{
  const {domainMatches,...row}=parsed;
  const authHeaders:Record<string,string>={apikey:key,'Content-Type':'application/json'};
  if(key.startsWith('eyJ'))authHeaders.Authorization='Bearer '+key; // Legacy anon JWT.
  const response=await fetch(url,{method:'POST',headers:authHeaders,
   body:JSON.stringify({p_document:row}),signal:AbortSignal.timeout(10000),redirect:'error',cache:'no-store'});
  if(response.status===409)return NextResponse.json({accepted:true,alreadySubmitted:true},{status:202,headers});
  if(!response.ok)return NextResponse.json({error:'SUBMISSION_NOT_AVAILABLE'},{status:503,headers});
  // No permission or edit rights are granted. Email-domain match is not itself ownership proof.
  return NextResponse.json({accepted:true,reviewRequired:true},{status:202,headers});
 }catch{return NextResponse.json({error:'SUBMISSION_NOT_AVAILABLE'},{status:503,headers})}
}
