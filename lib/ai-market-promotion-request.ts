import {safeMarketProductId} from "@/lib/ai-market-vendor-claims";
export type MarketPromotionPlan="sponsored"|"category"|"brand";
export type MarketPromotionCurrency="CNY"|"USD";
export type MarketPromotionProvider="alipay"|"wechat"|"paypal";
export const MARKET_PROMOTION_AMOUNTS_MINOR:Readonly<Record<MarketPromotionPlan,number>>={
 sponsored:4900,category:14900,brand:29900
};
export const MARKET_PROMOTION_PLANS:readonly MarketPromotionPlan[]=["sponsored","category","brand"];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseMarketPromotionRequest(input:unknown){
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const x=input as Record<string,unknown>;
 if(typeof x.claimId!=="string"||!uuid.test(x.claimId)||
    typeof x.requestKey!=="string"||!uuid.test(x.requestKey))return null;
 const productId=safeMarketProductId(x.productId);
 if(!productId)return null;
 if(x.planId!=="sponsored"&&x.planId!=="category"&&x.planId!=="brand")return null;
 if(x.currency!=="CNY"&&x.currency!=="USD")return null;
 if(x.provider!=="alipay"&&x.provider!=="wechat"&&x.provider!=="paypal")return null;
 if(x.currency==="USD"&&x.provider!=="paypal")return null;
 if(x.currency==="CNY"&&x.provider==="paypal")return null;
 return {claim_id:x.claimId,product_id:productId,plan_id:x.planId,
  currency:x.currency,provider:x.provider,idempotency_key:x.requestKey};
}
