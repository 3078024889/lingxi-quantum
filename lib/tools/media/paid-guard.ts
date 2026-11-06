import "server-only";
import {randomUUID} from "node:crypto";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type MediaStage="media-transcribe"|"media-translate"|"media-tts";
type LegacyMediaUse={stage:MediaStage;characters:number;operationId?:unknown};

/** Preserve already-paid historical quote delivery but never grant unlimited
 * remote provider calls from the same quote. The one-use/character budget is
 * enforced atomically inside the PostgreSQL 17 service-role RPC.
 */
export async function requirePaidMediaQuote(quoteId:string,toolIds:string[],use?:LegacyMediaUse){
 if(!UUID.test(quoteId))throw new Error("INVALID_QUOTE_ID");
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)throw new Error("LOGIN_REQUIRED");
 const admin=createAdminClient();
 const {data,error}=await admin.from("tool_payment_quotes")
  .select("id,user_id,tool_id,status,expires_at").eq("id",quoteId)
  .eq("user_id",user.id).maybeSingle();
 if(error||!data||!toolIds.includes(String(data.tool_id)))throw new Error("QUOTE_NOT_FOUND");
 if(String(data.status)!=="paid")throw new Error("QUOTE_NOT_PAID");
 if(use){
  if(!Number.isSafeInteger(use.characters)||use.characters<0||use.characters>30000)
   throw new Error("QUOTE_STAGE_INVALID");
  const operationId=use.operationId==null||use.operationId===""?
   randomUUID():String(use.operationId);
  if(!UUID.test(operationId))throw new Error("QUOTE_STAGE_INVALID");
  const {data:claimed,error:claimError}=await admin.rpc("lingxi_claim_legacy_media_stage",{
   p_quote_id:quoteId,p_user_id:user.id,p_stage:use.stage,
   p_operation_id:operationId,p_characters:use.characters
  });
  if(claimError)throw new Error("QUOTE_STAGE_UNAVAILABLE");
  if(!claimed?.ok)throw new Error(String(claimed?.error||"QUOTE_STAGE_UNAVAILABLE"));
  if(claimed.alreadyStarted)throw new Error("QUOTE_STAGE_ALREADY_STARTED");
 }
 return {userId:user.id,toolId:String(data.tool_id)};
}
