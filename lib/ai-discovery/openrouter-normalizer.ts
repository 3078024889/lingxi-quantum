/** Normalize model catalog data without inventing unavailable values.
 * Raw third-party values remain source-attributed, never official vendor prices. */
export type ModelSnapshot={
 source:"openrouter";id:string;name:string;contextTokens:number|null;
 promptUsdPerMillion:number|null;completionUsdPerMillion:number|null;
 inputModalities:string[];outputModalities:string[];observedAt:string;
 sourceUrl:string;
};
const finite=(x:unknown):number|null=>{
 if(typeof x!=="string"&&typeof x!=="number")return null;
 if(typeof x==="string"&&!x.trim())return null;
 const n=Number(x);return Number.isFinite(n)&&n>=0?n:null;
};
const perMillion=(x:unknown):number|null=>{
 const n=finite(x);return n===null?null:n*1_000_000;
};
export function normalizeOpenRouterCatalog(raw:unknown,observedAt:string):ModelSnapshot[]{
 if(!Number.isFinite(Date.parse(observedAt)))throw new Error("Invalid observation date");
 if(!raw||typeof raw!=="object"||!("data" in raw)||!Array.isArray(raw.data))
  throw new Error("Invalid model catalog response");
 const rows:ModelSnapshot[]=[];
 for(const item of raw.data){
  if(!item||typeof item!=="object"||typeof item.id!=="string"||
     !/^[a-z0-9][a-z0-9._:/-]{1,180}$/i.test(item.id)||typeof item.name!=="string")continue;
  const p=item.pricing&&typeof item.pricing==="object"?item.pricing:{};
  const arch=item.architecture&&typeof item.architecture==="object"?item.architecture:{};
  rows.push({source:"openrouter",id:item.id,name:item.name.slice(0,200),
   contextTokens:finite(item.context_length),promptUsdPerMillion:perMillion(p.prompt),
   completionUsdPerMillion:perMillion(p.completion),
   inputModalities:Array.isArray(arch.input_modalities)?arch.input_modalities.filter((x:unknown)=>typeof x==="string").slice(0,20):[],
   outputModalities:Array.isArray(arch.output_modalities)?arch.output_modalities.filter((x:unknown)=>typeof x==="string").slice(0,20):[],
   observedAt,sourceUrl:"https://openrouter.ai/api/v1/models"});
 }
 return rows;
}
