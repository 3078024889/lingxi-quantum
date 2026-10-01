export function moneyMinor(input:unknown):number|null{
 const text=typeof input==='number'?String(input):typeof input==='string'?input.trim():'';
 if(!/^\d+(?:\.\d{1,2})?$/.test(text))return null;
 const [whole,fraction='']=text.split('.');const value=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(value)&&value>0?value:null;
}
export const walletKind=(productId:string)=>productId.startsWith('ai-usd-balance-')?'ai_usd':productId.startsWith('sasi-usd-balance-')?'sasi_usd':productId.startsWith('ai-balance-')?'ai_cny':'sasi_cny';
