import type {ModelSnapshot} from "./openrouter-normalizer";
export type MarketSort="name"|"prompt-low"|"completion-low"|"context-high";
export function safeMarketSort(raw:string|undefined):MarketSort{
 return raw==="prompt-low"||raw==="completion-low"||raw==="context-high"?raw:"name";
}
export function filterMarketModels(models:ModelSnapshot[],query:string,sort:MarketSort,limit=100){
 const q=query.trim().toLocaleLowerCase().slice(0,100);
 const matching=models.filter(m=>!q||m.id.toLocaleLowerCase().includes(q)||m.name.toLocaleLowerCase().includes(q));
 const price=(n:number|null)=>n===null?Number.POSITIVE_INFINITY:n;
 const rows=[...matching].sort((a,b)=>{
  if(sort==="prompt-low")return price(a.promptUsdPerMillion)-price(b.promptUsdPerMillion)||a.id.localeCompare(b.id);
  if(sort==="completion-low")return price(a.completionUsdPerMillion)-price(b.completionUsdPerMillion)||a.id.localeCompare(b.id);
  if(sort==="context-high")return (b.contextTokens??-1)-(a.contextTokens??-1)||a.id.localeCompare(b.id);
  return a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
 });
 return {total:matching.length,rows:rows.slice(0,Math.max(1,Math.min(limit,200)))};
}
export function displayMarketPrice(value:number|null):string{
 return value===null?"Unknown":value.toLocaleString("en-US",{maximumFractionDigits:6,minimumFractionDigits:0});
}
