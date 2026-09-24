import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

  const {data,error}=await supabase
    .from("sasi_wallets")
    .select("available_points,reserved_points")
    .eq("user_id",user.id)
    .maybeSingle();

  if(error)return NextResponse.json({error:"SASI_WALLET_LOOKUP_FAILED"},{status:500});

  const availableFen=Math.max(0,Number(data?.available_points||0));
  const reservedFen=Math.max(0,Number(data?.reserved_points||0));

  return NextResponse.json(
    {
      balanceRmb:availableFen/100,
      reservedRmb:reservedFen/100,
    },
    {headers:{"Cache-Control":"private, no-store, max-age=0"}}
  );
}