import crypto from "node:crypto";

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
export function miniJsapiPayConfigured(){
 return Boolean(env("WECHAT_MINI_APP_ID")&&env("WECHAT_MCH_ID")&&env("WECHAT_PRIVATE_KEY")&&env("WECHAT_CERT_SERIAL_NO")&&env("WECHAT_API_V3_KEY"));
}
export async function createMiniJsapiOrder(input:{outTradeNo:string;description:string;amountFen:number;notifyUrl:string;openid:string}){
 if(!miniJsapiPayConfigured())throw new Error("MINI_WECHAT_PAY_NOT_CONFIGURED");
 const url="https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi";
 const body=JSON.stringify({appid:env("WECHAT_MINI_APP_ID"),mchid:env("WECHAT_MCH_ID"),description:input.description,out_trade_no:input.outTradeNo,notify_url:input.notifyUrl,amount:{total:input.amountFen,currency:"CNY"},payer:{openid:input.openid}});
 const r=await fetch(url,{method:"POST",headers:{Authorization:auth("POST",url,body),"Content-Type":"application/json",Accept:"application/json"},body,cache:"no-store",signal:AbortSignal.timeout(20000)});
 const d=await r.json().catch(()=>({}));if(!r.ok||!d.prepay_id)throw new Error(`MINI_WECHAT_PREPAY_${r.status}`);
 return String(d.prepay_id);
}
export function buildMiniRequestPayment(prepayId:string){
 const appId=env("WECHAT_MINI_APP_ID"),timeStamp=Math.floor(Date.now()/1000).toString(),nonceStr=crypto.randomBytes(16).toString("hex"),pkg=`prepay_id=${prepayId}`;
 const paySign=merchantSign(`${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`);
 return {timeStamp,nonceStr,package:pkg,signType:"RSA" as const,paySign};
}
