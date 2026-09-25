import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerCandidates, runText } from "@/lib/ai/provider-router";
import type { Intelligence } from "@/lib/ai/provider-router";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";

export const runtime = "nodejs";
export const maxDuration = 45;

function allowed(email: string | null | undefined) {
  const raw = process.env.AI_PROVIDER_TEST_EMAILS || process.env.TOOL_ADMIN_EMAILS || "";
  const allow = raw.split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allow.includes(email.toLowerCase()));
}
function tierOf(raw:unknown):Intelligence{
  return raw==="high"?"high":raw==="standard"?"standard":"light";
}
async function adminUser(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  return user&&allowed(user.email)?user:null;
}

export async function GET(req: Request) {
  const user=await adminUser();
  if(!user)return NextResponse.json({error:"NOT_FOUND"},{status:404});
  const tier=tierOf(new URL(req.url).searchParams.get("tier"));
  return NextResponse.json({
    ok:true,
    mode:"no-spend-status",
    tier,
    route:providerCandidates(tier).map(x=>({provider:x.provider,model:x.model}))
  },{headers:{"Cache-Control":"no-store"}});
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const user=await adminUser();
  if(!user)return NextResponse.json({error:"NOT_FOUND"},{status:404});

  const body=await req.json().catch(()=>null) as {tier?:unknown;confirmProviderCall?:unknown}|null;
  if(!body||body.confirmProviderCall!==true){
    return NextResponse.json({error:"EXPLICIT_PROVIDER_CALL_CONFIRMATION_REQUIRED"},{status:409});
  }
  const tier=tierOf(body.tier);

  const abuse=await enforceAbuseGuard(req,{scope:"ai-provider-test",userId:user.id,accountLimit:12,ipLimit:36});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

  try{
    const r=await runText("只回复 LINGXIFIELD_OK","simple_text",tier,64);
    return NextResponse.json({
      ok:true,tier,provider:r.provider,model:r.model,answer:r.text,usage:r.usage
    },{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json({
      ok:false,tier,error:error instanceof Error?error.message:String(error)
    },{status:502,headers:{"Cache-Control":"no-store"}});
  }
}
