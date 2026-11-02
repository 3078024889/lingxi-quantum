/** Public HTTPS entry probes: network reachability only, never a logged-in functional test. */
import {isIP} from 'node:net';
export function safePublicPublisherUrl(value){
 try{
  const u=new URL(value),h=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||u.port||!h||isIP(h)||h==='localhost'||
    h.endsWith('.local')||h.endsWith('.internal')||h.endsWith('.test')||
    h.endsWith('.example')||h.includes('..'))return null;
  return u;
 }catch{return null}
}
export function classifyPublisherResponse(status,location,base){
 if(status>=200&&status<300)return {result:'http_reachable',status};
 if(status>=300&&status<400){
  let target=null;
  try{if(location){const u=safePublicPublisherUrl(new URL(location,base).href);target=u?u.hostname:null}}catch{}
  return {result:target?'redirect_needs_review':'invalid_redirect',status,redirectHost:target};
 }
 if(status===401||status===403)return {result:'access_control_or_bot_challenge',status};
 if(status===429)return {result:'rate_limited',status};
 if(status===405)return {result:'head_not_supported',status};
 if(status===404||status===410)return {result:'http_not_found',status};
 return {result:'http_error',status};
}
export async function probeOfficialEndpoint({id,url,kind},fetcher=fetch,timeout=7000){
 const parsed=safePublicPublisherUrl(url);
 if(!parsed)return {id,kind,result:'invalid_url'};
 try{
  const response=await fetcher(parsed.href,{method:'HEAD',redirect:'manual',cache:'no-store',
   headers:{'user-agent':'LINGXIFIELD-source-validation/1.0 (+https://lingxifield.com)','accept':'text/html,*/*'},
   signal:AbortSignal.timeout(Math.min(10000,Math.max(1000,timeout)))});
  return {id,kind,host:parsed.hostname,...classifyPublisherResponse(response.status,response.headers.get('location'),parsed.href)};
 }catch{return {id,kind,host:parsed.hostname,result:'network_unavailable'};}
}
