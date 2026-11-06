import "server-only";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {toolPassBackendReady} from "@/lib/tools/commerce/tool-server-receipt";

type Started={ok:true;mode:"legacy"|"pass"};
type Denied={ok:false;error:string;status:401|403|409|503};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Starts exactly one server processing stage from a separately claimed tool use.
 * Caller must validate input + origin before using this gate, and MUST invoke
 * it before any provider call, remote fetch, signed upload or conversion.
 *
 * A retry of the same stage never re-runs expensive work. Multi-stage jobs can
 * use the same requestId + operationId with different fixed server stage IDs.
 *
 * Off flag preserves existing legacy paid-delivery rights. Turning it on before
 * all clients and migrations are ready intentionally fails closed.
 */
export async function authorizeToolPassStage(input:{
 toolSlug:string;stage:string;accessRequestId:unknown;operationId:unknown
}):Promise<Started|Denied>{
 if(!toolPassBackendReady())return {ok:true,mode:"legacy"};
 const {data:{user},error:authError}=await createClient().auth.getUser();
 if(authError||!user)return {ok:false,error:"LOGIN_REQUIRED",status:401};
 const requestId=String(input.accessRequestId||"");
 const operationId=String(input.operationId||"");
 if(!UUID.test(requestId)||!UUID.test(operationId)||
  !/^[a-z0-9-]{1,96}$/.test(input.toolSlug)||
  !/^[a-z0-9-]{1,48}$/.test(input.stage))
  return {ok:false,error:"TOOL_USE_RECEIPT_REQUIRED",status:403};
 const {data,error}=await createAdminClient().rpc("lingxi_redeem_tool_stage",{
  p_request_id:requestId,
  p_user_id:user.id,
  p_tool_slug:input.toolSlug,
  p_operation_id:operationId,
  p_stage:input.stage
 });
 if(error)return {ok:false,error:"TOOL_STAGE_UNAVAILABLE",status:503};
 if(!data?.ok)return {ok:false,error:String(data?.error||"TOOL_USE_RECEIPT_INVALID"),status:403};
 if(data.alreadyStarted)return {ok:false,error:"TOOL_STAGE_ALREADY_STARTED",status:409};
 return {ok:true,mode:"pass"};
}
