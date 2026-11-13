import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import type {SasiBillingCurrency} from "./pricing-v49";

export async function userSasiCurrency(userId:string):Promise<SasiBillingCurrency>{
  const admin=createAdminClient();
  const {data}=await admin.from("profiles").select("preferred_currency").eq("id",userId).maybeSingle();
  return data?.preferred_currency==="USD"?"USD":"CNY";
}

export async function sasiBalanceMinor(userId:string,currency:SasiBillingCurrency){
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("money_balance_snapshot_v52",{p_user_id:userId});
  if(error)throw new Error("SASI_BALANCE_UNAVAILABLE");
  return Math.max(0,Number(currency==="USD"?data?.usd_available_minor:data?.cny_available_minor)||0);
}

export async function requireSasiBalance(userId:string,currency:SasiBillingCurrency,amountMinor:number){
  const amount=Math.max(0,Math.round(amountMinor));
  if(!amount)return;
  const available=await sasiBalanceMinor(userId,currency);
  if(available<amount){const e=new Error("SASI_BALANCE_INSUFFICIENT") as Error&{availableMinor?:number;requiredMinor?:number};e.availableMinor=available;e.requiredMinor=amount;throw e;}
}

export async function chargeCompletedSasiUsage(input:{userId:string;currency:SasiBillingCurrency;amountMinor:number;referenceId:string;kind:string;metadata?:Record<string,unknown>}){
  const amount=Math.max(0,Math.round(input.amountMinor));if(!amount)return{ok:true,chargedMinor:0,alreadyCharged:false};
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("charge_sasi_usage_v49",{p_user_id:input.userId,p_currency:input.currency,p_amount_minor:amount,p_reference_id:input.referenceId,p_kind:input.kind,p_metadata:input.metadata||{}});
  if(error)throw new Error("SASI_USAGE_CHARGE_FAILED");
  const result=(data||{}) as {ok?:boolean;error?:string;alreadyCharged?:boolean;chargedMinor?:number};
  if(!result.ok)throw new Error(result.error||"SASI_USAGE_CHARGE_FAILED");
  return result;
}
