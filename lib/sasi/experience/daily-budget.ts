import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

type Reservation={ok:boolean;referenceId:string;units:number;remaining:number;soft:boolean};
const soft=new Map<string,{day:string;used:number;reserved:number}>();
function today(){return new Date().toISOString().slice(0,10)}
function limit(){const n=Number(process.env.SASI_EXPERIENCE_DAILY_SECONDS_EQUIVALENT||180);return Number.isFinite(n)&&n>0?Math.floor(n):180}

export async function reserveExperience(userId:string,referenceId:string,units:number):Promise<Reservation>{
 const claim=Math.max(1,Math.ceil(units)),daily=limit();
 try{
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("reserve_sasi_experience_v90",{p_user_id:userId,p_reference_id:referenceId,p_units:claim,p_daily_limit:daily});
  if(error)throw error;
  const row=(Array.isArray(data)?data[0]:data)||{};
  return {ok:Boolean(row.ok),referenceId,units:claim,remaining:Number(row.remaining_units??0),soft:false};
 }catch{
  const d=today(),r=soft.get(userId);const state=!r||r.day!==d?{day:d,used:0,reserved:0}:r;
  if(state.used+state.reserved+claim>daily)return {ok:false,referenceId,units:claim,remaining:Math.max(0,daily-state.used-state.reserved),soft:true};
  state.reserved+=claim;soft.set(userId,state);
  return {ok:true,referenceId,units:claim,remaining:Math.max(0,daily-state.used-state.reserved),soft:true};
 }
}

export async function settleExperience(userId:string,referenceId:string,units:number,success:boolean,softMode=false){
 if(softMode){
  const state=soft.get(userId);if(state&&state.day===today()){state.reserved=Math.max(0,state.reserved-units);if(success)state.used+=units;soft.set(userId,state)};return;
 }
 try{const admin=createAdminClient();await admin.rpc("settle_sasi_experience_v90",{p_reference_id:referenceId,p_success:success});}catch{}
}
