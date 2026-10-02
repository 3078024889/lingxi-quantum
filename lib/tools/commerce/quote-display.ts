export function quoteDisplay(q:Record<string,unknown>,fallback='CNY'){
 const currency=String(q.display_currency||q.displayCurrency||q.currency||fallback)==='USD'?'USD':'CNY';
 const candidates=[q.display_amount,q.displayAmount,currency==='USD'?q.amount_usd:q.amount_rmb,currency==='USD'?q.amountUsd:q.amountRmb];
 for(const v of candidates){if(v===null||v===undefined||v==='')continue;const n=Number(v);if(Number.isFinite(n)&&n>=0)return {currency,amount:n,text:`${currency==='USD'?'$':'¥'}${n.toFixed(2)}`};}
 return {currency,amount:null,text:''};
}
