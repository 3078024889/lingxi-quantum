export function assertPaymentInvariant(x:{quoteTool:string;requestTool:string;quoteQty:number;requestQty:number;quoteCurrency:string;requestCurrency:string;paid:boolean;quoteStatus:string}){
 if(x.quoteTool!==x.requestTool)throw new Error("PAYMENT_TOOL_MISMATCH");
 if(x.quoteQty!==x.requestQty)throw new Error("PAYMENT_QUANTITY_MISMATCH");
 if(x.quoteCurrency!==x.requestCurrency)throw new Error("PAYMENT_CURRENCY_MISMATCH");
 if(!x.paid||!["paid","settled","consumed"].includes(x.quoteStatus))throw new Error("PAYMENT_NOT_CONFIRMED");
 return true;
}
export function assertNoNegativeBalance(balance:number,reserved:number){if(balance<0||reserved<0||reserved>balance)throw new Error("BALANCE_INVARIANT_VIOLATION");return true}
