export type LedgerState="quoted"|"reserved"|"executing"|"settled"|"released"|"failed";
export type Ledger={idempotencyKey:string;quoteId:string;userId:string;currency:"CNY"|"USD";amount:number;state:LedgerState;reservedAmount:number;settledAmount:number};
const next:Record<LedgerState,ReadonlySet<LedgerState>>={
 quoted:new Set(["reserved","failed"]),reserved:new Set(["executing","released","failed"]),executing:new Set(["settled","released","failed"]),
 settled:new Set(),released:new Set(),failed:new Set(["released"])
};
export function transition(x:Ledger,to:LedgerState){if(!next[x.state].has(to))throw new Error(`PAYMENT_STATE_INVALID:${x.state}->${to}`);return{...x,state:to}}
export function reserve(x:Ledger){if(x.amount<=0)throw new Error("RESERVE_AMOUNT_INVALID");return{...transition(x,"reserved"),reservedAmount:x.amount}}
export function settle(x:Ledger,actual:number){if(x.state!=="executing"||actual<0||actual>x.reservedAmount)throw new Error("SETTLE_INVALID");return{...transition(x,"settled"),settledAmount:actual}}
export function release(x:Ledger){if(!["reserved","executing","failed"].includes(x.state))throw new Error("RELEASE_INVALID");return{...x,state:"released" as const,reservedAmount:0}}
export function idempotencyKey(userId:string,quoteId:string,inputDigest:string){return`${userId}:${quoteId}:${inputDigest}`}
