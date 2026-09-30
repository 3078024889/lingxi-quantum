import{createHash,createHmac,timingSafeEqual}from"node:crypto";
export type QuoteBinding={quoteId:string;userId:string;toolId:string;currency:"CNY"|"USD";quantity:number;unit:string;amount:number;inputDigest:string;expiresAt:string};
const stable=(x:unknown):string=>Array.isArray(x)?`[${x.map(stable).join(",")}]`:x&&typeof x==="object"?`{${Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+stable(v)).join(",")}}`:JSON.stringify(x);
export function inputDigest(input:unknown){return createHash("sha256").update(stable(input)).digest("hex")}
export function signQuote(q:QuoteBinding,secret:string){if(secret.length<32)throw new Error("QUOTE_SIGNING_SECRET_TOO_SHORT");return createHmac("sha256",secret).update(stable(q)).digest("hex")}
export function verifyQuote(q:QuoteBinding,signature:string,secret:string,expected:{userId:string;toolId:string;currency:"CNY"|"USD";quantity:number;input:unknown},now=Date.now()){
 if(q.userId!==expected.userId||q.toolId!==expected.toolId||q.currency!==expected.currency||q.quantity!==expected.quantity)throw new Error("QUOTE_BINDING_MISMATCH");
 if(q.inputDigest!==inputDigest(expected.input))throw new Error("QUOTE_INPUT_MISMATCH");
 if(new Date(q.expiresAt).getTime()<=now)throw new Error("QUOTE_EXPIRED");
 const a=Buffer.from(signQuote(q,secret),"hex"),b=Buffer.from(signature,"hex");if(a.length!==b.length||!timingSafeEqual(a,b))throw new Error("QUOTE_SIGNATURE_INVALID");return true;
}
