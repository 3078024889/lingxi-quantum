import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { byokVaultConfigured, encryptProviderKey, providerKeyFingerprint, providerKeyHint, validateProviderKey, validByokProvider } from "@/lib/sasi/credential-vault";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import {validateProviderBaseUrl} from "@/lib/sasi/gateway/ssrf-guard";
import {parsePublicHttpsUrl} from "@/lib/security/public-endpoint";
import {defaultBaseUrl} from "@/lib/sasi/intelligence/provider-defaults";
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
      .select("provider,key_hint,health_status,last_checked_at,last_error_code,capabilities,model_id,discovered_models,base_url,cooldown_until,last_success_at,last_latency_ms,updated_at")
      .eq("user_id",user.id).order("updated_at",{ascending:false});
    if(error) throw error;
    return NextResponse.json({ vaultReady:true, connections:(data??[]).map(row=>({
      service:row.provider,provider:row.provider,keyHint:row.key_hint,healthStatus:row.health_status,lastCheckedAt:row.last_checked_at,
      lastErrorCode:row.last_error_code,capabilities:row.capabilities??[],model:row.model_id||"",discoveredModels:Array.isArray(row.discovered_models)?row.discovered_models.filter((x:unknown)=>typeof x==="string").slice(0,80):[],baseUrl:row.base_url||"",cooldownUntil:row.cooldown_until||null,lastSuccessAt:row.last_success_at||null,lastLatencyMs:row.last_latency_ms??null,updatedAt:row.updated_at,
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
  const body=await boundedRequestJson(request,16*1024).catch(()=>null) as {provider?:unknown;apiKey?:unknown;baseUrl?:unknown;model?:unknown}|null;
  if(!body||!validByokProvider(body.provider)) return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
  const invalid=validateProviderKey(body.provider,body.apiKey);
  if(invalid) return NextResponse.json({error:invalid},{status:400});
  const apiKey=(body.apiKey as string).trim();
  if(body.baseUrl!==undefined&&typeof body.baseUrl!=="string"||body.model!==undefined&&typeof body.model!=="string")return NextResponse.json({error:"CONNECTION_CONFIG_INVALID"},{status:400});
  const rawBase=String(body.baseUrl||defaultBaseUrl(body.provider)).trim(),modelId=String(body.model||"").trim();
  if(rawBase.length>2048||modelId.length>180||/[\r\n\0]/.test(modelId))return NextResponse.json({error:"CONNECTION_CONFIG_INVALID"},{status:400});
  if(body.provider==="compatible"&&(!rawBase||!modelId))return NextResponse.json({error:"SERVICE_ADDRESS_AND_MODEL_REQUIRED"},{status:400});
  const guard=validateProviderBaseUrl(rawBase);
  if(!guard.pass||!guard.normalized)return NextResponse.json({error:"SERVICE_ADDRESS_INVALID"},{status:400});
  let baseUrl:string;try{baseUrl=(await parsePublicHttpsUrl(guard.normalized)).url.toString().replace(/\/$/,"")}catch{return NextResponse.json({error:"SERVICE_ADDRESS_INVALID"},{status:400})}
  try {
    const {error}=await createAdminClient().from("sasi_provider_connections").upsert({
      user_id:user.id,provider:body.provider,encrypted_credential:encryptProviderKey(user.id,body.provider,apiKey),
      key_hint:providerKeyHint(apiKey),fingerprint:providerKeyFingerprint(apiKey),health_status:"stored",
      base_url:baseUrl,model_id:modelId,capabilities:[],discovered_models:[],capability_checked_at:null,cooldown_until:null,
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
