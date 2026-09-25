import crypto from "node:crypto";
import { getPaypalAccessToken, queryPaypalOrder } from "@/lib/paypal";

export type RefundAttempt={
  state:"completed"|"pending"|"failed";
  refundId:string|null;
  providerStatus:string;
};

function timeoutSignal(ms:number){
  return AbortSignal.timeout(ms);
}

function env(name:string){
  return process.env[name]?.trim()??"";
}

export async function refundPaypal(input:{
  paypalOrderId:string;
  localOrderId:string;
  withdrawalId:string;
  orderAmountUsd:number;
  refundAmountUsd:number;
}):Promise<RefundAttempt>{
  const verified=await queryPaypalOrder(input.paypalOrderId,input.orderAmountUsd,input.localOrderId);
  const capture=verified.raw?.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId=String(capture?.id||"");
  if(!captureId)throw new Error("PAYPAL_CAPTURE_ID_MISSING");
  if(capture?.amount?.currency_code!=="USD")throw new Error("PAYPAL_CAPTURE_CURRENCY_MISMATCH");

  const token=await getPaypalAccessToken();
  const base=process.env.PAYPAL_ENV==="sandbox"?"https://api-m.sandbox.paypal.com":"https://api-m.paypal.com";
  const r=await fetch(`${base}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,{
    method:"POST",
    headers:{
      Authorization:`Bearer ${token}`,
      "Content-Type":"application/json",
      "PayPal-Request-Id":input.withdrawalId,
      Prefer:"return=representation",
    },
    body:JSON.stringify({
      amount:{currency_code:"USD",value:input.refundAmountUsd.toFixed(2)},
      custom_id:input.withdrawalId,
      note_to_payer:"LINGXIFIELD unused balance refund",
    }),
    cache:"no-store",
    signal:timeoutSignal(20000),
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`PAYPAL_REFUND_${r.status}:${String(data?.name||"ERROR")}`);
  const id=typeof data?.id==="string"?data.id:null;
  const status=String(data?.status||"UNKNOWN");
  if(status==="COMPLETED")return{state:"completed",refundId:id,providerStatus:status};
  if(status==="FAILED"||status==="CANCELLED")return{state:"failed",refundId:id,providerStatus:status};
  return{state:"pending",refundId:id,providerStatus:status};
}

function normalizePem(raw:string,label:string){
  const out=raw.trim().replace(/\\r\\n/g,"\n").replace(/\\n/g,"\n").replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();
  if(!out.includes("-----BEGIN")||!out.includes("-----END"))throw new Error(`${label}_INVALID`);
  return out;
}

function wechatSign(method:string,url:string,body:string){
  const mch=env("WECHAT_MCH_ID");
  const serial=env("WECHAT_CERT_SERIAL_NO");
  const key=env("WECHAT_PRIVATE_KEY");
  if(!mch||!serial||!key)throw new Error("WECHAT_REFUND_NOT_CONFIGURED");
  const timestamp=Math.floor(Date.now()/1000).toString();
  const nonce=crypto.randomBytes(16).toString("hex");
  const u=new URL(url);
  const message=`${method}\n${u.pathname}${u.search}\n${timestamp}\n${nonce}\n${body}\n`;
  const signer=crypto.createSign("RSA-SHA256");
  signer.update(message,"utf8");
  const signature=signer.sign(normalizePem(key,"WECHAT_PRIVATE_KEY"),"base64");
  return `WECHATPAY2-SHA256-RSA2048 mchid="${mch}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${serial}",signature="${signature}"`;
}

async function wechatRefundRequest(path:string,body:Record<string,unknown>){
  const url=`https://api.mch.weixin.qq.com${path}`;
  const raw=JSON.stringify(body);
  const r=await fetch(url,{
    method:"POST",
    headers:{
      Authorization:wechatSign("POST",url,raw),
      "Content-Type":"application/json",
      Accept:"application/json",
    },
    body:raw,
    cache:"no-store",
    signal:timeoutSignal(20000),
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`WECHAT_REFUND_${r.status}:${String(data?.code||"ERROR")}`);
  return data;
}

export async function refundWechat(input:{
  outTradeNo:string;
  withdrawalId:string;
  orderAmountFen:number;
  refundAmountFen:number;
}):Promise<RefundAttempt>{
  const outRefundNo=`LXW${input.withdrawalId.replace(/-/g,"")}`.slice(0,64);
  const data=await wechatRefundRequest("/v3/refund/domestic/refunds",{
    out_trade_no:input.outTradeNo,
    out_refund_no:outRefundNo,
    reason:"Unused LINGXIFIELD balance",
    amount:{refund:input.refundAmountFen,total:input.orderAmountFen,currency:"CNY"},
  });
  const status=String(data?.status||"UNKNOWN");
  const id=typeof data?.refund_id==="string"?data.refund_id:outRefundNo;
  if(Number(data?.amount?.refund)!==input.refundAmountFen)throw new Error("WECHAT_REFUND_AMOUNT_MISMATCH");
  if(status==="SUCCESS")return{state:"completed",refundId:id,providerStatus:status};
  if(status==="CLOSED")return{state:"failed",refundId:id,providerStatus:status};
  return{state:"pending",refundId:id,providerStatus:status};
}

function alipayPem(value:string,label:"PRIVATE KEY"|"PUBLIC KEY"){
  if(value.includes("-----BEGIN"))return value.replace(/\\n/g,"\n");
  const body=value.replace(/\\s+/g,"");
  const rows=body.match(/.{1,64}/g)?.join("\n")??body;
  return `-----BEGIN ${label}-----\n${rows}\n-----END ${label}-----`;
}

function alipayTimestamp(date=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23",
  }).formatToParts(date);
  const x=(type:Intl.DateTimeFormatPartTypes)=>parts.find(p=>p.type===type)?.value??"";
  return `${x("year")}-${x("month")}-${x("day")} ${x("hour")}:${x("minute")}:${x("second")}`;
}

function alipayCanonical(params:Record<string,string>){
  return Object.entries(params)
    .filter(([k,v])=>k!=="sign"&&v!=="")
    .sort(([a],[b])=>a<b?-1:a>b?1:0)
    .map(([k,v])=>`${k}=${v}`).join("&");
}

function extractAlipayNode(raw:string,key:string){
  const marker=`"${key}":`;
  const at=raw.indexOf(marker);
  if(at<0)throw new Error("ALIPAY_RESPONSE_NODE_MISSING");
  let i=at+marker.length;
  while(/\s/.test(raw[i]??""))i++;
  if(raw[i]!=="{")throw new Error("ALIPAY_RESPONSE_OBJECT_MISSING");
  const start=i;let depth=0,inString=false,escaped=false;
  for(;i<raw.length;i++){
    const ch=raw[i];
    if(inString){if(escaped)escaped=false;else if(ch==="\\")escaped=true;else if(ch==='"')inString=false;continue}
    if(ch==='"'){inString=true;continue}
    if(ch==="{")depth++;
    if(ch==="}"&&--depth===0)return raw.slice(start,i+1);
  }
  throw new Error("ALIPAY_RESPONSE_TRUNCATED");
}

async function alipayCall(method:string,biz:Record<string,unknown>){
  const appId=env("ALIPAY_APP_ID"),privateKey=env("ALIPAY_PRIVATE_KEY"),publicKey=env("ALIPAY_PUBLIC_KEY");
  if(!appId||!privateKey||!publicKey)throw new Error("ALIPAY_REFUND_NOT_CONFIGURED");
  const params:Record<string,string>={
    app_id:appId,method,format:"JSON",charset:"utf-8",sign_type:"RSA2",
    timestamp:alipayTimestamp(),version:"1.0",biz_content:JSON.stringify(biz),
  };
  const signer=crypto.createSign("RSA-SHA256");
  signer.update(alipayCanonical(params),"utf8");signer.end();
  params.sign=signer.sign(alipayPem(privateKey,"PRIVATE KEY"),"base64");
  const gateway=env("ALIPAY_GATEWAY")||"https://openapi.alipay.com/gateway.do";
  const response=await fetch(gateway,{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"},
    body:new URLSearchParams(params),
    cache:"no-store",
    signal:timeoutSignal(20000),
  });
  const raw=await response.text();
  if(!response.ok)throw new Error(`ALIPAY_REFUND_HTTP_${response.status}`);
  const payload=JSON.parse(raw) as Record<string,unknown>;
  const key=method.replace(/\./g,"_")+"_response";
  const nodeRaw=extractAlipayNode(raw,key);
  const signature=String(payload.sign||"");
  if(!signature)throw new Error("ALIPAY_REFUND_SIGNATURE_MISSING");
  const verifier=crypto.createVerify("RSA-SHA256");
  verifier.update(nodeRaw,"utf8");verifier.end();
  if(!verifier.verify(alipayPem(publicKey,"PUBLIC KEY"),signature,"base64"))throw new Error("ALIPAY_REFUND_SIGNATURE_INVALID");
  return (payload[key]??{}) as Record<string,unknown>;
}

export async function refundAlipay(input:{
  outTradeNo:string;
  withdrawalId:string;
  refundAmountRmb:number;
}):Promise<RefundAttempt>{
  const outRequestNo=`LXW${input.withdrawalId.replace(/-/g,"")}`.slice(0,64);
  const data=await alipayCall("alipay.trade.refund",{
    out_trade_no:input.outTradeNo,
    refund_amount:input.refundAmountRmb.toFixed(2),
    out_request_no:outRequestNo,
    refund_reason:"Unused LINGXIFIELD balance",
  });
  const code=String(data.code||"");
  if(code!=="10000")throw new Error(`ALIPAY_REFUND_${String(data.sub_code||code||"UNKNOWN")}`);
  const refundFee=Math.round(Number(data.refund_fee||0)*100);
  if(refundFee!==Math.round(input.refundAmountRmb*100))throw new Error("ALIPAY_REFUND_AMOUNT_MISMATCH");
  const id=typeof data.trade_no==="string"?String(data.trade_no):outRequestNo;
  return{state:"completed",refundId:id,providerStatus:String(data.fund_change||"Y")};
}

export async function executeProviderRefund(input:{
  provider:string;
  providerPaymentId:string;
  localOrderId:string;
  withdrawalId:string;
  currency:string;
  orderAmountMinor:number;
  refundAmountMinor:number;
}):Promise<RefundAttempt>{
  if(input.provider==="paypal"&&input.currency==="USD"){
    return refundPaypal({
      paypalOrderId:input.providerPaymentId,
      localOrderId:input.localOrderId,
      withdrawalId:input.withdrawalId,
      orderAmountUsd:input.orderAmountMinor/100,
      refundAmountUsd:input.refundAmountMinor/100,
    });
  }
  if(input.provider==="wechat"&&input.currency==="CNY"){
    return refundWechat({
      outTradeNo:input.providerPaymentId,
      withdrawalId:input.withdrawalId,
      orderAmountFen:input.orderAmountMinor,
      refundAmountFen:input.refundAmountMinor,
    });
  }
  if(input.provider==="alipay"&&input.currency==="CNY"){
    return refundAlipay({
      outTradeNo:input.providerPaymentId,
      withdrawalId:input.withdrawalId,
      refundAmountRmb:input.refundAmountMinor/100,
    });
  }
  return{state:"failed",refundId:null,providerStatus:"UNSUPPORTED_PROVIDER"};
}
