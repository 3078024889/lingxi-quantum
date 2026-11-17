#!/usr/bin/env node
// Live merchant handshake. Read-only: NEVER creates a charge, an order, a refund or a DB row.
// Never prints tokens, key material, buyer data, merchant IDs or complete gateway responses.
import {createSign,createVerify,createPrivateKey,createPublicKey,randomBytes} from "node:crypto";
import {execFileSync} from "node:child_process";
import {lstatSync,readFileSync} from "node:fs";

const allowed=/^\/etc\/lingxifield\/[a-zA-Z0-9_.-]+\.env$/;
function systemdEnv(unit){
 if(!/^(?:lingxifield-cn-release-20261110-[a-f0-9]{12}-final|lingxifield-cn-candidate-[a-f0-9]{12})$/.test(unit))throw Error("CN_PAYMENT_UNIT_NOT_APPROVED");
 const data=execFileSync("systemctl",["show",unit,"-p","EnvironmentFiles","--value"],{encoding:"utf8"});
 const files=[...data.matchAll(/(\/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)/g)].map(m=>m[1]);
 if(files.length<2||files.length>16)throw Error("CN_PAYMENT_ENV_FILES_INVALID");
 if(new Set(files).size!==files.length)throw Error("CN_PAYMENT_ENV_FILES_DUPLICATE");
 const result={};
 for(const file of files){
  if(!allowed.test(file))throw Error("CN_PAYMENT_ENV_PATH_INVALID");
  const stat=lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==0||(stat.mode&0o777)!==0o600)
   throw Error("CN_PAYMENT_ENV_FILE_PERMISSIONS_INVALID");
  for(const raw of readFileSync(file,"utf8").split(/\r?\n/)){
   const line=raw.trim();
   if(!line||line.startsWith("#"))continue;
   const match=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
   if(!match)continue;
   let value=match[2].trim();
   if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
   result[match[1]]=value;
  }
 }
 // run_env_node launches this verifier with the approved EnvironmentFiles.
 // systemd decodes quoted escapes; raw file text can retain an extra slash
 // and make valid PEM material appear invalid. Only override validated keys.
 if(typeof process!=="undefined"&&process.env?.INVOCATION_ID){
  for(const key of Object.keys(result))if(typeof process.env[key]==="string")result[key]=process.env[key];
 }
 return result;
}
const pem=(value,label)=>{
 if(!value)throw Error("MERCHANT_KEY_MISSING");
 const cleaned=value.replace(/\\r\\n|\\n|\r\n/g,"\n").trim();
 if(cleaned.includes("-----BEGIN"))return cleaned;
 const b64=cleaned.replace(/\s/g,"");
 return "-----BEGIN "+label+"-----\n"+(b64.match(/.{1,64}/g)||[]).join("\n")+"\n-----END "+label+"-----";
};
const now=()=>{
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
 const p=t=>parts.find(x=>x.type===t)?.value||"00";
 return p("year")+"-"+p("month")+"-"+p("day")+" "+p("hour")+":"+p("minute")+":"+p("second");
};
function responseNode(raw,key){
 const idx=raw.indexOf('"'+key+'":');
 if(idx<0)throw Error("ALIPAY_RESPONSE_NODE_NOT_FOUND");
 let i=idx+key.length+3;
 while(/\s/.test(raw[i]||""))i++;
 const start=i;
 if(raw[i]!=="{")throw Error("ALIPAY_RESPONSE_NODE_INVALID");
 let depth=0,quoted=false,escaped=false;
 for(;i<raw.length;i++){
  const c=raw[i];
  if(quoted){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"'){quoted=true;continue;}
  if(c==="{")depth++;
  if(c==="}"&&--depth===0)return raw.slice(start,i+1);
 }
 throw Error("ALIPAY_RESPONSE_NODE_TRUNCATED");
}
async function alipay(cfg){
 const app=cfg.ALIPAY_APP_ID;
 if(!/^\d{12,32}$/.test(app||""))throw Error("ALIPAY_APP_ID_INVALID");
 if(cfg.ALIPAY_GATEWAY&&cfg.ALIPAY_GATEWAY!=="https://openapi.alipay.com/gateway.do")throw Error("ALIPAY_GATEWAY_NOT_LIVE");
 if(!cfg.ALIPAY_SELLER_ID)throw Error("ALIPAY_SELLER_ID_MISSING");
 if(cfg.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn")throw Error("ALIPAY_CALLBACK_DOMAIN_MISMATCH");
 if(cfg.ALIPAY_SITE_URL&&cfg.ALIPAY_SITE_URL!=="https://lingxifield.cn")throw Error("ALIPAY_CALLBACK_DOMAIN_MISMATCH");
 const privateKey=createPrivateKey(pem(cfg.ALIPAY_PRIVATE_KEY,"PRIVATE KEY"));
 const publicKey=createPublicKey(pem(cfg.ALIPAY_PUBLIC_KEY,"PUBLIC KEY"));
 if(privateKey.asymmetricKeyType!=="rsa"||publicKey.asymmetricKeyType!=="rsa")throw Error("ALIPAY_RSA_KEY_INVALID");
 const outTradeNo="LXVERIFY"+randomBytes(12).toString("hex");
 const params={
  app_id:app,method:"alipay.trade.query",format:"JSON",charset:"utf-8",sign_type:"RSA2",
  timestamp:now(),version:"1.0",biz_content:JSON.stringify({out_trade_no:outTradeNo})
 };
 const canonical=Object.entries(params).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+"="+v).join("&");
 const signer=createSign("RSA-SHA256");signer.update(canonical,"utf8");signer.end();
 params.sign=signer.sign(privateKey,"base64");
 const response=await fetch("https://openapi.alipay.com/gateway.do",{
  method:"POST",body:new URLSearchParams(params),
  headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"},
  redirect:"manual",signal:AbortSignal.timeout(16000)
 });
 if(response.status!==200)throw Error("ALIPAY_GATEWAY_HTTP_"+response.status);
 const raw=await response.text();
 if(raw.length>80000)throw Error("ALIPAY_RESPONSE_TOO_LARGE");
 const body=JSON.parse(raw);
 if(!body.sign)throw Error("ALIPAY_RESPONSE_SIGNATURE_MISSING");
 const verifier=createVerify("RSA-SHA256");
 verifier.update(responseNode(raw,"alipay_trade_query_response"),"utf8");verifier.end();
 if(!verifier.verify(publicKey,body.sign,"base64"))throw Error("ALIPAY_RESPONSE_SIGNATURE_INVALID");
 const result=body.alipay_trade_query_response||{};
 if(result.sub_code!=="ACQ.TRADE_NOT_EXIST")throw Error("ALIPAY_LIVE_APP_NOT_ACCEPTED_"+String(result.code||"UNKNOWN").replace(/[^A-Z0-9]/g,"").slice(0,12));
 return true;
}
async function wechat(cfg){
 const required=["WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"];
 if(required.some(k=>!cfg[k]))throw Error("WECHAT_LIVE_MERCHANT_CONFIG_MISSING");
 if(!/^\d{8,15}$/.test(cfg.WECHAT_MCH_ID)||!/^wx[a-z0-9]{10,}$/i.test(cfg.WECHAT_APP_ID))
  throw Error("WECHAT_MERCHANT_ID_INVALID");
 if(Buffer.byteLength(cfg.WECHAT_API_V3_KEY)!==32)throw Error("WECHAT_API_V3_KEY_INVALID");
 const key=createPrivateKey(pem(cfg.WECHAT_PRIVATE_KEY,"PRIVATE KEY"));
 const pub=createPublicKey(pem(cfg.WECHAT_PLATFORM_PUBLIC_KEY,"PUBLIC KEY"));
 if(key.asymmetricKeyType!=="rsa"||pub.asymmetricKeyType!=="rsa")throw Error("WECHAT_RSA_KEY_INVALID");
 const id="LXVERIFY"+randomBytes(12).toString("hex");
 const path="/v3/pay/transactions/out-trade-no/"+id+"?mchid="+encodeURIComponent(cfg.WECHAT_MCH_ID);
 const timestamp=Math.floor(Date.now()/1000).toString(),nonce=randomBytes(12).toString("hex");
 const data="GET\n"+path+"\n"+timestamp+"\n"+nonce+"\n\n";
 const signer=createSign("RSA-SHA256");signer.update(data,"utf8");signer.end();
 const signature=signer.sign(key,"base64");
 const authorization='WECHATPAY2-SHA256-RSA2048 mchid="'+cfg.WECHAT_MCH_ID+'",nonce_str="'+nonce+'",timestamp="'+timestamp+'",serial_no="'+cfg.WECHAT_CERT_SERIAL_NO+'",signature="'+signature+'"';
 const response=await fetch("https://api.mch.weixin.qq.com"+path,{method:"GET",headers:{Authorization:authorization,Accept:"application/json"},redirect:"manual",signal:AbortSignal.timeout(16000)});
 const raw=await response.text();
 if(Buffer.byteLength(raw,"utf8")>80000)throw Error("WECHAT_RESPONSE_TOO_LARGE");
 const responseTimestamp=response.headers.get("Wechatpay-Timestamp")||"";
 const responseNonce=response.headers.get("Wechatpay-Nonce")||"";
 const responseSignature=response.headers.get("Wechatpay-Signature")||"";
 const responseSerial=response.headers.get("Wechatpay-Serial")||"";
 if(responseSerial!==cfg.WECHAT_PLATFORM_PUBLIC_KEY_ID)throw Error("WECHAT_RESPONSE_SERIAL_MISMATCH");
 const responseEpoch=Number(responseTimestamp);
 if(!Number.isFinite(responseEpoch)||Math.abs(Math.floor(Date.now()/1000)-responseEpoch)>300)throw Error("WECHAT_RESPONSE_TIMESTAMP_INVALID");
 const responseVerifier=createVerify("RSA-SHA256");
 responseVerifier.update(responseTimestamp+"\n"+responseNonce+"\n"+raw+"\n","utf8");responseVerifier.end();
 if(!responseVerifier.verify(pub,responseSignature,"base64"))throw Error("WECHAT_RESPONSE_SIGNATURE_INVALID");
 const body=JSON.parse(raw);
 if(response.status!==404||body?.code!=="ORDER_NOT_EXIST")throw Error("WECHAT_LIVE_MERCHANT_NOT_READY_HTTP_"+response.status+"_CODE_"+String(body?.code||"UNKNOWN").replace(/[^A-Z0-9_]/g,"").slice(0,30));
 return true;
}
async function miniJsapi(cfg){
 const expectedAppId="wxbf4ae90406e7e26b";
 if(cfg.WECHAT_MINI_APP_ID!==expectedAppId)throw Error("MINI_APP_ID_MISMATCH");
 if(!cfg.WECHAT_MINI_APP_SECRET)throw Error("MINI_APP_SECRET_MISSING");
 const required=["WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"];
 if(required.some(k=>!cfg[k]))throw Error("MINI_JSAPI_MERCHANT_CONFIG_MISSING");
 if(Buffer.byteLength(cfg.WECHAT_API_V3_KEY)!==32)throw Error("MINI_JSAPI_API_V3_KEY_INVALID");
 const key=createPrivateKey(pem(cfg.WECHAT_PRIVATE_KEY,"PRIVATE KEY"));
 const pub=createPublicKey(pem(cfg.WECHAT_PLATFORM_PUBLIC_KEY,"PUBLIC KEY"));
 if(key.asymmetricKeyType!=="rsa"||pub.asymmetricKeyType!=="rsa")throw Error("MINI_JSAPI_RSA_KEY_INVALID");
 return true;
}
async function paypal(cfg){
 if(String(cfg.PAYPAL_ENV||"").trim().toLowerCase()!=="live")throw Error("PAYPAL_ENV_NOT_LIVE");
 const clientId=String(cfg.PAYPAL_CLIENT_ID||"").trim();
 const clientSecret=String(cfg.PAYPAL_CLIENT_SECRET||"").trim();
 const webhookId=String(cfg.PAYPAL_WEBHOOK_ID||"").trim();
 if(!clientId||!clientSecret||!webhookId)throw Error("PAYPAL_LIVE_CREDENTIALS_MISSING");
 const auth=Buffer.from(clientId+":"+clientSecret,"utf8").toString("base64");
 const tokenResponse=await fetch("https://api-m.paypal.com/v1/oauth2/token",{
  method:"POST",headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},
  body:"grant_type=client_credentials",cache:"no-store",signal:AbortSignal.timeout(15000)
 });
 const tokenBody=await tokenResponse.json();
 if(!tokenResponse.ok||typeof tokenBody?.access_token!=="string"||!tokenBody.access_token)
  throw Error("PAYPAL_LIVE_OAUTH_AUTHENTICATION_FAILED");
 const webhookResponse=await fetch("https://api-m.paypal.com/v1/notifications/webhooks/"+encodeURIComponent(webhookId),{
  method:"GET",headers:{Authorization:"Bearer "+tokenBody.access_token,Accept:"application/json"},
  cache:"no-store",signal:AbortSignal.timeout(15000)
 });
 const webhook=await webhookResponse.json();
 if(!webhookResponse.ok||String(webhook?.id||"")!==webhookId)throw Error("PAYPAL_WEBHOOK_ID_MISMATCH");
 const expectedUrl="https://lingxifield.cn/api/pay/paypal/webhook";
 if(String(webhook?.url||"").replace(/\/$/,"")!==expectedUrl)throw Error("PAYPAL_WEBHOOK_URL_MISMATCH");
 const required=[
  "CHECKOUT.ORDER.APPROVED","CHECKOUT.ORDER.COMPLETED","CHECKOUT.PAYMENT-APPROVAL.REVERSED",
  "PAYMENT.CAPTURE.PENDING","PAYMENT.CAPTURE.COMPLETED","PAYMENT.CAPTURE.DENIED","PAYMENT.CAPTURE.REFUNDED"
 ];
 const actual=new Set(Array.isArray(webhook?.event_types)?webhook.event_types.map(x=>String(x?.name||"")):[]);
 const missing=required.filter(x=>!actual.has(x));
 if(missing.length)throw Error("PAYPAL_WEBHOOK_EVENTS_MISSING_"+missing.length);
 console.log("CN_MERCHANT_PAYPAL_LIVE_OAUTH=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_ID=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_URL=PASS");
 console.log("CN_MERCHANT_PAYPAL_WEBHOOK_EVENTS=PASS");
 return true;
}
async function main(){
 const unit=process.argv[2]||"";
 const cfg=systemdEnv(unit);
 if(cfg.NEXT_PUBLIC_SITE_URL&&cfg.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn")
  throw Error("CN_PAYMENT_SITE_ORIGIN_MISMATCH");
 const out={alipay:false,wechat:false,paypal:false,miniJsapi:false};
 for(const [name,test] of [["alipay",alipay],["wechat",wechat],["paypal",paypal],["miniJsapi",miniJsapi]]){
  try{
   out[name]=await test(cfg);
   const label=name==="miniJsapi"?"MINI_JSAPI_CONFIG":name.toUpperCase()+"_SIGNED_LIVE_PROBE";
   console.log("CN_MERCHANT_"+label+"=PASS");
  }catch(e){
   const label=name==="miniJsapi"?"MINI_JSAPI_CONFIG":name.toUpperCase()+"_SIGNED_LIVE_PROBE";
   console.log("CN_MERCHANT_"+label+"=BLOCKED:"+String(e?.message||"ERROR").replace(/[^A-Z0-9_:]/gi,"").slice(0,100));
  }
 }
 console.log("CN_MERCHANT_PUBLIC_READY_JSON="+JSON.stringify(out));
 if(!out.alipay&&!out.wechat&&!out.paypal)process.exitCode=2;
}
await main().catch(error=>{
 console.error("CN_MERCHANT_CONFIG_BLOCKED:"+String(error?.message||"ERROR").replace(/[^A-Z0-9_:]/gi,"").slice(0,100));
 process.exitCode=2;
});
