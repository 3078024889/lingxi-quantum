import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import tls from 'node:tls';
export const runtime='nodejs'; export const dynamic='force-dynamic';
function cert(host:string){ return new Promise<any>((resolve)=>{ const s=tls.connect(443,host,{servername:host,rejectUnauthorized:false},()=>{ const c=s.getPeerCertificate(); resolve({subject:c.subject,issuer:c.issuer,valid_from:c.valid_from,valid_to:c.valid_to,authorized:s.authorized,authorizationError:s.authorizationError}); s.end();}); s.on('error',e=>resolve({error:e.message})); s.setTimeout(8000,()=>{s.destroy();resolve({error:'TLS_TIMEOUT'})}); }); }
export async function POST(req:Request){
  const {url}=await req.json().catch(()=>({})); if(typeof url!=='string') return NextResponse.json({error:'INVALID_URL'},{status:400});
  let u:URL; try{u=new URL(/^https?:\/\//i.test(url)?url:`https://${url}`)}catch{return NextResponse.json({error:'INVALID_URL'},{status:400})}
  const host=u.hostname; const started=Date.now();
  const [a,aaaa,mx,tlsInfo]=await Promise.all([dns.resolve4(host).catch(()=>[]),dns.resolve6(host).catch(()=>[]),dns.resolveMx(host).catch(()=>[]),cert(host)]);
  let http:any={}; try{const r=await fetch(u.toString(),{redirect:'manual',signal:AbortSignal.timeout(10000)}); http={status:r.status,statusText:r.statusText,location:r.headers.get('location'),server:r.headers.get('server'),contentType:r.headers.get('content-type')};}catch(e){http={error:e instanceof Error?e.message:String(e)}}
  const problems:string[]=[]; if(!a.length&&!aaaa.length)problems.push('DNS_NO_ADDRESS'); if(tlsInfo.error)problems.push('TLS_FAILED'); if(http.error)problems.push('HTTP_FAILED'); if(http.status>=400)problems.push(`HTTP_${http.status}`);
  return NextResponse.json({ok:problems.length===0,host,dns:{a,aaaa,mx},tls:tlsInfo,http,problems,elapsedMs:Date.now()-started});
}
