#!/usr/bin/env node
// Live merchant handshake. Read-only: NEVER creates a charge, an order, a refund or a DB row.
// Never prints tokens, key material, buyer data, merchant IDs or complete gateway responses.
import {createSign,createVerify,createPrivateKey,createPublicKey,randomBytes} from "node:crypto";
import {execFileSync} from "node:child_process";
import {lstatSync,readFileSync} from "node:fs";

const allowed=/^\/etc\/lingxifield\/[a-zA-Z0-9_.-]+\.env$/;
function systemdEnv(unit){
 if(!/^lingxifield-cn-release-20261110-[a-f0-9]{12}$/.test(unit))throw Error("CN_PAYMENT_UNIT_NOT_APPROVED");
 const data=execFileSync("systemctl",["show",unit,"-p","EnvironmentFiles","--value"],{encoding:"utf8"});
 const files=[...data.matchAll(/(\/[^\s()]+\.env)\s+\(ignore_errors=(?:yes|no)\)/g)].map(m=>m[1]);
 if(files.length<2||files.length>8)throw Error("CN_PAYMENT_ENV_FILES_INVALID");
 const result={};
 for(const file of files){
  if(!allowed.test(file))throw Error("CN_PAYMENT_ENV_PATH_INVALID");
  const stat=lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==0||(stat.mode&0o022)!==0)
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
 const body=await response.json().catch(()=>null);
 if(response.status!==404||body?.code!=="ORDER_NOT_EXIST")throw Error("WECHAT_LIVE_MERCHANT_NOT_READY_HTTP_"+response.status+"_CODE_"+String(body?.code||"UNKNOWN").replace(/[^A-Z0-9_]/g,"").slice(0,30));
 return true;
}
async function main(){
 const unit=process.argv[2]||"";
 const cfg=systemdEnv(unit);
 if(cfg.NEXT_PUBLIC_SITE_URL&&cfg.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn")
  throw Error("CN_PAYMENT_SITE_ORIGIN_MISMATCH");
 const out={alipay:false,wechat:false};
 for(const [name,test] of [["alipay",alipay],["wechat",wechat]]){
  try{out[name]=await test(cfg);console.log("CN_MERCHANT_"+name.toUpperCase()+"_SIGNED_LIVE_PROBE=PASS");}
  catch(e){console.log("CN_MERCHANT_"+name.toUpperCase()+"_SIGNED_LIVE_PROBE=BLOCKED:"+String(e?.message||"ERROR").replace(/[^A-Z0-9_:]/gi,"").slice(0,100));}
 }
 console.log("CN_MERCHANT_PUBLIC_READY_JSON="+JSON.stringify(out));
 if(!out.alipay&&!out.wechat)process.exitCode=2;
}
await main();
