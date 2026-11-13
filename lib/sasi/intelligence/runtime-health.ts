import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

export type RuntimeFailureClass="auth"|"rate_limit"|"transient"|"permanent"|"uncertain";

export function errorCode(error:unknown){
  return error instanceof Error && error.message ? error.message.slice(0,120) : "UNKNOWN";
}

export function classifyRuntimeFailure(code:string):RuntimeFailureClass{
  if(/_(401|403)$/.test(code)||/CREDENTIAL_REJECTED|AUTH/i.test(code))return "auth";
  if(/_429$/.test(code)||/RATE_LIMIT/i.test(code))return "rate_limit";
  if(/_(408|409|425|500|502|503|504)$/.test(code)||/TIMEOUT|UNREACHABLE|ECONN|NETWORK/i.test(code))return "transient";
  if(/_(400|404|405|413|415|422)$/.test(code)||/MODEL_REQUIRED|SPEC_UNSUPPORTED|INVALID/i.test(code))return "permanent";
  return "uncertain";
}

function cooldownIso(kind:RuntimeFailureClass){
  const ms=kind==="rate_limit"?120_000:kind==="transient"?45_000:0;
  return ms?new Date(Date.now()+ms).toISOString():null;
}

export async function recordConnectionSuccess(input:{userId:string;connectionId:string;latencyMs:number}){
  const now=new Date().toISOString();
  await createAdminClient().from("sasi_provider_connections").update({
    health_status:"healthy",last_error_code:null,last_success_at:now,last_latency_ms:Math.max(0,Math.round(input.latencyMs)),cooldown_until:null,updated_at:now,
  }).eq("id",input.connectionId).eq("user_id",input.userId);
}

export async function recordConnectionFailure(input:{userId:string;connectionId:string;code:string;latencyMs?:number}){
  const kind=classifyRuntimeFailure(input.code),now=new Date().toISOString();
  const update:Record<string,unknown>={last_error_code:input.code.slice(0,120),updated_at:now,cooldown_until:cooldownIso(kind)};
  if(Number.isFinite(input.latencyMs))update.last_latency_ms=Math.max(0,Math.round(Number(input.latencyMs)));
  if(kind==="auth")update.health_status="unhealthy";
  await createAdminClient().from("sasi_provider_connections").update(update).eq("id",input.connectionId).eq("user_id",input.userId);
  return kind;
}
