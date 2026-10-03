import{NextResponse}from"next/server";
import{createClient,getServerUser,isSupabasePublicConfigured}from"@/lib/supabase/server";
import{assertMoneySnapshot}from"@/lib/money/invariants";
import{normalizeWithdrawalStatus}from"@/lib/money/refund-state";

export const dynamic="force-dynamic";

export async function GET(){
  if(!isSupabasePublicConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});
  const supabase=createClient();
  const user=await getServerUser(supabase);
  if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

  const [{data:snapshot,error:snapshotError},{data:rows,error:rowsError}]=await Promise.all([
    supabase.rpc("money_balance_snapshot_v52",{p_user_id:user.id}),
    supabase.from("balance_withdrawals")
      .select("id,order_id,wallet_kind,provider,currency,amount_minor,status,provider_status,failure_code,created_at,updated_at,completed_at,processing_started_at,provider_currency,provider_amount_minor")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(50)
  ]);

  if(snapshotError||rowsError){
    console.error("[money summary] unavailable",snapshotError?.code||rowsError?.code||"unknown");
    return NextResponse.json({error:"MONEY_SUMMARY_UNAVAILABLE"},{status:503});
  }

  const raw=(snapshot??{}) as Record<string,unknown>;
  const cny=assertMoneySnapshot({
    currency:"CNY",
    availableMinor:Number(raw.cny_available_minor||0),
    refundableMinor:Number(raw.cny_refundable_minor||0),
    refundHoldMinor:Number(raw.cny_refund_hold_minor||0),
    legacyAvailableMinor:Number(raw.cny_legacy_available_minor||0),
    activeAvailableMinor:Number(raw.cny_active_available_minor||0),
  });
  const usd=assertMoneySnapshot({
    currency:"USD",
    availableMinor:Number(raw.usd_available_minor||0),
    refundableMinor:Number(raw.usd_refundable_minor||0),
    refundHoldMinor:Number(raw.usd_refund_hold_minor||0),
    legacyAvailableMinor:Number(raw.usd_legacy_available_minor||0),
    activeAvailableMinor:Number(raw.usd_active_available_minor||0),
  });

  const withdrawals=(rows??[]).map(row=>({
    ...row,
    normalized_status:normalizeWithdrawalStatus(row.status,row.provider_status),
  }));

  return NextResponse.json({balances:{CNY:cny,USD:usd},withdrawals},{
    headers:{"Cache-Control":"no-store"}
  });
}
