import type {ModelSnapshot} from "./openrouter-normalizer";
export type Workload={inputTokens:number;outputTokens:number;requests:number};
export function parseWorkload(raw:{input?:string;output?:string;requests?:string}):Workload{
 const parse=(value:string|undefined,fallback:number,max:number)=>{
  if(value===undefined||value==="")return fallback;
  if(!/^\d+$/.test(value))return fallback;
  const n=Number(value);
  return Number.isSafeInteger(n)&&n>=0&&n<=max?n:fallback;
 };
 return {inputTokens:parse(raw.input,1000,1000000),outputTokens:parse(raw.output,500,1000000),requests:parse(raw.requests,100,100000)};
}
export function estimateRoutingCost(model:ModelSnapshot,workload:Workload):number|null{
 if(model.promptUsdPerMillion===null||model.completionUsdPerMillion===null)return null;
 const result=(model.promptUsdPerMillion*workload.inputTokens+model.completionUsdPerMillion*workload.outputTokens)*workload.requests/1000000;
 return Number.isFinite(result)&&result>=0?result:null;
}
export function formatRoutingCost(cost:number|null):string{
 if(cost===null)return "Unknown";
 return "$"+cost.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:6});
}
export function compareModels(models:ModelSnapshot[],ids:string[],workload:Workload){
 const unique=[...new Set(ids.filter(Boolean))].slice(0,4);
 return unique.map(id=>{
  const model=models.find(m=>m.id===id);
  return model?{model,cost:estimateRoutingCost(model,workload)}:null;
 }).filter((row):row is {model:ModelSnapshot;cost:number|null}=>row!==null);
}
