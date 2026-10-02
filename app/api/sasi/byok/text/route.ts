import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {SASI_SYSTEM,DIRECTOR_CONTRACT,type TextMessage} from "@/lib/sasi/ark-text";
import {WEBSITE_CONTRACT,validateWebsiteArtifact} from "@/lib/sasi/website-artifact";
import {buildGroundedReasoningPrompt,validateGroundedAnswer,type GroundedEvidence} from "@/lib/sasi-kernel/cognition/grounded-answer";
import {creationMethod,type CreationTask} from "@/lib/sasi/creation-methods";
import {runUserText,selectUserTextConnection} from "@/lib/sasi/intelligence/user-text";
import {textChargeMinor,websiteChargeMinor} from "@/lib/sasi/pricing-v49";
import {chargeCompletedSasiUsage,requireSasiBalance,userSasiCurrency} from "@/lib/sasi/unified-balance";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;
const fields="id,state,estimated_fen,expires_at,output,created_at";
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
function connectionVersion(c:{provider:string;model_id:string;fingerprint:string}){return createHash("sha256").update(`${c.provider}:${c.model_id}:${c.fingerprint}:v1`).digest("hex")}

export async function GET(){
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const db=createAdminClient();
 const[tasks,connection]=await Promise.all([
  db.from("sasi_byok_text_tasks").select(`${fields},request`).eq("user_id",user.id).order("created_at",{ascending:false}).limit(20),
  selectUserTextConnection(user.id).catch(()=>null),
 ]);
 if(tasks.error)return reply({error:"HISTORY_UNAVAILABLE"},503);
 return reply({ready:Boolean(connection),billing:"supplier_direct",connection:connection?{provider:connection.provider,model:connection.model_id}:null,tasks:(tasks.data??[]).map((row:any)=>({...row,request:undefined,question:row.request?.messages?.at(-1)?.content??""}))});
}

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return reply({error:"ORIGIN_REJECTED"},403);
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const body=await request.json().catch(()=>null) as any;if(!body||!["quote","confirm"].includes(body.action))return reply({error:"INVALID_ACTION"},400);
 const db=createAdminClient();const abuse=await enforceAbuseGuard(request,{scope:"byok-text",userId:user.id,accountLimit:60,ipLimit:180});if(!abuse.ok)return reply({error:abuse.error},abuse.status);
 const connection=await selectUserTextConnection(user.id,typeof body.provider==="string"?body.provider:null).catch(()=>null);
 if(!connection)return reply({error:"CONNECTION_REQUIRED"},409);
 const version=connectionVersion(connection);
 if(body.action==="quote"){
  if(typeof body.question!=="string"||!body.question.trim()||body.question.length>12000)return reply({error:"QUESTION_LENGTH"},400);
  if(body.mode!==undefined&&!["chat","director","book","website"].includes(body.mode))return reply({error:"INVALID_MODE"},400);
  const director=body.mode==="director",mode=body.mode??"chat";
  const evidence:GroundedEvidence[]=mode==="book"&&Array.isArray(body.evidence)?body.evidence.slice(0,9).map((e:Record<string,unknown>,i:number)=>({index:i+1,title:String(e?.title??"资料").slice(0,240),locator:String(e?.locator??"").slice(0,240),text:String(e?.text??"").slice(0,3000)})).filter((e:GroundedEvidence)=>e.text.trim()):[];
  if(mode==="book"&&!evidence.length)return reply({error:"BOOK_EVIDENCE_REQUIRED"},422);
  let method;try{method=creationMethod(mode as CreationTask,body.functions)}catch{return reply({error:"INVALID_FUNCTION_SELECTION"},400)}
  const messages:TextMessage[]=[{role:"system",content:SASI_SYSTEM+`\n${method.instructions}`+(director?`\n${DIRECTOR_CONTRACT}`:mode==="website"?`\n${WEBSITE_CONTRACT}`:"")}];
  if(body.previousId&&mode==="chat"){
   const previous=await db.from("sasi_byok_text_tasks").select("request,output").eq("id",body.previousId).eq("user_id",user.id).eq("state","succeeded").maybeSingle();
   if(previous.error||!previous.data)return reply({error:"PREVIOUS_ANSWER_NOT_FOUND"},404);
   messages.push(...previous.data.request.messages.filter((m:TextMessage)=>m.role!=="system"),{role:"assistant",content:previous.data.output.answer});
  }
  messages.push({role:"user",content:mode==="book"?buildGroundedReasoningPrompt({question:body.question.trim(),mode:"book",intelligence:"standard",evidence}):body.question.trim()});
  if(messages.reduce((n,m)=>n+Buffer.byteLength(m.content),0)>60000)return reply({error:"CONTEXT_LIMIT_START_NEW"},422);
  const expiresAt=new Date(Date.now()+10*60_000).toISOString();const billingCurrency=await userSasiCurrency(user.id);const estimatedTokens=Math.max(1,Math.ceil(messages.reduce((n,m)=>n+m.content.length,0)/3)+2048);const estimatedTextMinor=textChargeMinor(estimatedTokens,billingCurrency);const estimatedPlatformMinor=estimatedTextMinor+(mode==="website"?websiteChargeMinor(1,billingCurrency):0);
  const result=await db.from("sasi_byok_text_tasks").insert({user_id:user.id,request:{messages,director,mode,evidence,method,provider:connection.provider,model:connection.model_id,billingCurrency},profile_version:version,key_fingerprint:connection.fingerprint,estimated_fen:estimatedPlatformMinor,expires_at:expiresAt}).select(fields).single();
  return result.error?reply({error:"QUOTE_SAVE_FAILED"},503):reply({task:result.data,billing:"supplier_direct",connection:{provider:connection.provider,model:connection.model_id}},201);
 }
 if(body.acceptSupplierBilling!==true)return reply({error:"BUDGET_CONFIRMATION_REQUIRED"},422);
 const{data:task}=await db.from("sasi_byok_text_tasks").select("*").eq("id",body.taskId).eq("user_id",user.id).maybeSingle();if(!task)return reply({error:"TASK_NOT_FOUND"},404);
 if(task.state!=="quoted")return reply({task:{id:task.id,state:task.state,output:task.output}});
 const taskProvider=String(task.request?.provider||connection.provider);
 const taskConnection=await selectUserTextConnection(user.id,taskProvider).catch(()=>null);
 if(!taskConnection)return reply({error:"CONNECTION_UNAVAILABLE"},409);
 if(task.key_fingerprint!==taskConnection.fingerprint||task.profile_version!==connectionVersion(taskConnection)||Date.parse(task.expires_at)<=Date.now())return reply({error:"REQUOTE_REQUIRED"},409);
 if(task.request.mode==="website"){const currency=await userSasiCurrency(user.id);const fee=websiteChargeMinor(1,currency);try{await requireSasiBalance(user.id,currency,fee)}catch{return reply({error:"SASI_BALANCE_INSUFFICIENT",currency,requiredMinor:fee},402)}}
 const claimed=await db.from("sasi_byok_text_tasks").update({state:"running",updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id).eq("state","quoted").select("id").maybeSingle();
 if(claimed.error||!claimed.data)return reply({error:"ALREADY_STARTED_OR_UNAVAILABLE"},409);
 try{
  const output=await runUserText({userId:user.id,messages:task.request.messages,preferredProvider:taskProvider,maxOutputTokens:2048,taskId:task.id});
  if(task.request.mode==="website"){
   try{const artifact=validateWebsiteArtifact(JSON.parse(output.answer.replace(/^```(?:json)?\s*|\s*```$/g,"")));const currency=await userSasiCurrency(user.id);const chargedMinor=websiteChargeMinor(1,currency);const siteBilling=await chargeCompletedSasiUsage({userId:user.id,currency,amountMinor:chargedMinor,referenceId:`website:${task.id}`,kind:"website",metadata:{pageCount:1}});Object.assign(output,{website:artifact,websiteBilling:{currency,chargedMinor,pricingVersion:"2026-10-02-v49",alreadyCharged:Boolean(siteBilling.alreadyCharged)}});}
   catch(error){if(error instanceof Error&&/^SASI_/.test(error.message))throw error;Object.assign(output,{answer:"生成结果未通过网站完整性检查。请调整需求后重新生成；系统不会自动重试。",validationFailed:true});}
  }
  if(task.request.mode==="book"){
   const checked=validateGroundedAnswer(output.answer,task.request.evidence??[]);
   if(!checked.ok)Object.assign(output,{answer:"回答未通过引用编号检查，请核对资料后重新提问；系统不会自动重试。",validationFailed:true});else Object.assign(output,{citations:checked.refs});
  }
  const saved=await db.from("sasi_byok_text_tasks").update({state:"succeeded",output,updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id);
  return reply({task:{id:task.id,state:"succeeded",output},historySaved:!saved.error,billing:"supplier_direct"});
 }catch(error){
  const code=error instanceof Error?error.message:"UNKNOWN";const known=/^(PROVIDER_HTTP_\d+|PROVIDER_EMPTY_ANSWER|MODEL_REQUIRED|SERVICE_ADDRESS_INVALID)$/.test(code);const state=known?"failed":"uncertain";
  await db.from("sasi_byok_text_tasks").update({state,output:{error:known?code:"RESULT_UNCERTAIN_DO_NOT_RETRY_AUTOMATICALLY"},updated_at:new Date().toISOString()}).eq("id",task.id).eq("user_id",user.id);
  return reply({error:known?code:"RESULT_UNCERTAIN_DO_NOT_RETRY_AUTOMATICALLY",taskId:task.id},502);
 }
}
