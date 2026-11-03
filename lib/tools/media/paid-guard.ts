import "server-only";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export async function requirePaidMediaQuote(quoteId:string,toolIds:string[]){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId))throw new Error("INVALID_QUOTE_ID");
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)throw new Error("LOGIN_REQUIRED");
 const admin=createAdminClient();
 const{data,error}=await admin.from("tool_payment_quotes").select("id,user_id,tool_id,status,expires_at,quantity").eq("id",quoteId).eq("user_id",user.id).maybeSingle();
 if(error)throw new Error("QUOTE_LOOKUP_UNAVAILABLE");
 if(!data||!toolIds.includes(String(data.tool_id)))throw new Error("QUOTE_NOT_FOUND");
 if(String(data.status)!=="paid")throw new Error("QUOTE_NOT_PAID");
 // A paid quote without an active unconsumed delivery grant must not fund
 // repeated provider calls after its result has been completed or revoked.
 const{data:grant,error:grantError}=await admin.from("tool_export_grants")
   .select("id,consumed_at")
   .eq("quote_id",quoteId).eq("user_id",user.id).is("revoked_at",null).maybeSingle();
 if(grantError)throw new Error("MEDIA_GRANT_LOOKUP_UNAVAILABLE");
 if(!grant)throw new Error("MEDIA_GRANT_NOT_FOUND");
 if(grant.consumed_at)throw new Error("MEDIA_GRANT_ALREADY_CONSUMED");
 const quantity=Number(data.quantity);
 if(!Number.isFinite(quantity)||quantity<=0)throw new Error("QUOTE_INVALID_QUANTITY");
 return{userId:user.id,toolId:String(data.tool_id),quantity};
}
/**
 * A paid quote is not an unlimited provider API token. Repeated calls must
 * be bounded atomically across concurrent Vercel instances and devices.
 * This is abuse prevention, NOT a per-second media billing ledger.
 *
 * Allow segment-wise translation and normal TTS/transcription retries;
 * count attempts in the existing rate_limit_check PostgreSQL RPC. Fail closed
 * if the atomic limiter is unavailable rather than spending provider funds.
 */
export async function guardPaidMediaOperation(quoteId:string,quantity:number,operation:"translate"|"tts"|"transcribe"){
 if(!/^[0-9a-f-]{36}$/i.test(quoteId)||!Number.isFinite(quantity)||quantity<=0)throw Error("MEDIA_QUOTE_INVALID");
 const paidUnits=Math.max(1,Math.ceil(quantity));
 const limits={translate:[80,10000],tts:[3,500],transcribe:[2,240]} as const;
 const [perUnit,maximum]=limits[operation];
 const limit=Math.max(perUnit,Math.min(maximum,paidUnits*perUnit));
 const admin=createAdminClient();
 const {data,error}=await admin.rpc("rate_limit_check",{
  p_key:`media-paid:${operation}:${quoteId}`,
  p_limit:limit,
  p_window_seconds:86400
 });
 if(error)throw Error("MEDIA_USAGE_GUARD_UNAVAILABLE");
 if(data!==true)throw Error("MEDIA_USAGE_LIMIT_REACHED");
 return{limit};

}
