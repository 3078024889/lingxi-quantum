import crypto from "node:crypto";
import { verifyWechatApiResponseSignature } from "@/lib/wechatpay";

const EXPECTED_MINI_APP_ID = "wxbf4ae90406e7e26b";
function env(name:string){return process.env[name]?.trim()||""}
function normalizePem(raw:string){
 const x=raw.trim().replace(/\\r\\n/g,"\n").replace(/\\n/g,"\n").replace(/\r/g,"\n").trim();
 if(!x.includes("-----BEGIN")||!x.includes("-----END"))throw new Error("WECHAT_PRIVATE_KEY_INVALID");
 return x;
}
function merchantSign(message:string){
 const signer=crypto.createSign("RSA-SHA256");signer.update(message,"utf8");
 return signer.sign(normalizePem(env("WECHAT_PRIVATE_KEY")),"base64");
}
function auth(method:string,url:string,body:string){
 const ts=Math.floor(Date.now()/1000).toString(),nonce=crypto.randomBytes(16).toString("hex"),u=new URL(url);
 const sig=merchantSign(`${method}\n${u.pathname}${u.search}\n${ts}\n${nonce}\n${body}\n`);
 return `WECHATPAY2-SHA256-RSA2048 mchid="${env("WECHAT_MCH_ID")}",nonce_str="${nonce}",timestamp="${ts}",serial_no="${env("WECHAT_CERT_SERIAL_NO")}",signature="${sig}"`;
}
export function miniJsapiPayMissingReasons():string[]{
 const missing:string[]=[];
 if(env("WECHAT_MINI_APP_ID")!==EXPECTED_MINI_APP_ID)missing.push("APP_ID_MISMATCH");
 if(!env("WECHAT_MINI_APP_SECRET"))missing.push("MINI_APP_SECRET_MISSING");
 if(!env("WECHAT_MCH_ID"))missing.push("MCH_ID_MISSING");
 if(!env("WECHAT_CERT_SERIAL_NO"))missing.push("CERT_SERIAL_MISSING");
 if(Buffer.byteLength(env("WECHAT_API_V3_KEY"),"utf8")!==32)missing.push("API_V3_KEY_INVALID");
 if(!env("WECHAT_PLATFORM_PUBLIC_KEY")||!env("WECHAT_PLATFORM_PUBLIC_KEY_ID"))missing.push("PLATFORM_PUBLIC_KEY_MISSING");
 try{crypto.createPrivateKey(normalizePem(env("WECHAT_PRIVATE_KEY")))}catch{missing.push("MERCHANT_PRIVATE_KEY_INVALID")}
 try{crypto.createPublicKey(normalizePem(env("WECHAT_PLATFORM_PUBLIC_KEY")))}catch{missing.push("PLATFORM_PUBLIC_KEY_INVALID")}
 return [...new Set(missing)];
}
export function miniJsapiPayConfigured(){return miniJsapiPayMissingReasons().length===0}
export function miniJsapiTopupsEnabled(){
 return env("NODE_ENV")==="production"&&env("WECHAT_MINI_JSAPI_TOPUPS_ENABLED")==="true"&&miniJsapiPayConfigured();
}
async function request(method:"GET"|"POST",url:string,body=""){
 const r=await fetch(url,{method,headers:{Authorization:auth(method,url,body),"Content-Type":"application/json",Accept:"application/json"},...(body?{body}:{}),cache:"no-store",signal:AbortSignal.timeout(20000)});
 const raw=await r.text();
 if(Buffer.byteLength(raw,"utf8")>1048576)throw new Error("MINI_WECHAT_RESPONSE_TOO_LARGE");
 if(!verifyWechatApiResponseSignature(r.headers,raw))throw new Error("MINI_WECHAT_RESPONSE_SIGNATURE_INVALID");
 let d:any={};try{d=raw?JSON.parse(raw):{}}catch{throw new Error("MINI_WECHAT_RESPONSE_JSON_INVALID")}
 if(!r.ok) {
  const code=typeof d?.code==="string"?d.code.replace(/[^A-Z0-9_]/gi,"").slice(0,48):"UNKNOWN";
  throw new Error(`MINI_WECHAT_API_${r.status}_${code}`);
 }
 return d;
}
export async function createMiniJsapiOrder(input:{outTradeNo:string;description:string;amountFen:number;notifyUrl:string;openid:string}){
 if(!miniJsapiPayConfigured())throw new Error("MINI_WECHAT_PAY_NOT_CONFIGURED");
 if(!/^LXM[A-F0-9]{29}$/.test(input.outTradeNo)||!Number.isSafeInteger(input.amountFen)||input.amountFen<1||input.amountFen>1000000||!input.openid)throw new Error("MINI_WECHAT_ORDER_INPUT_INVALID");
 const url="https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi";
 const body=JSON.stringify({appid:env("WECHAT_MINI_APP_ID"),mchid:env("WECHAT_MCH_ID"),description:input.description.slice(0,120),out_trade_no:input.outTradeNo,notify_url:input.notifyUrl,amount:{total:input.amountFen,currency:"CNY"},payer:{openid:input.openid}});
 const d=await request("POST",url,body);
 if(typeof d.prepay_id!=="string"||!d.prepay_id)throw new Error("MINI_WECHAT_PREPAY_ID_MISSING");
 return String(d.prepay_id);
}
export async function queryMiniJsapiOrder(outTradeNo:string){
 if(!miniJsapiPayConfigured())throw new Error("MINI_WECHAT_PAY_NOT_CONFIGURED");
 if(!/^LXM[A-F0-9]{29}$/.test(outTradeNo))throw new Error("MINI_WECHAT_ORDER_NUMBER_INVALID");
 const url=`https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}?mchid=${encodeURIComponent(env("WECHAT_MCH_ID"))}`;
 return request("GET",url);
}
export async function closeMiniJsapiOrder(outTradeNo:string){
 if(!miniJsapiPayConfigured())throw new Error("MINI_WECHAT_PAY_NOT_CONFIGURED");
 if(!/^LXM[A-F0-9]{29}$/.test(outTradeNo))throw new Error("MINI_WECHAT_ORDER_NUMBER_INVALID");
 const url=`https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}/close`;
 return request("POST",url,JSON.stringify({mchid:env("WECHAT_MCH_ID")}));
}
export function buildMiniRequestPayment(prepayId:string){
 if(!miniJsapiPayConfigured()||!prepayId||prepayId.length>128)throw new Error("MINI_WECHAT_PAY_NOT_CONFIGURED");
 const appId=env("WECHAT_MINI_APP_ID"),timeStamp=Math.floor(Date.now()/1000).toString(),nonceStr=crypto.randomBytes(16).toString("hex"),pkg=`prepay_id=${prepayId}`;
 const paySign=merchantSign(`${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`);
 return {timeStamp,nonceStr,package:pkg,signType:"RSA" as const,paySign};
}
