import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

/** A partial front/back cutover must not fall into legacy, unmetered execution. */
export function toolPassCutoverRequested():boolean {
 return process.env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true" ||
        process.env.TOOL_PASS_BACKEND_READY==="true";
}
/** Only a full server migration may enable paid tool start accounting. */
export function toolPassBackendReady():boolean {
 return process.env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true" &&
        process.env.TOOL_PASS_BACKEND_READY==="true";
}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type ToolReceiptResult={ok:true;alreadyRedeemed:boolean}|{ok:false;error:string};
/** A receipt authorizes just one operation ID and the same authenticated owner/tool. */
export async function redeemToolStart(input:{
 userId:string;toolSlug:string;accessRequestId:unknown;operationId:string
}):Promise<ToolReceiptResult>{
 if(!toolPassBackendReady())return {ok:false,error:"TOOL_PASS_BACKEND_NOT_READY"};
 const requestId=String(input.accessRequestId||"");
 if(!UUID.test(requestId)||!UUID.test(input.operationId))
  return {ok:false,error:"TOOL_USE_RECEIPT_REQUIRED"};
 const {data,error}=await createAdminClient().rpc("lingxi_redeem_tool_use",{
  p_request_id:requestId,p_user_id:input.userId,p_tool_slug:input.toolSlug,p_operation_id:input.operationId
 });
 if(error)return {ok:false,error:"TOOL_USE_RECEIPT_UNAVAILABLE"};
 if(!data?.ok)return {ok:false,error:String(data?.error||"TOOL_USE_RECEIPT_INVALID")};
 return {ok:true,alreadyRedeemed:Boolean(data.alreadyRedeemed)};
}
