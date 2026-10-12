import 'server-only';
import https from 'node:https';
import {parsePublicHttpsUrl} from './public-endpoint';

type Policy={kind:'video'|'audio'|'image';allowHtml:boolean;deadline:number;maxBytes?:number;allowTarget?:(url:URL)=>boolean;authHeaders?:Record<string,string>};
export async function fetchPublicMedia(raw:string,policy:Policy):Promise<{response:Response;finalUrl:URL}>{
 let url=new URL(raw),authHeaders=policy.authHeaders;
 for(let hop=0;hop<=5;hop++){
  if(policy.allowTarget&&!policy.allowTarget(url))throw Error('UNTRUSTED_DELIVERY_HOST');
  const remaining=policy.deadline-Date.now();
  if(remaining<=0)throw Error('MEDIA_TIMEOUT');
  let timer:ReturnType<typeof setTimeout>|undefined;
  const validated=await Promise.race([
   parsePublicHttpsUrl(url.href),
   new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('MEDIA_TIMEOUT')),remaining)})
  ]).finally(()=>clearTimeout(timer));
  const target=validated.addresses[0];
  const result=await new Promise<{body:Buffer;type:string;location?:string;status:number}>((resolve,reject)=>{
   const request=https.get(validated.url,{agent:false,rejectUnauthorized:true,family:target.family,
    headers:{...authHeaders,Accept:`${policy.kind}/*,text/html;q=0.9`,'Accept-Encoding':'identity','User-Agent':'LINGXIFIELD-MediaImport/1.0'},
    lookup:(_host,_options,callback)=>callback(null,target.address,target.family)
   },response=>{
    const status=response.statusCode||0;
    if([301,302,303,307,308].includes(status)){
     const location=response.headers.location;response.destroy();
     if(!location){reject(Error('BAD_REDIRECT'));return}
     resolve({body:Buffer.alloc(0),type:'',location,status});return;
    }
    const type=String(response.headers['content-type']||'').split(';')[0].trim().toLowerCase();
    const html=type==='text/html'||type==='application/xhtml+xml';
    const limit=html?5*1024*1024:Math.min(100*1024*1024,policy.maxBytes??100*1024*1024);
    const fail=(code:string)=>{reject(Error(code));response.destroy();request.destroy()};
    if(status<200||status>=300){fail('REMOTE_HTTP_'+status);return}
    if(!(type.startsWith(policy.kind+'/')||(html&&policy.allowHtml))){fail('REMOTE_TYPE_'+(type||'UNKNOWN'));return}
    if(response.headers['content-encoding']&&response.headers['content-encoding']!=='identity'){fail('MEDIA_ENCODING_UNSUPPORTED');return}
    const declared=response.headers['content-length'];
    const length=declared===undefined?undefined:Number(declared);
    if(length!==undefined&&(!/^\d+$/.test(String(declared))||!Number.isSafeInteger(length)||length>limit)){fail(html?'SHARE_PAGE_TOO_LARGE':'MEDIA_TOO_LARGE');return}
    const chunks:Buffer[]=[];let bytes=0;
    response.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>limit){fail(html?'SHARE_PAGE_TOO_LARGE':'MEDIA_TOO_LARGE')}else chunks.push(chunk)});
    response.on('error',reject);response.on('aborted',()=>reject(Error('MEDIA_INCOMPLETE')));
    response.on('end',()=>{if(!bytes||(length!==undefined&&bytes!==length)){reject(Error('MEDIA_INCOMPLETE'));return}resolve({body:Buffer.concat(chunks,bytes),type,status})});
   });
   const timeout=setTimeout(()=>request.destroy(Error('MEDIA_TIMEOUT')),Math.max(1,policy.deadline-Date.now()));
   request.on('close',()=>clearTimeout(timeout));request.on('error',reject);
  });
  if(result.location){if(hop===5)throw Error('TOO_MANY_REDIRECTS');authHeaders=undefined;url=new URL(result.location,url);continue}
  return {response:new Response(new Uint8Array(result.body),{status:result.status,headers:{'content-type':result.type,'content-length':String(result.body.length)}}),finalUrl:url};
 }
 throw Error('TOO_MANY_REDIRECTS');
}
