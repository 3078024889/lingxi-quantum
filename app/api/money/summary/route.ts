import{NextResponse}from"next/server";
import{createClient,getServerUser,isSupabasePublicConfigured}from"@/lib/supabase/server";
import{readUnifiedBalanceSnapshot}from"@/lib/money/unified-balance";
import{normalizeWithdrawalStatus}from"@/lib/money/refund-state";

export const dynamic="force-dynamic";

export async function GET(){
  if(!isSupabasePublicConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});
  const supabase=createClient();
  const user=await getServerUser(supabase);
  if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});

  const [balancesResult,{data:rows,error:rowsError}]=await Promise.all([
    readUnifiedBalanceSnapshot(supabase,user.id).then(data=>({data,error:null as Error|null})).catch(error=>({data:null,error:error as Error})),
    supabase.from("balance_withdrawals")
      .select("id,order_id,wallet_kind,provider,currency,amount_minor,status,provider_status,failure_code,created_at,updated_at,completed_at,processing_started_at,provider_currency,provider_amount_minor")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(50)
  ]);

  if(balancesResult.error||rowsError){
    console.error("[money summary] unavailable",balancesResult.error instanceof Error?balancesResult.error.message:rowsError?.code||"unknown");
    return NextResponse.json({error:"MONEY_SUMMARY_UNAVAILABLE"},{status:503});
  }
  const cny=balancesResult.data!.CNY,usd=balancesResult.data!.USD;

  const withdrawals=(rows??[]).map(row=>({
    ...row,
    normalized_status:normalizeWithdrawalStatus(row.status,row.provider_status),
  }));

  return NextResponse.json({balances:{CNY:cny,USD:usd},withdrawals},{
    headers:{"Cache-Control":"no-store"}
  });
}
