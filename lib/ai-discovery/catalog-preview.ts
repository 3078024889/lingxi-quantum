/** Pure server-side catalog adapter. Never expose unreviewed third-party responses. */
import {normalizeOpenRouterCatalog} from "./openrouter-normalizer";
export type CatalogPreview={status:"ok"|"unavailable";source:string;observedAt:string|null;count:number;models:ReturnType<typeof normalizeOpenRouterCatalog>;error?:string};
export async function fetchCatalogPreview(fetcher:typeof fetch=fetch):Promise<CatalogPreview>{
 const source="https://openrouter.ai/api/v1/models";
 const apiKey=process.env.OPENROUTER_API_KEY;
 if(!apiKey)return {status:"unavailable",source,observedAt:null,count:0,models:[],error:"Provider API key not configured"};
 const unavailable=(error:string):CatalogPreview=>({status:"unavailable",source,observedAt:null,count:0,models:[],error});
 try{
  const response=await fetcher(source,{headers:{Accept:"application/json",Authorization:"Bearer "+apiKey},signal:AbortSignal.timeout(8000),cache:"no-store"});
  if(!response.ok)return unavailable("Provider HTTP "+response.status);
  const length=Number(response.headers.get("content-length"));
  if(Number.isFinite(length)&&length>3_000_000)return unavailable("Response exceeds size limit");
  const body=await response.text();
  if(body.length>3_000_000)return unavailable("Response exceeds size limit");
  const observedAt=new Date().toISOString();
  const models=normalizeOpenRouterCatalog(JSON.parse(body),observedAt);
  if(models.length===0)return unavailable("No valid models");
  return {status:"ok",source,observedAt,count:models.length,models};
 }catch{return unavailable("Provider unavailable or malformed response");}
}
