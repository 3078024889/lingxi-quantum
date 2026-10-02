export type SasiBillingCurrency="CNY"|"USD";
export type SasiChargeKind="text"|"image"|"video"|"website";

export const SASI_PRICING_V49={
  version:"2026-10-02-v49",
  textPerMillion:{CNY:0.50,USD:0.50},
  imageStandard:{CNY:0.20,USD:0.20},
  imageHigh:{CNY:0.30,USD:0.30},
  video720PerSecond:{CNY:0.20,USD:0.20},
  video1080PerSecond:{CNY:0.30,USD:0.30},
  websiteFirstPage:{CNY:6,USD:6},
  websiteAdditionalPage:{CNY:2,USD:2},
  minimumCharge:{CNY:0.01,USD:0.01},
} as const;

function minor(value:number){return Math.max(1,Math.round(value*100));}
export function textChargeMinor(totalTokens:number,currency:SasiBillingCurrency){
  const n=Math.max(0,Math.floor(totalTokens||0));
  if(!n)return 0;
  return Math.max(minor(SASI_PRICING_V49.minimumCharge[currency]),Math.ceil(n*SASI_PRICING_V49.textPerMillion[currency]*100/1_000_000));
}
export function imageChargeMinor(quality:"standard"|"high",currency:SasiBillingCurrency){
  return minor((quality==="high"?SASI_PRICING_V49.imageHigh:SASI_PRICING_V49.imageStandard)[currency]);
}
export function videoChargeMinor(durationSeconds:number,resolution:"720p"|"1080p",currency:SasiBillingCurrency){
  const seconds=Math.max(1,Math.ceil(Number(durationSeconds)||0));
  const rate=resolution==="1080p"?SASI_PRICING_V49.video1080PerSecond:SASI_PRICING_V49.video720PerSecond;
  return minor(seconds*rate[currency]);
}
export function websiteChargeMinor(pageCount:number,currency:SasiBillingCurrency){
  const pages=Math.max(1,Math.floor(Number(pageCount)||1));
  const amount=SASI_PRICING_V49.websiteFirstPage[currency]+Math.max(0,pages-1)*SASI_PRICING_V49.websiteAdditionalPage[currency];
  return minor(amount);
}
export function formatMinor(amountMinor:number,currency:SasiBillingCurrency){return currency==="USD"?`$${(amountMinor/100).toFixed(2)}`:`¥${(amountMinor/100).toFixed(2)}`}
