import "server-only";
import {createHash} from "node:crypto";
export type ImageProfile={model:string;size:string;estimatedFen:number;validUntil:string;priceSource:string};
export function imageProfile(raw=process.env.SASI_BYOK_IMAGE_PROFILE):ImageProfile|null{
 try{const p=JSON.parse(raw??"null");if(!p||typeof p.model!=="string"||!/^[a-z0-9._-]{3,180}$/i.test(p.model)||!["1K","2K","4K"].includes(p.size)||!Number.isSafeInteger(p.estimatedFen)||p.estimatedFen<1||p.estimatedFen>100000||!Number.isFinite(Date.parse(p.validUntil))||Date.parse(p.validUntil)<=Date.now())return null;
 const u=new URL(p.priceSource);if(u.protocol!=="https:"||!["www.volcengine.com","docs.volcengine.com"].includes(u.hostname))return null;
 return{model:p.model,size:p.size,estimatedFen:p.estimatedFen,validUntil:p.validUntil,priceSource:u.toString()};}catch{return null;}
}
export const imageVersion=(p:ImageProfile)=>createHash("sha256").update(JSON.stringify(p)).digest("hex");
export async function generateImage(key:string,p:ImageProfile,prompt:string){
 const r=await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations",{method:"POST",cache:"no-store",signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:p.model,prompt,size:p.size,response_format:"url",sequential_image_generation:"disabled",watermark:true})});
 if(!r.ok)throw new Error(`ARK_HTTP_${r.status}`);const d=await r.json();
 if(!Array.isArray(d.data)||d.data.length!==1||typeof d.data[0]?.url!=="string")throw new Error("IMAGE_RESULT_INVALID");
 const u=new URL(d.data[0].url);if(u.protocol!=="https:"||u.username||u.password)throw new Error("IMAGE_RESULT_INVALID");
 return{imageUrl:u.toString(),model:p.model,aiGenerated:true};
}
