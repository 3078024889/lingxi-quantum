import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {decryptProviderKey} from "@/lib/sasi/credential-vault";
import {reviewSasiProductionInput} from "@/lib/sasi/safety";
import {imageProfile,imageVersion,generateImage} from "@/lib/sasi/seedream-byok";
import {compileVisualBrief} from "@/lib/sasi/creation-methods";
import {imageChargeMinor} from "@/lib/sasi/pricing-v49";
import {requireSasiBalance,userSasiCurrency} from "@/lib/sasi/unified-balance";
import {archiveGeneratedMedia,generatedArchiveReady} from '@/lib/sasi/intelligence/archive-generated-media';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=180;
const fields="id,state,request,estimated_fen,expires_at,output,created_at";
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(){const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const r=await createAdminClient().from("sasi_byok_image_tasks").select(fields).eq("user_id",user.id).order("created_at",{ascending:false}).limit(20);
 return r.error?reply({error:"IMAGE_HISTORY_UNAVAILABLE"},503):reply({profile:generatedArchiveReady()?imageProfile():null,tasks:r.data});}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return reply({error:"ORIGIN_REJECTED"},403);
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const guard=await enforceAbuseGuard(req,{scope:"byok-image",userId:user.id,accountLimit:40,ipLimit:120});if(!guard.ok)return reply({error:guard.error},guard.status);
 const b=await boundedRequestJson(req,16*1024).catch(()=>null) as any;if(!b||!["quote","confirm","refresh"].includes(b.action))return reply({error:"INVALID_ACTION"},400);
 const db=createAdminClient();if(!generatedArchiveReady())return reply({error:"GENERATION_STORAGE_UNAVAILABLE"},503);
 async function deliver(t:any,supplier: {imageUrl:string}){
  const asset=await archiveGeneratedMedia({userId:user!.id,taskId:t.id,kind:'image',url:supplier.imageUrl,minImageSide:t.request?.size==='4K'?4096:2048});
  const output={assetId:asset.assetId,imageUrl:'/api/sasi/generated-assets/'+asset.assetId,aiGenerated:true,sha256:asset.sha256,width:asset.width,height:asset.height,verification:asset.verification};
  const committed=await db.rpc('complete_sasi_byok_image_v77',{p_user_id:user!.id,p_task_id:t.id,p_output:output});
  if(committed.error||!committed.data?.ok)return reply({error:committed.data?.error||'IMAGE_RESULT_COMMIT_FAILED'},503);
  return reply({task:{id:t.id,state:'succeeded',output:committed.data.output||output},historySaved:true,billing:committed.data.billing});
 }
 if(b.action==='refresh'){
  const{data:t}=await db.from('sasi_byok_image_tasks').select('*').eq('id',String(b.taskId||'')).eq('user_id',user.id).maybeSingle();if(!t)return reply({error:'TASK_NOT_FOUND'},404);
  if(t.state==='succeeded')return reply({task:t,historySaved:true});
  if(!['running','uncertain'].includes(t.state)||typeof t.output?.supplierResult?.imageUrl!=='string')return reply({error:'RESULT_UNCERTAIN_CHECK_SUPPLIER_NO_AUTO_RETRY'},409);
  try{return await deliver(t,t.output.supplierResult)}catch(e){if(e instanceof Error&&e.message==='IMAGE_DECODE_INVALID'){await db.rpc('fail_sasi_byok_image_v77',{p_user_id:user.id,p_task_id:t.id,p_error:e.message});return reply({error:'IMAGE_DELIVERY_INVALID_NOT_CHARGED'},422)}return reply({error:'IMAGE_ARCHIVE_PENDING_RETRY_SAVE'},503)}
 }
 const p=imageProfile();if(!p)return reply({error:"IMAGE_PRICE_REVIEW_REQUIRED"},503);
 let currency=await userSasiCurrency(user.id);const imageQuality=p.size==="4K"?"high":"standard";let platformChargeMinor=imageChargeMinor(imageQuality,currency);
 const{data:c,error:ce}=await db.from("sasi_provider_connections").select("encrypted_credential,fingerprint,health_status").eq("user_id",user.id).eq("provider","volcengine").maybeSingle();
 if(ce||!c||c.health_status!=="healthy")return reply({error:"CONNECTION_REQUIRED"},409);
 if(b.action==="quote"){
  if(typeof b.prompt!=="string"||b.prompt.trim().length<2||b.prompt.length>3000)return reply({error:"INVALID_IMAGE_PROMPT"},400);
  const safety=reviewSasiProductionInput({prompt:b.prompt,rightsConfirmed:b.rightsConfirmed,aiLabelAcknowledged:b.aiLabelAcknowledged});if(!safety.ok)return reply({error:safety.error},422);
  let compiled;try{compiled=compileVisualBrief("image",b.prompt.trim(),b.functions)}catch{return reply({error:"INVALID_FUNCTION_SELECTION"},400)}
  const r=await db.from("sasi_byok_image_tasks").insert({user_id:user.id,request:{...compiled,model:p.model,size:p.size,platformChargeMinor,originalPrompt:b.prompt.trim(),billingCurrency:currency},profile_version:imageVersion(p),key_fingerprint:c.fingerprint,estimated_fen:platformChargeMinor,expires_at:new Date(Math.min(Date.now()+600000,Date.parse(p.validUntil))).toISOString()}).select(fields).single();
  return r.error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({task:r.data,profile:p,billingCurrency:currency},201);
 }
 if(b.acceptSupplierBilling!==true)return reply({error:"BUDGET_CONFIRMATION_REQUIRED"},422);

 const{data:t}=await db.from("sasi_byok_image_tasks").select("*").eq("id",String(b.taskId??"")).eq("user_id",user.id).maybeSingle();if(!t)return reply({error:"TASK_NOT_FOUND"},404);
 currency=t.request?.billingCurrency==="USD"?"USD":t.request?.billingCurrency==="CNY"?"CNY":currency;platformChargeMinor=Number(t.estimated_fen);if(!Number.isSafeInteger(platformChargeMinor)||platformChargeMinor<0)return reply({error:"QUOTE_INVALID"},409);
 if(t.state!=="quoted")return reply({task:{id:t.id,state:t.state,output:t.output}});
 try{await requireSasiBalance(user.id,currency,platformChargeMinor)}catch{return reply({error:"SASI_BALANCE_INSUFFICIENT",currency},402)}
 if(t.key_fingerprint!==c.fingerprint||t.profile_version!==imageVersion(p)||Date.parse(t.expires_at)<=Date.now())return reply({error:"REQUOTE_REQUIRED"},409);
 let key:string;try{key=decryptProviderKey(user.id,"volcengine",c.encrypted_credential);}catch{return reply({error:"CONNECTION_UNAVAILABLE"},503);}
 const claimed=await db.rpc('claim_sasi_byok_image_v77',{p_user_id:user.id,p_task_id:t.id});
 if(claimed.error||!claimed.data?.ok||!claimed.data.claimed)return reply({error:claimed.data?.error||"ALREADY_STARTED_OR_UNAVAILABLE"},409);
 try{const output=await generateImage(key,p,t.request.prompt);const receipt=await db.from('sasi_byok_image_tasks').update({output:{supplierResult:output},updated_at:new Date().toISOString()}).eq('id',t.id).eq('user_id',user.id).eq('state','running');if(receipt.error)throw Error('SUPPLIER_RESULT_SAVE_FAILED');return await deliver(t,output);}
 catch(e){if(e instanceof Error&&e.message==='IMAGE_DECODE_INVALID'){await db.rpc('fail_sasi_byok_image_v77',{p_user_id:user.id,p_task_id:t.id,p_error:e.message});return reply({error:'IMAGE_DELIVERY_INVALID_NOT_CHARGED'},422)}await db.from("sasi_byok_image_tasks").update({state:"uncertain",updated_at:new Date().toISOString()}).eq("id",t.id).eq("user_id",user.id);return reply({error:"RESULT_UNCERTAIN_CHECK_SUPPLIER_NO_AUTO_RETRY"},502);}
}
