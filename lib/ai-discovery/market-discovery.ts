/** Pure selection and filtering; never infer missing measurements. */
export type DiscoveryModel={id:string;name:string;contextTokens:number|null;promptUsdPerMillion:number|null;completionUsdPerMillion:number|null;inputModalities:string[];outputModalities:string[]};
export type MarketFilters={q?:string;provider?:string;input?:string;output?:string;maxInput?:number;minContext?:number};
export function marketProviders(models:DiscoveryModel[]):string[]{
 return [...new Set(models.map(m=>m.id.split("/")[0]).filter(Boolean))].sort();
}
export function filterDiscovery(models:DiscoveryModel[],f:MarketFilters):DiscoveryModel[]{
 const q=(f.q??"").trim().toLowerCase().slice(0,100);
 return models.filter(m=>{
  if(q&&!([m.name,m.id].some(s=>s.toLowerCase().includes(q))))return false;
  if(f.provider&&m.id.split("/")[0]!==f.provider)return false;
  if(f.input&&!m.inputModalities.includes(f.input))return false;
  if(f.output&&!m.outputModalities.includes(f.output))return false;
  if(f.maxInput!==undefined&&(m.promptUsdPerMillion===null||m.promptUsdPerMillion>f.maxInput))return false;
  if(f.minContext!==undefined&&(m.contextTokens===null||m.contextTokens<f.minContext))return false;
  return true;
 });
}
export function safeNumericFilter(raw:string|undefined,maximum:number):number|undefined{
 if(raw===undefined||raw.trim()==="")return undefined;
 if(!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw))return undefined;
 const n=Number(raw);return Number.isFinite(n)&&n<=maximum?n:undefined;
}
export function marketComparisonUrl(ids:string[]):string{
 const unique=[...new Set(ids.filter(id=>/^[a-z0-9][a-z0-9._:/-]{1,180}$/i.test(id)))].slice(0,4);
 return "/ai/market-preview/compare?"+new URLSearchParams({model:unique.join(",")}).toString();
}
