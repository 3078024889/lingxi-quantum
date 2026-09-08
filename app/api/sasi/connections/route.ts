import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { byokVaultConfigured, encryptProviderKey, providerKeyFingerprint, providerKeyHint, validateProviderKey, validByokProvider } from "@/lib/sasi/credential-vault";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

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
      .select("provider,key_hint,health_status,last_checked_at,last_error_code,updated_at")
      .eq("user_id",user.id).order("updated_at",{ascending:false});
    if(error) throw error;
    return NextResponse.json({ vaultReady:true, connections:(data??[]).map(row=>({
      provider:row.provider,keyHint:row.key_hint,healthStatus:row.health_status,lastCheckedAt:row.last_checked_at,
      lastErrorCode:row.last_error_code,updatedAt:row.updated_at,
    })) },{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error("[sasi byok] list unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_FOUNDATION_UNAVAILABLE",vaultReady:true},{status:503});
  }
}

export async function POST(request:NextRequest) {
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  const user = await identity();
  if (!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  if (!byokVaultConfigured()) return NextResponse.json({error:"BYOK_VAULT_NOT_CONFIGURED"},{status:503});
  const body=await request.json().catch(()=>null) as {provider?:unknown;apiKey?:unknown}|null;
  if(!body||!validByokProvider(body.provider)) return NextResponse.json({error:"PROVIDER_UNSUPPORTED"},{status:400});
  const invalid=validateProviderKey(body.provider,body.apiKey);
  if(invalid) return NextResponse.json({error:invalid},{status:400});
  const apiKey=(body.apiKey as string).trim();
  try {
    const {error}=await createAdminClient().from("sasi_provider_connections").upsert({
      user_id:user.id,provider:body.provider,encrypted_credential:encryptProviderKey(user.id,body.provider,apiKey),
      key_hint:providerKeyHint(apiKey),fingerprint:providerKeyFingerprint(apiKey),health_status:"stored",
      last_checked_at:null,last_error_code:null,updated_at:new Date().toISOString(),
    },{onConflict:"user_id,provider"});
    if(error) throw error;
    return NextResponse.json({ok:true,provider:body.provider,keyHint:providerKeyHint(apiKey),healthStatus:"stored"},{status:201});
  } catch(error) {
    console.error("[sasi byok] save unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"BYOK_SAVE_FAILED"},{status:503});
  }
}

export async function DELETE(request:NextRequest) {
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  const user=await identity();
  if(!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
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
