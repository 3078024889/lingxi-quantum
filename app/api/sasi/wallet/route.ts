import{NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{readUnifiedBalanceSnapshot}from"@/lib/money/unified-balance";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
 const supabase=createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 try{
  const balances=await readUnifiedBalanceSnapshot(supabase,user.id);
  const activeReserved=await supabase.from("sasi_wallets").select("reserved_points").eq("user_id",user.id).maybeSingle();
  if(activeReserved.error)return NextResponse.json({error:"SASI_WALLET_LOOKUP_FAILED"},{status:500});
  return NextResponse.json({
   balanceRmb:balances.CNY.availableMinor/100,
   balanceUsd:balances.USD.availableMinor/100,
   reservedRmb:Math.max(0,Number(activeReserved.data?.reserved_points||0))/100,
   activeBalanceRmb:balances.CNY.activeAvailableMinor/100,
   legacyBalanceRmb:balances.CNY.legacyAvailableMinor/100,
   activeBalanceUsd:balances.USD.activeAvailableMinor/100,
   legacyBalanceUsd:balances.USD.legacyAvailableMinor/100,
  },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
 }catch{
  return NextResponse.json({error:"SASI_WALLET_LOOKUP_FAILED"},{status:503});
 }
}