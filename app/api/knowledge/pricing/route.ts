import { NextResponse } from "next/server";
import { intelligenceFactor, minimumChargeFenForTier } from "@/lib/ai/provider-router";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
 const tiers=(["light","standard","high"] as const).reduce((acc,tier)=>{
  acc[tier]={
   factor:intelligenceFactor(tier),
   minimumRmb:minimumChargeFenForTier(tier)/100,
  };
  return acc;
 },{} as Record<string,{factor:number;minimumRmb:number}>);
 return NextResponse.json({tiers},{headers:{"Cache-Control":"no-store"}});
}
