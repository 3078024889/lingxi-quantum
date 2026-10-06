import "server-only";
import https from "node:https";
import {parsePublicHttpsUrl} from "./public-endpoint";

/** Model-list probes use validated DNS exactly once, never follow redirects. */
export async function providerJsonProbe(raw:string,headers:Record<string,string>,timeoutMs=12_000,maxBytes=2*1024*1024,options?:{method?:"GET"|"POST";body?:string|Uint8Array}){
 const deadline=Date.now()+timeoutMs;
 let dnsTimer:ReturnType<typeof setTimeout>|undefined;
 const {url,addresses}=await Promise.race([
  parsePublicHttpsUrl(raw),
  new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(new Error("PROVIDER_TIMEOUT")),timeoutMs)}),
 ]).finally(()=>clearTimeout(dnsTimer));
 const address=addresses[0];
 return new Promise<{ok:boolean;status:number;payload:unknown}>((resolve,reject)=>{
  const remaining=deadline-Date.now();if(remaining<=0){reject(new Error("PROVIDER_TIMEOUT"));return}
  let settled=false;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const fail=(error:Error)=>{if(settled)return;settled=true;clearTimeout(timer);reject(error)};
  const request=https.request({
   hostname:url.hostname,port:443,path:url.pathname+url.search,method:options?.method||"GET",headers,
   servername:url.hostname,rejectUnauthorized:true,
   // Disable address-family racing: this request must use the validated address.
   family:address.family,
   lookup:(_host,_options,callback)=>callback(null,address.address,address.family),
  },response=>{
   const status=response.statusCode??0;
   if(status>=300&&status<400){response.destroy();request.destroy();fail(new Error("PROVIDER_REDIRECT_REJECTED"));return}
   if(Number(response.headers["content-length"])>maxBytes){response.destroy();request.destroy();fail(new Error("PROVIDER_RESPONSE_TOO_LARGE"));return}
   const chunks:Buffer[]=[];let size=0;
   response.on("data",(chunk:Buffer)=>{
    size+=chunk.length;
    if(size>maxBytes){response.destroy();request.destroy();fail(new Error("PROVIDER_RESPONSE_TOO_LARGE"));return}
    chunks.push(chunk);
   });
   response.on("error",fail);
   response.on("aborted",()=>fail(new Error("PROVIDER_RESPONSE_ABORTED")));
   response.on("end",()=>{
    if(settled)return;
    let payload:unknown={};try{payload=JSON.parse(Buffer.concat(chunks,size).toString("utf8"))}catch{if(status>=200&&status<300){fail(new Error("INVALID_PROVIDER_RESPONSE"));return}}
    settled=true;clearTimeout(timer);
    resolve({ok:status>=200&&status<300,status,payload});
   });
  });
  timer=setTimeout(()=>request.destroy(new Error("PROVIDER_TIMEOUT")),remaining);
  request.on("error",fail);if(options?.body)request.end(options.body);else request.end();
 });
}
