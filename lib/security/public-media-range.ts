import 'server-only';
import https from 'node:https';
import {parsePublicHttpsUrl} from './public-endpoint';
export const MEDIA_CHUNK_BYTES=3*1024*1024;
type MediaRange={body:Buffer;range:string;type:string};
export function publicMediaRange(raw:string,start:number,redirects=0):Promise<MediaRange>{return readMediaRange(raw,start,redirects,{},Date.now()+20000)}
export function authenticatedMediaRange(raw:string,start:number,headers:Record<string,string>):Promise<MediaRange>{return readMediaRange(raw,start,0,headers,Date.now()+20000)}
async function readMediaRange(raw:string,start:number,redirects:number,headers:Record<string,string>,deadline:number):Promise<MediaRange>{
 if(!Number.isSafeInteger(start)||start<0||start%MEDIA_CHUNK_BYTES)throw Error('MEDIA_RANGE_INVALID');
 let dnsTimer:ReturnType<typeof setTimeout>|undefined;
 const {url,addresses}=await Promise.race([parsePublicHttpsUrl(raw),new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('MEDIA_TIMEOUT')),Math.max(1,deadline-Date.now()))})]).finally(()=>clearTimeout(dnsTimer)),target=addresses[0];
 if(deadline<=Date.now())throw Error('MEDIA_TIMEOUT');
 return new Promise((resolve,reject)=>{
  const request=https.get(url,{agent:false,family:target.family,headers:{...headers,Range:`bytes=${start}-${start+MEDIA_CHUNK_BYTES-1}`,Accept:'video/*,application/octet-stream'},lookup:(_host,_options,callback)=>callback(null,target.address,target.family)},response=>{
   if([301,302,303,307,308].includes(response.statusCode||0)){
    response.resume();if(Object.keys(headers).length||redirects>=3||!response.headers.location){reject(new Error('MEDIA_REDIRECT'));return}
    void readMediaRange(new URL(response.headers.location,url).href,start,redirects+1,headers,deadline).then(resolve,reject);return;
   }
   if(![200,206].includes(response.statusCode||0)){response.resume();reject(new Error('MEDIA_UNAVAILABLE'));return}
   const range=String(response.headers['content-range']||''),length=Number(response.headers['content-length']||0),match=range.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
   const end=match?Number(match[2]):0,total=match?Number(match[3]):0;
   if(response.statusCode===206&&(!match||Number(match[1])!==start||!Number.isSafeInteger(total)||end<start||end>=total||end-start+1>MEDIA_CHUNK_BYTES)||response.statusCode===200&&(start!==0||length>MEDIA_CHUNK_BYTES)){response.destroy();reject(new Error('MEDIA_RANGE_UNAVAILABLE'));return}
   const chunks:Buffer[]=[];let bytes=0;
   response.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>MEDIA_CHUNK_BYTES){response.destroy();reject(new Error('MEDIA_TOO_LARGE'))}else chunks.push(chunk)});
   response.on('error',reject);response.on('aborted',()=>reject(Error('MEDIA_ABORTED')));response.on('end',()=>{
    if(!bytes||response.statusCode===206&&bytes!==end-start+1||length>0&&bytes!==length){reject(Error('MEDIA_INCOMPLETE'));return}
    resolve({body:Buffer.concat(chunks),range:range||`bytes 0-${bytes-1}/${bytes}`,type:String(response.headers['content-type']||'application/octet-stream')});
   });
  });
  const timeout=setTimeout(()=>request.destroy(new Error('MEDIA_TIMEOUT')),Math.max(1,deadline-Date.now()));request.on('close',()=>clearTimeout(timeout));request.on('error',reject);
 });
}
