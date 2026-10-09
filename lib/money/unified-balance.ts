import type{SupabaseClient}from"@supabase/supabase-js";
import{assertMoneySnapshot}from"@/lib/money/invariants";

export type UnifiedBalanceSnapshot={
 CNY:ReturnType<typeof assertMoneySnapshot>;
 USD:ReturnType<typeof assertMoneySnapshot>;
};

export async function readUnifiedBalanceSnapshot(supabase:SupabaseClient,userId:string):Promise<UnifiedBalanceSnapshot>{
 const{data,error}=await supabase.rpc("money_balance_snapshot_v52",{p_user_id:userId});
 if(error)throw new Error(`MONEY_SNAPSHOT_FAILED:${error.code||"db"}`);
 const raw=(data??{}) as Record<string,unknown>;
 return{
  CNY:assertMoneySnapshot({
   currency:"CNY",
   availableMinor:Number(raw.cny_available_minor||0),
   refundableMinor:Number(raw.cny_refundable_minor||0),
   refundHoldMinor:Number(raw.cny_refund_hold_minor||0),
   legacyAvailableMinor:Number(raw.cny_legacy_available_minor||0),
   activeAvailableMinor:Number(raw.cny_active_available_minor||0),
  }),
  USD:assertMoneySnapshot({
   currency:"USD",
   availableMinor:Number(raw.usd_available_minor||0),
   refundableMinor:Number(raw.usd_refundable_minor||0),
   refundHoldMinor:Number(raw.usd_refund_hold_minor||0),
   legacyAvailableMinor:Number(raw.usd_legacy_available_minor||0),
   activeAvailableMinor:Number(raw.usd_active_available_minor||0),
  })
 };
}
