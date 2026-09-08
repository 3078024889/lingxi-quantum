import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptProviderKey, validByokProvider, type ByokProvider } from "@/lib/sasi/credential-vault";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const probes:Record<ByokProvider,(key:string)=>{url:string;headers:Record<string,string>}>= {
  openai:key=>({url:"https://api.openai.com/v1/models",headers:{Authorization:`Bearer ${key}`}}),
  xai:key=>({url:"https://api.x.ai/v1/models",headers:{Authorization:`Bearer ${key}`}}),
  anthropic:key=>({url:"https://api.anthropic.com/v1/models?limit=1",headers:{"x-api-key":key,"anthropic-version":"2023-06-01"}}),
  luma:key=>({url:"https://api.lumalabs.ai/dream-machine/v1/generations?limit=1",headers:{Authorization:`Bearer ${key}`}}),
  volcengine:key=>({url:"https://ark.cn-beijing.volces.com/api/v3/models",headers:{Authorization:`Bearer ${key}`}}),
  aliyun:key=>({url:"https://dashscope.aliyuncs.com/compatible-mode/v1/models",headers:{Authorization:`Bearer ${key}`}}),
  gemini:key=>({url:"https://generativelanguage.googleapis.com/v1beta/models?pageSize=1",headers:{"x-goog-api-key":key}}),
};

export async function POST(request:NextRequest){
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  let user=null;
  try{const supabase=createClient();({data:{user}}=await supabase.auth.getUser());}catch{user=null;}
  if(!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const body=await request.json().catch(()=>null) as {provider?:unknown}|null;
  if(!body||!validByokProvider(body.provider)) return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
  try{
    const admin=createAdminClient();
    const {data,error}=await admin.from("sasi_provider_connections").select("encrypted_credential,last_checked_at").eq("user_id",user.id).eq("provider",body.provider).maybeSingle();
    if(error||!data) return NextResponse.json({error:"CONNECTION_NOT_FOUND"},{status:404});
    if(data.last_checked_at&&Date.now()-new Date(data.last_checked_at).getTime()<30_000) return NextResponse.json({error:"HEALTH_CHECK_RATE_LIMITED"},{status:429,headers:{"Retry-After":"30"}});
    await admin.from("sasi_provider_connections").update({health_status:"checking",updated_at:new Date().toISOString()}).eq("user_id",user.id).eq("provider",body.provider);
    let status:"healthy"|"unhealthy"="unhealthy";
    let code="PROVIDER_REJECTED";
    try{
      const key=decryptProviderKey(user.id,body.provider,data.encrypted_credential);
      const probe=probes[body.provider](key);
      const response=await fetch(probe.url,{headers:probe.headers,cache:"no-store",signal:AbortSignal.timeout(12_000)});
      status=response.ok?"healthy":"unhealthy";
      code=response.ok?"":response.status===401||response.status===403?"CREDENTIAL_REJECTED":`PROVIDER_HTTP_${response.status}`;
    }catch(error){ code=error instanceof DOMException&&error.name==="TimeoutError"?"PROVIDER_TIMEOUT":"PROVIDER_UNREACHABLE"; }
    await admin.from("sasi_provider_connections").update({health_status:status,last_checked_at:new Date().toISOString(),last_error_code:code||null,updated_at:new Date().toISOString()}).eq("user_id",user.id).eq("provider",body.provider);
    return NextResponse.json({ok:status==="healthy",provider:body.provider,healthStatus:status,errorCode:code||null},{status:status==="healthy"?200:422});
  }catch(error){
    console.error("[sasi byok] health check unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_HEALTH_UNAVAILABLE"},{status:503});
  }
}
