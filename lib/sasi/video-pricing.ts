import "server-only";
import {createHash} from "node:crypto";
import type {SasiSkillSource} from "@/lib/sasi/skill-runtime";

type VideoRate={provider:string;model:string;quality:string;retailFenPerSecond:number;supplierFenPerSecond:number;validUntil:string};
export type VideoPrice={duration:number;amountFen:number;amountUsdCents:number;rateVersion:string;retailFenPerSecond:number;skillSource:SasiSkillSource;expiresAt:number};

function userSkillRate(retail:number,supplier:number){
  return Math.max(supplier+1,Math.ceil(retail*0.9));
}

export function quoteVideoTask(selection:{provider:string;model:string;quality:string},duration:number,now=Date.now(),skillSource:SasiSkillSource="platform"):VideoPrice{
  if(!Number.isSafeInteger(duration)||duration<1||duration>600)throw new Error("INVALID_TASK_DURATION");
  let rates:VideoRate[];
  try{rates=JSON.parse(process.env.SASI_VIDEO_RATES_JSON||"[]")}catch{throw new Error("TASK_PRICING_UNAVAILABLE")}
  if(!Array.isArray(rates))throw new Error("TASK_PRICING_UNAVAILABLE");
  const matching=rates.filter(r=>r&&r.provider===selection.provider&&r.model===selection.model&&r.quality===selection.quality);
  if(matching.length!==1)throw new Error("TASK_PRICING_UNAVAILABLE");
  const rate=matching[0],expiry=Date.parse(rate.validUntil);
  if(!Number.isFinite(expiry)||expiry<=now)throw new Error("TASK_PRICING_EXPIRED");
  if(![rate.retailFenPerSecond,rate.supplierFenPerSecond].every(n=>Number.isSafeInteger(n)&&n>0)||rate.retailFenPerSecond<=rate.supplierFenPerSecond)throw new Error("TASK_PRICING_UNAVAILABLE");
  const retailFenPerSecond=skillSource==="user"?userSkillRate(rate.retailFenPerSecond,rate.supplierFenPerSecond):rate.retailFenPerSecond;
  const amountFen=retailFenPerSecond*duration;
  if(!Number.isSafeInteger(amountFen)||amountFen>100_000_000)throw new Error("TASK_PRICE_OUT_OF_RANGE");
  const amountUsdCents=Math.ceil(amountFen/2);
  const rateVersion=createHash("sha256").update(JSON.stringify([rate.provider,rate.model,rate.quality,retailFenPerSecond,rate.supplierFenPerSecond,rate.validUntil,skillSource,"USD_HALF_RMB_NUMERIC_V1"])).digest("hex");
  return{duration,amountFen,amountUsdCents,rateVersion,retailFenPerSecond,skillSource,expiresAt:Math.min(now+600_000,expiry)};
}

export function settleVideoSeconds(billableSeconds:number,approved:{amountFen:number;retailFenPerSecond:number}){
  if(!Number.isSafeInteger(billableSeconds)||billableSeconds<0||!Number.isSafeInteger(approved.retailFenPerSecond)||approved.retailFenPerSecond<=0||!Number.isSafeInteger(approved.amountFen)||approved.amountFen<0)throw new Error("VERIFIED_USAGE_REQUIRED");
  const actualAmountFen=billableSeconds*approved.retailFenPerSecond;
  if(!Number.isSafeInteger(actualAmountFen))throw new Error("TASK_PRICE_OUT_OF_RANGE");
  if(actualAmountFen>approved.amountFen)return{requiresApproval:true as const,actualAmountFen,settledAmountFen:null,releasedAmountFen:null};
  return{requiresApproval:false as const,actualAmountFen,settledAmountFen:actualAmountFen,releasedAmountFen:approved.amountFen-actualAmountFen};
}
