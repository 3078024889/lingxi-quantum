// Local-only .cn Office normalization adapter for the existing HMAC document gateway.
// No public host or user-provided URL is accepted. Never expose this function to a client.
import {createHmac,randomUUID} from "node:crypto";

const LOCAL_GATEWAY_URL="http://127.0.0.1:3100/convert";
const MAX_BYTES=50*1024*1024;

export function localSignedGatewayConfigured(env:NodeJS.ProcessEnv=process.env){
 const secret=(env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||"").trim();
 return env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn" &&
  !env.VERCEL && secret.length>=32;
}

export async function localSignedGatewayResponse(
 file:File,
 signal:AbortSignal,
 options:{env?:NodeJS.ProcessEnv;fetcher?:typeof fetch;nowMs?:number}={}
):Promise<Response|null>{
 const env=options.env||process.env;
 if(!localSignedGatewayConfigured(env))return null;
 if(file.size<1||file.size>MAX_BYTES)throw new Error("DOCUMENT_SIZE_UNSUPPORTED");
 const name=file.name;
 if(!name||name.length>240||/[\u0000\r\n\\/]/.test(name))
  throw new Error("DOCUMENT_GATEWAY_FILENAME_INVALID");
 const mime=(file.type||"application/octet-stream").slice(0,160);
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.length!==file.size)throw new Error("DOCUMENT_GATEWAY_SIZE_MISMATCH");
 const exp=Math.floor((options.nowMs??Date.now())/1000)+300;
 const nonce=randomUUID(),version="v1";
 const payload=[version,exp,nonce,bytes.length,name,mime].join("\n");
 const token=createHmac("sha256",(env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||"").trim())
  .update(payload).digest("base64url");
 const response=await (options.fetcher||fetch)(LOCAL_GATEWAY_URL,{
  method:"POST",redirect:"error",cache:"no-store",signal,
  headers:{
   "content-type":mime,
   "x-lingxifield-ticket-version":version,
   "x-lingxifield-filename":encodeURIComponent(name),
   "x-lingxifield-size":String(bytes.length),
   "x-lingxifield-exp":String(exp),
   "x-lingxifield-nonce":nonce,
   "x-lingxifield-token":token
  },
  body:bytes
 });
 if(!response.ok){
  await response.body?.cancel();
  throw new Error("DOCUMENT_GATEWAY_HTTP_"+response.status);
 }
 return response;
}
