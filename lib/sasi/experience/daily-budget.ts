import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import{entitlementSnapshot,nextUtcDay,type EntitlementState}from"@/lib/tasks/entitlement-contract";

export type ExperienceReservation={ok:boolean;referenceId:string;units:number;remaining:number|null;state:EntitlementState};
function limit(){const n=Number(process.env.SASI_EXPERIENCE_DAILY_SECONDS_EQUIVALENT||180);return Number.isFinite(n)&&n>0?Math.floor(n):180}

export async function readExperienceAllowance(userId:string){
 const daily=limit(),admin=createAdminClient();
 try{
  const day=new Date().toISOString().slice(0,10);
  const {data,error}=await admin.from("sasi_experience_daily").select("used_units,reserved_units").eq("user_id",userId).eq("usage_day",day).maybeSingle();
  if(error)throw error;
  return entitlementSnapshot({limit:daily,used:data?.used_units||0,reserved:data?.reserved_units||0,resetAt:nextUtcDay()});
 }catch{
  return entitlementSnapshot({unavailable:true,resetAt:nextUtcDay()});
 }
}

export async function reserveExperience(userId:string,referenceId:string,units:number):Promise<ExperienceReservation>{
 const claim=Math.max(1,Math.ceil(units)),daily=limit();
 try{
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("reserve_sasi_experience_v90",{p_user_id:userId,p_reference_id:referenceId,p_units:claim,p_daily_limit:daily});
  if(error)throw error;
  const row=(Array.isArray(data)?data[0]:data)||{},ok=Boolean(row.ok);
  const state:EntitlementState=ok?"available":String(row.error||"")==="EXPERIENCE_EXHAUSTED"?"exhausted":"unavailable";
  return {ok,referenceId,units:claim,remaining:Number.isFinite(Number(row.remaining_units))?Math.max(0,Number(row.remaining_units)):null,state};
 }catch{
  // Never mint process-local allowance. Serverless/multi-instance memory is not an authoritative ledger.
  return {ok:false,referenceId,units:claim,remaining:null,state:"unavailable"};
 }
}

export async function settleExperience(_userId:string,referenceId:string,_units:number,success:boolean){
 try{const admin=createAdminClient();await admin.rpc("settle_sasi_experience_v90",{p_reference_id:referenceId,p_success:success});}catch{}
}
