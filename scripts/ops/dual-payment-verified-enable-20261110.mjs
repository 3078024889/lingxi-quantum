#!/usr/bin/env node
// Live merchant handshake. Read-only: NEVER creates a charge, an order, a refund or a DB row.
// Never prints tokens, key material, buyer data, merchant IDs or complete gateway responses.
import {createSign,createVerify,createPrivateKey,createPublicKey,randomBytes} from "node:crypto";
import {execFileSync} from "node:child_process";
import {lstatSync,readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,unlinkSync} from "node:fs";
import {pathToFileURL} from "node:url";

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
const body=JSON.parse(raw);
 if(response.status!==404||body?.code!=="ORDER_NOT_EXIST")throw Error("WECHAT_LIVE_MERCHANT_NOT_READY_HTTP_"+response.status+"_CODE_"+String(body?.code||"UNKNOWN").replace(/[^A-Z0-9_]/g,"").slice(0,30));
 verifyWechatReply(response.headers,raw,cfg.WECHAT_PLATFORM_PUBLIC_KEY_ID,pub);
 return true;
}
export function verifyWechatReply(headers,raw,serial,key,nowSeconds=Math.floor(Date.now()/1000)){
 const timestamp=headers.get("wechatpay-timestamp")||"";
 const nonce=headers.get("wechatpay-nonce")||"";
 const signature=headers.get("wechatpay-signature")||"";
 if(headers.get("wechatpay-serial")!==serial)throw Error("WECHAT_RESPONSE_KEY_ID_MISMATCH");
 if(!/^\d{10}$/.test(timestamp)||Math.abs(nowSeconds-Number(timestamp))>300)
  throw Error("WECHAT_RESPONSE_TIMESTAMP_INVALID");
 if(!nonce||!signature||signature.startsWith("WECHATPAY/SIGNTEST/"))
  throw Error("WECHAT_RESPONSE_SIGNATURE_MISSING");
 const verifier=createVerify("RSA-SHA256");
 verifier.update(timestamp+"\n"+nonce+"\n"+raw+"\n");verifier.end();
 if(!verifier.verify(key,signature,"base64"))throw Error("WECHAT_RESPONSE_SIGNATURE_INVALID");
}
export function verifyPaypalWebhookConfig(webhook){
 let url;try{url=new URL(webhook.url)}catch{throw Error("PAYPAL_WEBHOOK_URL_INVALID")}
 if(url.protocol!=="https:"||!["lingxifield.cn","lingxifield.com"].includes(url.hostname)||
    url.pathname!=="/api/pay/paypal/webhook"||url.search||url.hash||url.port||url.username||url.password)
  throw Error("PAYPAL_WEBHOOK_URL_MISMATCH");
 const names=new Set((webhook.event_types||[]).map(x=>x.name));
 if(!names.has("*")&&(!names.has("PAYMENT.CAPTURE.COMPLETED")||!names.has("PAYMENT.CAPTURE.REFUNDED")))
  throw Error("PAYPAL_WEBHOOK_EVENTS_INCOMPLETE");
}
async function paypal(cfg){
 if((cfg.PAYPAL_ENV||"").trim()!=="live")throw Error("PAYPAL_ENV_NOT_EXPLICIT_LIVE");
 if(["PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"].some(k=>!cfg[k]?.trim()))
  throw Error("PAYPAL_CONFIG_MISSING");
 const response=await fetch("https://api-m.paypal.com/v1/oauth2/token",{
  method:"POST",headers:{Authorization:"Basic "+Buffer.from(cfg.PAYPAL_CLIENT_ID+":"+cfg.PAYPAL_CLIENT_SECRET).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},
  body:"grant_type=client_credentials",redirect:"error",signal:AbortSignal.timeout(18000)
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.access_token)throw Error("PAYPAL_LIVE_OAUTH_HTTP_"+response.status);
 const r=await fetch("https://api-m.paypal.com/v1/notifications/webhooks/"+encodeURIComponent(cfg.PAYPAL_WEBHOOK_ID),{
  headers:{Authorization:"Bearer "+data.access_token},redirect:"error",signal:AbortSignal.timeout(18000)
 });
 if(!r.ok)throw Error("PAYPAL_WEBHOOK_LOOKUP_HTTP_"+r.status);
 verifyPaypalWebhookConfig(await r.json());
 return true;
}
function runtimeConfig(unit){
 const pid=execFileSync("systemctl",["show",unit,"-p","MainPID","--value"],{encoding:"utf8"}).trim();
 if(!/^[1-9]\d*$/.test(pid))throw Error("PRODUCTION_SERVICE_NOT_RUNNING");
 const cfg=Object.fromEntries(readFileSync("/proc/"+pid+"/environ","utf8").split("\0").filter(x=>x.includes("=")).map(x=>{
  const i=x.indexOf("=");return [x.slice(0,i),x.slice(i+1)];
 }));
 if(cfg.PORT!=="3194")throw Error("PRODUCTION_PORT_CHANGED_STOP");
 return cfg;
}
async function localFetch(path,options={}){
 return fetch("http://127.0.0.1:3194"+path,{...options,redirect:"error",signal:AbortSignal.timeout(20000)});
}
async function rejectUnsigned(name){
 const paths={wechat:"/api/pay/wechat/notify",alipay:"/api/pay/alipay/notify",paypal:"/api/pay/paypal/webhook"};
 const r=await localFetch(paths[name],{method:"POST",headers:{"Content-Type":name==="alipay"?"application/x-www-form-urlencoded":"application/json"},body:name==="alipay"?"":"{}"});
 if(r.status!==401)throw Error(name.toUpperCase()+"_UNSIGNED_CALLBACK_NOT_REJECTED_401");
}
async function waitHealthy(){
 for(let i=0;i<30;i++){
  try{const r=await localFetch("/api/health");if(r.status===200&&(await r.json()).ok===true)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,2000));
 }
 throw Error("PRODUCTION_HEALTH_CHECK_FAILED");
}
async function activate(unit,ready,original){
 for(const name of Object.keys(ready))if(original[name.toUpperCase()+"_ENABLED"]?.trim().toLowerCase()==="true"&&!ready[name])
  throw Error("PREEXISTING_ENABLED_CHANNEL_FAILED_RECHECK");
 const base="/etc/lingxifield/dual-payment-verified-20261110.env";
 const dir="/etc/systemd/system/"+unit+".d";
 const conf=dir+"/zzz-dual-payment-verified-20261110.conf";
 const files=[base,conf];
 for(const file of files)if(existsSync(file)){
  const st=lstatSync(file);
  if(!st.isFile()||st.isSymbolicLink()||st.uid!==0||(st.mode&0o022)!==0)throw Error("PAYMENT_OVERRIDE_UNSAFE");
 }
 const backup=files.map(file=>existsSync(file)?readFileSync(file):null);
 const stamp=Date.now();
 files.forEach((file,i)=>{if(backup[i])copyFileSync(file,file+".backup-"+stamp)});
 const text=Object.entries(ready).map(([name,ok])=>name.toUpperCase()+"_ENABLED="+String(ok||original[name.toUpperCase()+"_ENABLED"]?.trim().toLowerCase()==="true")).join("\n")+"\n";
 try{
  mkdirSync(dir,{recursive:true,mode:0o755});
  writeFileSync(base,text,{mode:0o600});
  writeFileSync(conf,"[Service]\nEnvironmentFile="+base+"\n",{mode:0o644});
  execFileSync("systemctl",["daemon-reload"]);
  execFileSync("systemctl",["restart",unit]);
  await waitHealthy();
  const actual=runtimeConfig(unit);
  const providers=await(await localFetch("/api/pay/providers")).json();
  for(const [name,ok] of Object.entries(ready)){
   const expected=ok||original[name.toUpperCase()+"_ENABLED"]?.trim().toLowerCase()==="true";
   if((actual[name.toUpperCase()+"_ENABLED"]==="true")!==expected||providers[name]!==expected)
    throw Error("PAYMENT_FLAG_NOT_EFFECTIVE");
  }
  console.log("PAYMENT_ENABLED_STATUS="+JSON.stringify(Object.fromEntries(Object.keys(ready).map(k=>[k,providers[k]]))));
  console.log("PAYMENT_VERIFIED_CHANNELS_ACTIVATED_REAL_PURCHASE_STILL_REQUIRES_ACCEPTANCE");
 }catch{
  files.forEach((file,i)=>{if(backup[i])writeFileSync(file,backup[i]);else if(existsSync(file))unlinkSync(file)});
  execFileSync("systemctl",["daemon-reload"]);
  execFileSync("systemctl",["restart",unit]);
  await waitHealthy();
  throw Error("PAYMENT_ACTIVATION_REVERTED");
 }
}
async function main(){
 const unit="lingxifield-cn-release-20261108-9230bcba6a24.service";
 const mode=process.argv[2];
 if(!["--audit","--enable-verified"].includes(mode))throw Error("USE_AUDIT_OR_ENABLE_VERIFIED");
 if(process.getuid?.()!==0)throw Error("ROOT_REQUIRED");
 const cfg=runtimeConfig(unit);
 if(cfg.NEXT_PUBLIC_SITE_URL&&cfg.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn")throw Error("CN_PAYMENT_SITE_ORIGIN_MISMATCH");
 const health=await localFetch("/api/health");
 if(health.status!==200)throw Error("BASELINE_HEALTH_FAILED");
 const ready={alipay:false,wechat:false,paypal:false};
 await Promise.all(Object.entries({alipay,wechat,paypal}).map(async([name,probe])=>{
  try{await probe(cfg);await rejectUnsigned(name);ready[name]=true;console.log("MERCHANT_"+name.toUpperCase()+"_LIVE_HANDSHAKE_AND_UNSIGNED_REJECTION=PASS")}
  catch(e){
   const reason=/^[A-Z0-9_]{1,100}$/.test(e.message||"")?e.message:"MERCHANT_PROBE_FAILED";
   console.log("MERCHANT_"+name.toUpperCase()+"_BLOCKED="+reason);
  }
 }));
 console.log("VERIFIED_CHANNELS="+JSON.stringify(ready));
 console.log("TOOLPASS_GATES="+JSON.stringify(Object.fromEntries(["NEXT_PUBLIC_TOOL_PASS_ENFORCED","TOOL_PASS_BACKEND_READY","TOOL_PASS_COMMERCE_READY"].map(k=>[k,cfg[k]==="true"]))));
 if(!Object.values(ready).some(Boolean)){console.log("NO_VERIFIED_CHANNEL_NO_SERVICE_CHANGES");process.exitCode=2;return;}
 if(mode==="--enable-verified"){
  if(JSON.stringify(runtimeConfig(unit))!==JSON.stringify(cfg))throw Error("SERVICE_CONFIGURATION_CHANGED_DURING_PROBE");
  await activate(unit,ready,cfg);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 main().catch(e=>{console.log("PAYMENT_OPERATOR_STOP="+(/^[A-Z0-9_]{1,100}$/.test(e.message||"")?e.message:"OPERATION_FAILED"));process.exitCode=1});
}

