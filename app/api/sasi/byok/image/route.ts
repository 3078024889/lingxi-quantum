import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {decryptProviderKey} from "@/lib/sasi/credential-vault";
import {reviewSasiProductionInput} from "@/lib/sasi/safety";
import {imageProfile,imageVersion,generateImage} from "@/lib/sasi/seedream-byok";
import {compileVisualBrief} from "@/lib/sasi/creation-methods";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
const fields="id,state,request,estimated_fen,expires_at,output,created_at";
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(){const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const r=await createAdminClient().from("sasi_byok_image_tasks").select(fields).eq("user_id",user.id).order("created_at",{ascending:false}).limit(20);
 return r.error?reply({error:"IMAGE_HISTORY_UNAVAILABLE"},503):reply({profile:imageProfile(),tasks:r.data});}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return reply({error:"ORIGIN_REJECTED"},403);
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const guard=await enforceAbuseGuard(req,{scope:"byok-image",userId:user.id,accountLimit:40,ipLimit:120});if(!guard.ok)return reply({error:guard.error},guard.status);
 const b=await req.json().catch(()=>null);if(!b||!["quote","confirm"].includes(b.action))return reply({error:"INVALID_ACTION"},400);
 const db=createAdminClient();const p=imageProfile();if(!p)return reply({error:"IMAGE_PRICE_REVIEW_REQUIRED"},503);
 const{data:c,error:ce}=await db.from("sasi_provider_connections").select("encrypted_credential,fingerprint,health_status").eq("user_id",user.id).eq("provider","volcengine").maybeSingle();
 if(ce||!c||c.health_status!=="healthy")return reply({error:"CONNECTION_REQUIRED"},409);
 if(b.action==="quote"){
  if(typeof b.prompt!=="string"||b.prompt.trim().length<8||b.prompt.length>3000)return reply({error:"INVALID_IMAGE_PROMPT"},400);
  const safety=reviewSasiProductionInput({prompt:b.prompt,rightsConfirmed:b.rightsConfirmed,aiLabelAcknowledged:b.aiLabelAcknowledged});if(!safety.ok)return reply({error:safety.error},422);
  const r=await db.from("sasi_byok_image_tasks").insert({user_id:user.id,request:{...compileVisualBrief("image",b.prompt.trim()),originalPrompt:b.prompt.trim()},profile_version:imageVersion(p),key_fingerprint:c.fingerprint,estimated_fen:p.estimatedFen,expires_at:new Date(Math.min(Date.now()+600000,Date.parse(p.validUntil))).toISOString()}).select(fields).single();
  return r.error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({task:r.data,profile:p},201);
 }
 if(b.acceptSupplierBilling!==true)return reply({error:"BUDGET_CONFIRMATION_REQUIRED"},422);
 const{data:t}=await db.from("sasi_byok_image_tasks").select("*").eq("id",String(b.taskId??"")).eq("user_id",user.id).maybeSingle();if(!t)return reply({error:"TASK_NOT_FOUND"},404);
 if(t.state!=="quoted")return reply({task:{id:t.id,state:t.state,output:t.output}});
 if(t.key_fingerprint!==c.fingerprint||t.profile_version!==imageVersion(p)||Date.parse(t.expires_at)<=Date.now())return reply({error:"REQUOTE_REQUIRED"},409);
 let key:string;try{key=decryptProviderKey(user.id,"volcengine",c.encrypted_credential);}catch{return reply({error:"CONNECTION_UNAVAILABLE"},503);}
 const claimed=await db.from("sasi_byok_image_tasks").update({state:"running",updated_at:new Date().toISOString()}).eq("id",t.id).eq("user_id",user.id).eq("state","quoted").select("id").maybeSingle();
 if(claimed.error||!claimed.data)return reply({error:"ALREADY_STARTED_OR_UNAVAILABLE"},409);
 try{const output=await generateImage(key,p,t.request.prompt);const saved=await db.from("sasi_byok_image_tasks").update({state:"succeeded",output,updated_at:new Date().toISOString()}).eq("id",t.id).eq("user_id",user.id);return reply({task:{id:t.id,state:"succeeded",output},historySaved:!saved.error});}
 catch{await db.from("sasi_byok_image_tasks").update({state:"uncertain",updated_at:new Date().toISOString()}).eq("id",t.id).eq("user_id",user.id);return reply({error:"RESULT_UNCERTAIN_CHECK_SUPPLIER_NO_AUTO_RETRY"},502);}
}
