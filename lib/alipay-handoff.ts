import {createHmac,timingSafeEqual} from "node:crypto";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function signature(value:string){
 const secret=process.env.ALIPAY_PRIVATE_KEY;
 if(!secret)throw new Error("ALIPAY_HANDOFF_UNAVAILABLE");
 return createHmac("sha256",secret).update("alipay-checkout-v1:"+value).digest().subarray(0,16);
}
// A scoped, expiring payment capability. It cannot read account data or mark paid.
export function createAlipayHandoff(orderId:string,now=Date.now()){
 if(!UUID.test(orderId))throw new Error("INVALID_ORDER_ID");
 const payload=orderId.replace(/-/g,"")+"."+Math.floor(now/1000+1800).toString(36);
 return payload+"."+signature(payload).toString("base64url");
}
export function readAlipayHandoff(ticket:string,now=Date.now()):string|null{
 if(!/^[0-9a-f]{32}\.[0-9a-z]{6,10}\.[A-Za-z0-9_-]{22}$/.test(ticket))return null;
 const [id,expiry,mac]=ticket.split(".");
 const expires=Number.parseInt(expiry,36),seconds=Math.floor(now/1000);
 if(expires<=seconds||expires>seconds+1800)return null;
 const actual=Buffer.from(mac,"base64url"),expected=signature(id+"."+expiry);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
 return [id.slice(0,8),id.slice(8,12),id.slice(12,16),id.slice(16,20),id.slice(20)].join("-");
}
