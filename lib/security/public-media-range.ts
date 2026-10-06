import 'server-only';
import https from 'node:https';
import {parsePublicHttpsUrl} from './public-endpoint';
export const MEDIA_CHUNK_BYTES=3*1024*1024;
export async function publicMediaRange(raw:string,start:number,redirects=0):Promise<{body:Buffer;range:string;type:string}>{
 const {url,addresses}=await parsePublicHttpsUrl(raw),target=addresses[0];
 return new Promise((resolve,reject)=>{
  const request=https.get(url,{agent:false,headers:{Range:`bytes=${start}-${start+MEDIA_CHUNK_BYTES-1}`,Accept:'video/*,application/octet-stream'},lookup:(_host,_options,callback)=>callback(null,target.address,target.family)},response=>{
   if([301,302,303,307,308].includes(response.statusCode||0)){
    response.resume();if(redirects>=3||!response.headers.location){reject(new Error('MEDIA_REDIRECT'));return}
    void publicMediaRange(new URL(response.headers.location,url).href,start,redirects+1).then(resolve,reject);return;
   }
   if(![200,206].includes(response.statusCode||0)){response.resume();reject(new Error('MEDIA_UNAVAILABLE'));return}
   const range=String(response.headers['content-range']||''),length=Number(response.headers['content-length']||0);
   if(response.statusCode===206&&!new RegExp(`^bytes ${start}-\\d+/\\d+$`).test(range)||response.statusCode===200&&(start!==0||length>MEDIA_CHUNK_BYTES)){response.destroy();reject(new Error('MEDIA_RANGE_UNAVAILABLE'));return}
   const chunks:Buffer[]=[];let bytes=0;
   response.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>MEDIA_CHUNK_BYTES){response.destroy();reject(new Error('MEDIA_TOO_LARGE'))}else chunks.push(chunk)});
   response.on('error',reject);response.on('end',()=>resolve({body:Buffer.concat(chunks),range:range||`bytes 0-${bytes-1}/${bytes}`,type:String(response.headers['content-type']||'application/octet-stream')}));
  });
  const timeout=setTimeout(()=>request.destroy(new Error('MEDIA_TIMEOUT')),20000);request.on('close',()=>clearTimeout(timeout));request.on('error',reject);
 });
}
