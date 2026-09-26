import "server-only";
import {createHash,createHmac} from "node:crypto";
function env(name:string){return process.env[name]?.trim()||""}
function workerBase(){
 const raw=env("SASI_LOCAL_GENERATION_WORKER_URL").replace(/\/$/,"");if(!raw)throw new Error("LOCAL_GENERATION_WORKER_NOT_CONFIGURED");
 const u=new URL(raw);const allowed=new Set(env("SASI_LOCAL_GENERATION_ALLOWED_HOSTS").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean));
 const local=u.hostname==="127.0.0.1"||u.hostname==="localhost";
 if(u.protocol!=="https:"&&!local)throw new Error("LOCAL_GENERATION_WORKER_HTTPS_REQUIRED");
 if(!local&&allowed.size&& !allowed.has(u.hostname.toLowerCase()))throw new Error("LOCAL_GENERATION_WORKER_HOST_NOT_ALLOWED");
 return raw;
}
export async function submitLocalGeneration(input:{kind:"image"|"video";prompt:string;ratio:string;duration?:number;style?:string}){
 const secret=env("SASI_LOCAL_GENERATION_WORKER_SECRET");if(secret.length<24)throw new Error("LOCAL_GENERATION_WORKER_SECRET_INVALID");
 const body=JSON.stringify({...input,model:env(input.kind==="image"?"SASI_LOCAL_IMAGE_MODEL":"SASI_LOCAL_VIDEO_MODEL")});
 const ts=String(Date.now()),digest=createHash("sha256").update(body).digest("hex"),sig=createHmac("sha256",secret).update(`${ts}.${digest}`).digest("hex");
 const r=await fetch(`${workerBase()}/v1/generate`,{method:"POST",headers:{"content-type":"application/json","x-lingxi-timestamp":ts,"x-lingxi-signature":sig},body,cache:"no-store",signal:AbortSignal.timeout(30_000)});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(data?.error||`LOCAL_WORKER_HTTP_${r.status}`).slice(0,160));return data;
}
