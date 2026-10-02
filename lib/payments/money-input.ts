export function moneyMinor(input:unknown):number|null{
 const text=typeof input==='number'?String(input):typeof input==='string'?input.trim():'';
 if(!/^\d+(?:\.\d{1,2})?$/.test(text))return null;
 const [whole,fraction='']=text.split('.');const value=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(value)&&value>0?value:null;
}
export type WalletKind='sasi_cny'|'sasi_usd'|'ai_cny'|'ai_usd';
// ai_* is retained only for historical order/refund lookup. V49 exposes no active AI balance product.
export const walletKind=(productId:string):WalletKind=>productId.startsWith('sasi-usd-balance-')?'sasi_usd':productId.startsWith('sasi-balance-')?'sasi_cny':productId.startsWith('ai-usd-balance-')?'ai_usd':'ai_cny';
