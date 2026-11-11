export const MARKET_PLATFORM_FEE_BPS=1500 as const;
export const MARKET_SELLER_NET_BPS=8500 as const;
export const MARKET_SETTLEMENT_HOLD_DAYS=7 as const;
export const MARKET_PAYOUT_SUBMISSION_TARGET_MINUTES=15 as const;
/** Monetary calculations use integer minor units; no floats or FX. */
export function calculateMarketplaceSplit(grossMinor:number){
 if(!Number.isSafeInteger(grossMinor)||grossMinor<1||grossMinor>100_000_000_00)
   throw new Error("INVALID_MARKET_GROSS_MINOR");
 const platformFeeMinor=Math.floor((grossMinor*MARKET_PLATFORM_FEE_BPS+5000)/10000);
 const sellerNetMinor=grossMinor-platformFeeMinor;
 if(sellerNetMinor+platformFeeMinor!==grossMinor)throw new Error("MARKET_SPLIT_INVARIANT");
 return {grossMinor,platformFeeMinor,sellerNetMinor};
}
export function isMarketProductId(id:string){
 return /^sasi-market:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
export function marketProductUuid(id:string){return isMarketProductId(id)?id.slice("sasi-market:".length):null;}

/** Parse seller-entered payout amounts without floating-point rounding. */
export function parseMarketplacePayoutMinorUnits(value:unknown):number|null{
 if(typeof value!=="string")return null;
 const raw=value.trim();
 if(!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw))return null;
 const [whole,fraction=""]=raw.split(".");
 const minor=Number(whole)*100+Number((fraction+"00").slice(0,2));
 return Number.isSafeInteger(minor)?minor:null;
}
