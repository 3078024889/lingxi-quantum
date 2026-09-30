export type Currency="CNY"|"USD";
export type DirectCost={provider:number;compute:number;storage:number;bandwidth:number;paymentFee:number;retryReserve:number;other:number};
export type CostBookEntry={toolId:string;currency:Currency;unit:string;direct:DirectCost;updatedAt:string};
export function directCost(x:DirectCost){const n=Object.values(x).reduce((a,b)=>a+b,0);if(!Number.isFinite(n)||n<0)throw new Error("COST_INVALID");return n}
export function minimumRetail(cost:number,minimumGrossMargin=.45){if(cost<0||minimumGrossMargin<0||minimumGrossMargin>=1)throw new Error("MARGIN_INPUT_INVALID");return Math.ceil(cost/(1-minimumGrossMargin)*100)/100}
export function grossMargin(price:number,cost:number){if(price<=0||cost<0)return-1;return(price-cost)/price}
export function assertIndependentBooks(entries:CostBookEntry[]){
 const seen=new Set<string>();for(const e of entries){const k=`${e.toolId}:${e.currency}`;if(seen.has(k))throw new Error("DUPLICATE_COST_BOOK_ENTRY");seen.add(k);directCost(e.direct)}
 return true;
}
export function enforceMargin(price:number,cost:number,min=.45){if(grossMargin(price,cost)+1e-9<min)throw new Error("MINIMUM_GROSS_MARGIN_VIOLATION");return true}
