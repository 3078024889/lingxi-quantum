/** Verified, same-source time series. Missing observations are never interpolated. */
export type PricePoint={observedAt:string;prompt:number|null;completion:number|null};
export type PriceSeries={id:string;source:string;points:PricePoint[]};
export function validatePriceSeries(value:unknown):PriceSeries|null{
 if(!value||typeof value!=="object")return null;
 const v=value as Partial<PriceSeries>;
 if(typeof v.id!=="string"||!/^[a-z0-9][a-z0-9._:/-]{1,180}$/i.test(v.id)||v.source!=="openrouter"||!Array.isArray(v.points)||v.points.length<2||v.points.length>366)return null;
 let last=-Infinity;
 const points:PricePoint[]=[];
 for(const p of v.points){
  if(!p||typeof p.observedAt!=="string")return null;
  const date=Date.parse(p.observedAt);
  if(!Number.isFinite(date)||date<=last||date>Date.now()+300000)return null;
  last=date;
  for(const x of [p.prompt,p.completion])if(x!==null&&(typeof x!=="number"||!Number.isFinite(x)||x<0))return null;
  points.push({observedAt:new Date(date).toISOString(),prompt:p.prompt,completion:p.completion});
 }
 return {id:v.id,source:v.source,points};
}
export function priceTrend(series:PriceSeries,field:"prompt"|"completion"){
 const available=series.points.filter(p=>p[field]!==null);
 if(available.length<2)return {status:"insufficient" as const,first:null,last:null,percent:null};
 const first=available[0][field]!,last=available[available.length-1][field]!;
 return {status:"comparable" as const,first,last,percent:first===0?null:Number(((last-first)/first*100).toFixed(4))};
}
