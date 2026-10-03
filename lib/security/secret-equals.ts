import crypto from"crypto";

export function secureSecretEqual(expected:string|undefined|null,actual:string|undefined|null){
 const a=String(expected||"");
 const b=String(actual||"");
 if(a.length<24||b.length!==a.length)return false;
 const ab=Buffer.from(a,"utf8");
 const bb=Buffer.from(b,"utf8");
 if(ab.length!==bb.length)return false;
 return crypto.timingSafeEqual(ab,bb);
}
