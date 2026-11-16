#!/usr/bin/env node
// Read-only Live merchant handshake. No order creation, capture, charge, refund or database access.
import {createSign,createVerify,createPrivateKey,createPublicKey,randomBytes} from "node:crypto";

const env=process.env;
const fail=(name,code)=>{console.log("COM_MERCHANT_"+name+"_SIGNED_LIVE_PROBE=FAIL:"+code);return false;};
const pass=name=>{console.log("COM_MERCHANT_"+name+"_SIGNED_LIVE_PROBE=PASS");return true;};
const pem=(value,label)=>{
 if(!value)throw Error("KEY_MISSING");
 const normalized=String(value).replace(/\\r\\n|\\n|\\r/g,"\n").trim();
 if(normalized.includes("-----BEGIN"))return normalized;
 const body=normalized.replace(/\\s+/g,"");
 return "-----BEGIN "+label+"-----\n"+(body.match(/.{1,64}/g)||[]).join("\n")+"\n-----END "+label+"-----";
};
const shanghaiTimestamp=()=>{
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
 const p=k=>parts.find(x=>x.type===k)?.value||"00";
 return p("year")+"-"+p("month")+"-"+p("day")+" "+p("hour")+":"+p("minute")+":"+p("second");
};
const responseNode=(raw,key)=>{
 const idx=raw.indexOf('"'+key+'":');
 if(idx<0)throw Error("ALIPAY_RESPONSE_NODE_MISSING");
 let i=idx+key.length+3;
 while(/\\s/.test(raw[i]||""))i++;
 const start=i;
 if(raw[i]!=="{")throw Error("ALIPAY_RESPONSE_NODE_INVALID");
 let depth=0,quoted=false,escaped=false;
 for(;i<raw.length;i++){
  const c=raw[i];
  if(quoted){if(escaped)escaped=false;else if(c==="\\\\")escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"'){quoted=true;continue;}
  if(c==="{")depth++;
  if(c==="}"&&--depth===0)return raw.slice(start,i+1);
 }
 throw Error("ALIPAY_RESPONSE_NODE_TRUNCATED");
};

async function probeAlipay(){
 try{
  if(env.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.com")throw Error("SITE_ORIGIN_MISMATCH");
  if(env.ALIPAY_SITE_URL&&env.ALIPAY_SITE_URL!=="https://lingxifield.com")throw Error("CALLBACK_ORIGIN_MISMATCH");
  if(env.ALIPAY_GATEWAY&&env.ALIPAY_GATEWAY!=="https://openapi.alipay.com/gateway.do")throw Error("GATEWAY_NOT_LIVE");
  const required=["ALIPAY_APP_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY","ALIPAY_SELLER_ID"];
  if(required.some(k=>!String(env[k]||"").trim()))throw Error("MERCHANT_CONFIG_MISSING");
  const privateKey=createPrivateKey(pem(env.ALIPAY_PRIVATE_KEY,"PRIVATE KEY"));
  const publicKey=createPublicKey(pem(env.ALIPAY_PUBLIC_KEY,"PUBLIC KEY"));
  if(privateKey.asymmetricKeyType!=="rsa"||publicKey.asymmetricKeyType!=="rsa"||
     (privateKey.asymmetricKeyDetails?.modulusLength||0)<2048||
     (publicKey.asymmetricKeyDetails?.modulusLength||0)<2048)throw Error("RSA_KEY_INVALID");
  const outTradeNo="LXVERIFY"+randomBytes(12).toString("hex");
  const params={app_id:env.ALIPAY_APP_ID,method:"alipay.trade.query",format:"JSON",charset:"utf-8",sign_type:"RSA2",timestamp:shanghaiTimestamp(),version:"1.0",biz_content:JSON.stringify({out_trade_no:outTradeNo})};
  const canonical=Object.entries(params).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+"="+v).join("&");
  const signer=createSign("RSA-SHA256");signer.update(canonical,"utf8");signer.end();
  params.sign=signer.sign(privateKey,"base64");
  const response=await fetch(env.ALIPAY_GATEWAY||"https://openapi.alipay.com/gateway.do",{
   method:"POST",body:new URLSearchParams(params),
   headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"},
   redirect:"manual",signal:AbortSignal.timeout(18000)
  });
  if(response.status!==200)throw Error("GATEWAY_HTTP_"+response.status);
  const raw=await response.text();
  if(Buffer.byteLength(raw,"utf8")>80000)throw Error("RESPONSE_TOO_LARGE");
  const body=JSON.parse(raw);
  if(!body.sign)throw Error("RESPONSE_SIGNATURE_MISSING");
  const verifier=createVerify("RSA-SHA256");verifier.update(responseNode(raw,"alipay_trade_query_response"),"utf8");verifier.end();
  if(!verifier.verify(publicKey,body.sign,"base64"))throw Error("RESPONSE_SIGNATURE_INVALID");
  if(body.alipay_trade_query_response?.sub_code!=="ACQ.TRADE_NOT_EXIST")throw Error("LIVE_APP_QUERY_NOT_ACCEPTED");
  return pass("ALIPAY");
 }catch(e){return fail("ALIPAY",String(e?.message||"ERROR").replace(/[^A-Z0-9_]/gi,"_").slice(0,60));}
}

async function probeWechat(){
 try{
  if(env.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.com")throw Error("SITE_ORIGIN_MISMATCH");
  const required=["WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"];
  if(required.some(k=>!String(env[k]||"").trim()))throw Error("MERCHANT_CONFIG_MISSING");
  if(!/^\\d{8,15}$/.test(env.WECHAT_MCH_ID)||!/^wx[a-z0-9]{10,}$/i.test(env.WECHAT_APP_ID))throw Error("MERCHANT_ID_INVALID");
  if(Buffer.byteLength(env.WECHAT_API_V3_KEY,"utf8")!==32)throw Error("API_V3_KEY_INVALID");
  const privateKey=createPrivateKey(pem(env.WECHAT_PRIVATE_KEY,"PRIVATE KEY"));
  const publicKey=createPublicKey(pem(env.WECHAT_PLATFORM_PUBLIC_KEY,"PUBLIC KEY"));
  if(privateKey.asymmetricKeyType!=="rsa"||publicKey.asymmetricKeyType!=="rsa")throw Error("RSA_KEY_INVALID");
  const outTradeNo="LXVERIFY"+randomBytes(12).toString("hex");
  const path="/v3/pay/transactions/out-trade-no/"+outTradeNo+"?mchid="+encodeURIComponent(env.WECHAT_MCH_ID);
  const timestamp=Math.floor(Date.now()/1000).toString(),nonce=randomBytes(12).toString("hex");
  const canonical="GET\n"+path+"\n"+timestamp+"\n"+nonce+"\n\n";
  const signer=createSign("RSA-SHA256");signer.update(canonical,"utf8");signer.end();
  const signature=signer.sign(privateKey,"base64");
  const authorization='WECHATPAY2-SHA256-RSA2048 mchid="'+env.WECHAT_MCH_ID+'",nonce_str="'+nonce+'",timestamp="'+timestamp+'",serial_no="'+env.WECHAT_CERT_SERIAL_NO+'",signature="'+signature+'"';
  const response=await fetch("https://api.mch.weixin.qq.com"+path,{method:"GET",headers:{Authorization:authorization,Accept:"application/json"},redirect:"manual",signal:AbortSignal.timeout(18000)});
  const raw=await response.text();
  if(Buffer.byteLength(raw,"utf8")>80000)throw Error("RESPONSE_TOO_LARGE");
  const responseTimestamp=response.headers.get("Wechatpay-Timestamp")||"";
  const responseNonce=response.headers.get("Wechatpay-Nonce")||"";
  const responseSignature=response.headers.get("Wechatpay-Signature")||"";
  const responseSerial=response.headers.get("Wechatpay-Serial")||"";
  if(responseSerial!==env.WECHAT_PLATFORM_PUBLIC_KEY_ID)throw Error("RESPONSE_SERIAL_MISMATCH");
  const epoch=Number(responseTimestamp);
  if(!Number.isFinite(epoch)||Math.abs(Math.floor(Date.now()/1000)-epoch)>300)throw Error("RESPONSE_TIMESTAMP_INVALID");
  const verifier=createVerify("RSA-SHA256");verifier.update(responseTimestamp+"\n"+responseNonce+"\n"+raw+"\n","utf8");verifier.end();
  if(!verifier.verify(publicKey,responseSignature,"base64"))throw Error("RESPONSE_SIGNATURE_INVALID");
  const body=JSON.parse(raw);
  if(response.status!==404||body?.code!=="ORDER_NOT_EXIST")throw Error("LIVE_MERCHANT_QUERY_NOT_ACCEPTED");
  return pass("WECHAT");
 }catch(e){return fail("WECHAT",String(e?.message||"ERROR").replace(/[^A-Z0-9_]/gi,"_").slice(0,60));}
}

async function probePaypal(){
 try{
  if(String(env.PAYPAL_ENV||"").trim().toLowerCase()!=="live")throw Error("ENVIRONMENT_NOT_LIVE");
  const clientId=String(env.PAYPAL_CLIENT_ID||"").trim();
  const clientSecret=String(env.PAYPAL_CLIENT_SECRET||"").trim();
  const webhookId=String(env.PAYPAL_WEBHOOK_ID||"").trim();
  if(!clientId||!clientSecret||!webhookId)throw Error("MERCHANT_CONFIG_MISSING");
  const auth=Buffer.from(clientId+":"+clientSecret,"utf8").toString("base64");
  const tokenResponse=await fetch("https://api-m.paypal.com/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials",cache:"no-store",signal:AbortSignal.timeout(18000)});
  const tokenBody=await tokenResponse.json();
  if(!tokenResponse.ok||typeof tokenBody?.access_token!=="string"||!tokenBody.access_token)throw Error("LIVE_OAUTH_FAILED");
  const response=await fetch("https://api-m.paypal.com/v1/notifications/webhooks/"+encodeURIComponent(webhookId),{method:"GET",headers:{Authorization:"Bearer "+tokenBody.access_token,Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(18000)});
  const webhook=await response.json();
  if(!response.ok||String(webhook?.id||"")!==webhookId)throw Error("WEBHOOK_ID_MISMATCH");
  if(String(webhook?.url||"").replace(/\\/$/,"")!=="https://lingxifield.com/api/pay/paypal/webhook")throw Error("WEBHOOK_URL_MISMATCH");
  const required=["CHECKOUT.ORDER.APPROVED","CHECKOUT.ORDER.COMPLETED","CHECKOUT.PAYMENT-APPROVAL.REVERSED","PAYMENT.CAPTURE.PENDING","PAYMENT.CAPTURE.COMPLETED","PAYMENT.CAPTURE.DENIED","PAYMENT.CAPTURE.REFUNDED"];
  const actual=new Set(Array.isArray(webhook?.event_types)?webhook.event_types.map(x=>String(x?.name||"")):[]);
  if(required.some(x=>!actual.has(x)))throw Error("WEBHOOK_EVENT_SUBSCRIPTIONS_INCOMPLETE");
  return pass("PAYPAL");
 }catch(e){return fail("PAYPAL",String(e?.message||"ERROR").replace(/[^A-Z0-9_]/gi,"_").slice(0,60));}
}

const results=await Promise.all([probeAlipay(),probeWechat(),probePaypal()]);
console.log("COM_LIVE_MERCHANT_AUDIT_SUMMARY="+(results.every(Boolean)?"PASS":"BLOCKED"));
console.log("NO_ORDER_CREATED_NO_CHARGE_NO_CAPTURE_NO_REFUND_NO_DATABASE_ACCESS");
if(results.some(x=>!x))process.exitCode=1;
