import {NextResponse} from 'next/server';
import {validateVendorSubmission} from '../../../../lib/vendor-submission.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 const here=new URL(request.url);
 if(!origin||origin!==here.origin)return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
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
