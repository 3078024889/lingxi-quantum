/** Compare two reviewed model snapshots; never infer a price from missing values. */
export type PriceRow={id:string;pricing:{prompt:string|null;completion:string|null}|null};
export type PriceChange={id:string;field:"prompt"|"completion";before:number;after:number;changePct:number|null};
const amount=(value:unknown):number|null=>{
 if(typeof value!=="string"||!value.trim())return null;
 const n=Number(value);
 return Number.isFinite(n)&&n>=0?n:null;
};
export function compareModelPrices(previous:PriceRow[],current:PriceRow[]):PriceChange[]{
 const before=new Map(previous.map(row=>[row.id,row]));
 const changes:PriceChange[]=[];
 for(const row of current){
  const old=before.get(row.id);
  if(!old)continue;
  for(const field of ["prompt","completion"] as const){
   const a=amount(old.pricing?.[field]),b=amount(row.pricing?.[field]);
   if(a===null||b===null||a===b)continue;
   changes.push({id:row.id,field,before:a,after:b,changePct:a===0?null:((b-a)/a)*100});
  }
 }
 return changes.sort((a,b)=>a.id.localeCompare(b.id)||a.field.localeCompare(b.field));
}
