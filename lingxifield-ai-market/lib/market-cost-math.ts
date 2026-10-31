/** Pure cost arithmetic: no default price claims, no exchange-rate assumptions. */
const valid=(x:number|null):x is number=>x!==null&&Number.isFinite(x)&&x>=0;
export function estimateVideoCredits(seconds:number|null,clips:number|null,creditsPerSecond:number|null):number|null{
 if(!valid(seconds)||!valid(clips)||!valid(creditsPerSecond))return null;
 const total=seconds*clips*creditsPerSecond;
 return Number.isFinite(total)&&total>=0?total:null;
}
export function estimateVideoCost(seconds:number|null,clips:number|null,creditsPerSecond:number|null,pricePerCredit:number|null):number|null{
 const credits=estimateVideoCredits(seconds,clips,creditsPerSecond);
 if(!valid(credits)||!valid(pricePerCredit))return null;
 const amount=credits*pricePerCredit;
 return Number.isFinite(amount)&&amount>=0?amount:null;
}
export function estimateApiUsageCost(inputTokens:number|null,outputTokens:number|null,inputPerMillion:number|null,outputPerMillion:number|null):number|null{
 if(!valid(inputTokens)||!valid(outputTokens)||!valid(inputPerMillion)||!valid(outputPerMillion))return null;
 const amount=(inputTokens/1000000)*inputPerMillion+(outputTokens/1000000)*outputPerMillion;
 return Number.isFinite(amount)&&amount>=0?amount:null;
}
