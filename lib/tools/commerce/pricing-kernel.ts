import policy from "@/lib/tools/commerce/pricing-policy.json";

export const GROSS_MARGIN_FLOOR=policy.grossMarginFloor;
export type MoneyCurrency="CNY"|"USD";

export function priceForMargin(totalCost:number,margin=GROSS_MARGIN_FLOOR){
 if(!Number.isFinite(totalCost)||totalCost<0)throw new Error("INVALID_TOTAL_COST");
 if(!(margin>0&&margin<1))throw new Error("INVALID_MARGIN");
 return totalCost/(1-margin);
}
export function roundCommercePrice(value:number,currency:MoneyCurrency){
 if(!Number.isFinite(value)||value<0)throw new Error("INVALID_PRICE");
 const step=currency==="CNY"?.1:.01;
 return Math.ceil(value/step-1e-9)*step;
}
export function ownConnectionPlatformPrice(currency:MoneyCurrency,totalPlatformCost:number,kind:"textTask"|"imageTask"|"videoSecond"|"websiteBuildIteration"){
 const floor=(policy.ownConnection.minimumServiceFees as any)[currency][kind] as number;
 return roundCommercePrice(Math.max(floor,priceForMargin(totalPlatformCost)),currency);
}
export function sasiVideoRetail(input:{currency:MoneyCurrency;providerCostPerSecond:number;platformCostPerSecond:number;resolution:"720p"|"1080p"}){
 const book=(policy.tools["sasi-video-generate"] as any)[input.currency];
 const total=Math.max(0,input.providerCostPerSecond)+Math.max(0,input.platformCostPerSecond);
 const floor=input.resolution==="1080p"?book["1080pPublicPerSecond"]:book["720pPublicPerSecond"];
 const providerCeiling=input.resolution==="1080p"?book["1080pProviderCostCeiling"]:book["720pProviderCostCeiling"];
 if(input.providerCostPerSecond<=providerCeiling&&total<=floor*(1-GROSS_MARGIN_FLOOR)){
  return floor;
 }
 return roundCommercePrice(Math.max(floor,priceForMargin(total)),input.currency);
}
export function realizedGrossMargin(price:number,cost:number){return price<=0?0:(price-cost)/price}
