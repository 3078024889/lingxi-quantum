import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { byokVaultConfigured, encryptProviderKey, providerKeyFingerprint, providerKeyHint, validateProviderKey, validByokProvider } from "@/lib/sasi/credential-vault";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import {validateProviderBaseUrl} from "@/lib/sasi/gateway/ssrf-guard";
import {parsePublicHttpsUrl} from "@/lib/security/public-endpoint";
import {chooseTextModel,defaultBaseUrl,modelPreferences} from "@/lib/sasi/intelligence/provider-defaults";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function identity() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch { return null; }
}

export async function GET() {
  const user = await identity();
  if (!user) return NextResponse.json({ error:"AUTH_REQUIRED", vaultReady:byokVaultConfigured() }, { status:401 });
  if (!byokVaultConfigured()) return NextResponse.json({ error:"BYOK_VAULT_NOT_CONFIGURED", vaultReady:false }, { status:503 });
  try {
    const { data,error } = await createAdminClient().from("sasi_provider_connections")
      .select("provider,key_hint,health_status,last_checked_at,last_error_code,capabilities,model_id,model_preferences,base_url,cooldown_until,last_success_at,last_latency_ms,updated_at")
      .eq("user_id",user.id).order("updated_at",{ascending:false});
    if(error) throw error;
    return NextResponse.json({ vaultReady:true, connections:(data??[]).map(row=>({
      service:row.provider,provider:row.provider,keyHint:row.key_hint,healthStatus:row.health_status,lastCheckedAt:row.last_checked_at,
      lastErrorCode:row.last_error_code,capabilities:row.capabilities??[],model:row.model_id||"",models:modelPreferences(row.model_preferences),baseUrl:row.base_url||"",cooldownUntil:row.cooldown_until||null,lastSuccessAt:row.last_success_at||null,lastLatencyMs:row.last_latency_ms??null,updatedAt:row.updated_at,
    })) },{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error("[sasi byok] list unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_FOUNDATION_UNAVAILABLE",vaultReady:true},{status:503});
  }
}

export async function POST(request:NextRequest) {
  const contentLength=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"BYOK_REQUEST_TOO_LARGE"},{status:413});
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  const user = await identity();
  if (!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const abuse=await enforceAbuseGuard(request,{scope:"sasi-byok-save",userId:user.id,accountLimit:60,ipLimit:180});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  if (!byokVaultConfigured()) return NextResponse.json({error:"BYOK_VAULT_NOT_CONFIGURED"},{status:503});
  const body=await boundedRequestJson(request,16*1024).catch(()=>null) as {provider?:unknown;apiKey?:unknown;baseUrl?:unknown;model?:unknown;models?:unknown}|null;
  if(!body||!validByokProvider(body.provider)) return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
  const reuseKey=body.apiKey===undefined||body.apiKey==='';
  if(!reuseKey){const invalid=validateProviderKey(body.provider,body.apiKey);if(invalid)return NextResponse.json({error:invalid},{status:400})}
  const apiKey=typeof body.apiKey==='string'?body.apiKey.trim():'';
  let retained:{key_hint:string;base_url:string;model_id:string;health_status:string}|null=null;
  if(reuseKey){
    const found=await createAdminClient().from('sasi_provider_connections').select('key_hint,base_url,model_id,health_status').eq('user_id',user.id).eq('provider',body.provider).maybeSingle();
    if(found.error)return NextResponse.json({error:'BYOK_SAVE_FAILED'},{status:503});
    if(!found.data)return NextResponse.json({error:'CONNECTION_REQUIRED'},{status:409});
    retained=found.data;
  }
  const preferences=modelPreferences(body.models);
  if(body.models!==undefined&&(!body.models||typeof body.models!=='object'||Array.isArray(body.models)||Object.keys(body.models).some(k=>!['text','video'].includes(k))||Object.entries(body.models).some(([k,v])=>typeof v!=='string'||v.length>180||/[\r\n\0]/.test(v)||(v.trim()&&!preferences[k as 'text'|'video']))))return NextResponse.json({error:'CONNECTION_CONFIG_INVALID'},{status:400});
  if(Object.values(preferences).some(v=>/^apikey[-_]/i.test(v))||(preferences.text&&chooseTextModel(body.provider,[],preferences.text)!==preferences.text))return NextResponse.json({error:'CONNECTION_MODEL_INVALID'},{status:400});
  if(body.baseUrl!==undefined&&typeof body.baseUrl!=="string"||body.model!==undefined&&typeof body.model!=="string")return NextResponse.json({error:"CONNECTION_CONFIG_INVALID"},{status:400});
  const rawBase=String(body.baseUrl??retained?.base_url??defaultBaseUrl(body.provider)).trim(),modelId=String(body.model??retained?.model_id??"").trim();
  if(rawBase.length>2048||modelId.length>180||/[\r\n\0]/.test(modelId))return NextResponse.json({error:"CONNECTION_CONFIG_INVALID"},{status:400});
  if(body.provider==="compatible"&&(!rawBase||!modelId))return NextResponse.json({error:"SERVICE_ADDRESS_AND_MODEL_REQUIRED"},{status:400});
  const guard=validateProviderBaseUrl(rawBase);
  if(!guard.pass||!guard.normalized)return NextResponse.json({error:"SERVICE_ADDRESS_INVALID"},{status:400});
  let baseUrl:string;try{baseUrl=(await parsePublicHttpsUrl(guard.normalized)).url.toString().replace(/\/$/,"")}catch{return NextResponse.json({error:"SERVICE_ADDRESS_INVALID"},{status:400})}
  try {
    if(reuseKey){
      // Update only this owner's configuration; never read, decrypt, or replace its saved key.
      const db=createAdminClient();
      const baseChanged=retained!.base_url!==baseUrl;
      const saved=await db.from('sasi_provider_connections').update({base_url:baseUrl,model_id:modelId,...(body.models!==undefined?{model_preferences:preferences}:{}),...(baseChanged?{health_status:'stored',capabilities:[],discovered_models:[],last_checked_at:null}:{}),updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('provider',body.provider);
      if(saved.error)throw saved.error;
      return NextResponse.json({ok:true,service:body.provider,provider:body.provider,keyHint:retained!.key_hint,healthStatus:baseChanged?'stored':retained!.health_status},{status:200});
    }
    const {error}=await createAdminClient().from("sasi_provider_connections").upsert({
      user_id:user.id,provider:body.provider,encrypted_credential:encryptProviderKey(user.id,body.provider,apiKey),
      key_hint:providerKeyHint(apiKey),fingerprint:providerKeyFingerprint(apiKey),health_status:"stored",
      base_url:baseUrl,model_id:modelId,...(body.models!==undefined?{model_preferences:preferences}:{}),capabilities:[],discovered_models:[],capability_checked_at:null,cooldown_until:null,
      last_checked_at:null,last_error_code:null,updated_at:new Date().toISOString(),
    },{onConflict:"user_id,provider"});
    if(error) throw error;
    return NextResponse.json({ok:true,service:body.provider,provider:body.provider,keyHint:providerKeyHint(apiKey),healthStatus:"stored"},{status:201});
  } catch(error) {
    console.error("[sasi byok] save unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_SAVE_FAILED"},{status:503});
  }
}

export async function DELETE(request:NextRequest) {
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  const user=await identity();
  if(!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const abuse=await enforceAbuseGuard(request,{scope:"sasi-byok-delete",userId:user.id,accountLimit:60,ipLimit:180});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const provider=new URL(request.url).searchParams.get("provider");
  if(!validByokProvider(provider)) return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
  try {
    const {error}=await createAdminClient().from("sasi_provider_connections").delete().eq("user_id",user.id).eq("provider",provider);
    if(error) throw error;
    return NextResponse.json({ok:true,provider});
  } catch(error) {
    console.error("[sasi byok] delete unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_DELETE_FAILED"},{status:503});
  }
}
