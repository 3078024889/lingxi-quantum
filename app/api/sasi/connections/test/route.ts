import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {decryptProviderKey,validByokProvider,type ByokProvider} from "@/lib/sasi/credential-vault";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {validateProviderBaseUrl} from "@/lib/sasi/gateway/ssrf-guard";
import {chooseTextModel,defaultBaseUrl,providerPublicCapabilities} from "@/lib/sasi/intelligence/provider-defaults";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type Probe={url:string;headers:Record<string,string>};
function safeBase(provider:ByokProvider,storedBase:string){
  const raw=storedBase.trim()||defaultBaseUrl(provider);
  const guard=validateProviderBaseUrl(raw);
  if(!guard.pass||!guard.normalized)throw new Error("PROVIDER_URL_REJECTED");
  return guard.normalized.replace(/\/$/,"");
}
function probeFor(provider:ByokProvider,key:string,storedBase:string):Probe{
 const base=safeBase(provider,storedBase),bearer={Authorization:`Bearer ${key}`};
 switch(provider){
  case "anthropic":return{url:`${base}/models?limit=20`,headers:{"x-api-key":key,"anthropic-version":"2023-06-01"}};
  case "gemini":return{url:`${base}/models?pageSize=50`,headers:{"x-goog-api-key":key}};
  case "luma":return{url:`${base}/generations?limit=1`,headers:bearer};
  default:return{url:`${base}/models`,headers:bearer};
 }
}
function modelsFrom(provider:ByokProvider,payload:any):string[]{
 const rows=provider==="gemini"?payload?.models:payload?.data;
 if(!Array.isArray(rows))return [];
 return rows.map((x:any)=>String(x?.id||x?.name||"").replace(/^models\//,"")).filter((x:string)=>x&&x.length<=180).slice(0,80);
}
export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
 let user=null;try{const supabase=createClient();({data:{user}}=await supabase.auth.getUser())}catch{user=null}
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const guard1=await enforceAbuseGuard(request,{scope:"sasi-byok-test",userId:user.id,accountLimit:60,ipLimit:180});if(!guard1.ok)return NextResponse.json({error:guard1.error},{status:guard1.status});
 const guard2=await enforceAbuseGuard(request,{scope:"byok-connection-test",userId:user.id,accountLimit:30,ipLimit:90});if(!guard2.ok)return NextResponse.json({error:guard2.error},{status:guard2.status});
 const body=await request.json().catch(()=>null) as {provider?:unknown}|null;if(!body||!validByokProvider(body.provider))return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
 try{
  const admin=createAdminClient();const{data,error}=await admin.from("sasi_provider_connections").select("encrypted_credential,last_checked_at,base_url,model_id").eq("user_id",user.id).eq("provider",body.provider).maybeSingle();
  if(error||!data)return NextResponse.json({error:"CONNECTION_NOT_FOUND"},{status:404});
  if(data.last_checked_at&&Date.now()-new Date(data.last_checked_at).getTime()<30_000)return NextResponse.json({error:"HEALTH_CHECK_RATE_LIMITED"},{status:429,headers:{"Retry-After":"30"}});
  await admin.from("sasi_provider_connections").update({health_status:"checking",updated_at:new Date().toISOString()}).eq("user_id",user.id).eq("provider",body.provider);
  let status:"healthy"|"unhealthy"="unhealthy",code="PROVIDER_REJECTED",models:string[]=[],started=Date.now();
  try{
    const key=decryptProviderKey(user.id,body.provider,data.encrypted_credential);const probe=probeFor(body.provider,key,String(data.base_url||""));started=Date.now();
    const response=await fetch(probe.url,{headers:probe.headers,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12_000)});
    const payload=await response.json().catch(()=>({}));
    status=response.ok?"healthy":"unhealthy";code=response.ok?"":response.status===401||response.status===403?"CREDENTIAL_REJECTED":`PROVIDER_HTTP_${response.status}`;
    if(response.ok)models=modelsFrom(body.provider,payload);
  }catch(error){code=error instanceof DOMException&&error.name==="TimeoutError"?"PROVIDER_TIMEOUT":error instanceof Error&&error.message==="PROVIDER_URL_REJECTED"?"SERVICE_ADDRESS_INVALID":"PROVIDER_UNREACHABLE"}
  const capabilities=status==="healthy"?providerPublicCapabilities(body.provider):[];
  const modelId=status==="healthy"?chooseTextModel(body.provider,models,String(data.model_id||"")):String(data.model_id||"");
  const now=new Date().toISOString();
  await admin.from("sasi_provider_connections").update({health_status:status,last_checked_at:now,last_error_code:code||null,capabilities,capability_checked_at:status==="healthy"?now:null,discovered_models:models,model_id:modelId,cooldown_until:null,last_success_at:status==="healthy"?now:null,last_latency_ms:typeof started==="number"?Math.max(0,Date.now()-started):null,updated_at:now}).eq("user_id",user.id).eq("provider",body.provider);
  return NextResponse.json({ok:status==="healthy",provider:body.provider,healthStatus:status,errorCode:code||null,capabilities,model:modelId||null,modelCount:models.length},{status:status==="healthy"?200:422});
 }catch(error){console.error("[sasi connection] health check unavailable",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"CONNECTION_CHECK_UNAVAILABLE"},{status:503})}
}
