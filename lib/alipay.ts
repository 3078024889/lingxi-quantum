import { createSign, createVerify } from "node:crypto";

const DEFAULT_GATEWAY = "https://openapi.alipay.com/gateway.do";

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function asPem(value: string, label: "PRIVATE KEY" | "PUBLIC KEY"): string {
  if (value.includes("-----BEGIN")) return value.replace(/\\n/g, "\n");
  const body = value.replace(/\\s+/g, "");
  const rows = body.match(/.{1,64}/g)?.join("\n") ?? body;
  return `-----BEGIN ${label}-----\n${rows}\n-----END ${label}-----`;
}

function timestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
}

function canonical(params: Record<string, string>, excludeSignType = false): string {
  return Object.entries(params)
    .filter(([key, value]) => key !== "sign" && (!excludeSignType || key !== "sign_type") && value !== "")
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function alipayMissingVars(): string[] {
  return ["ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY"].filter((name) => !env(name));
}

export function alipayConfigured(): boolean {
  return alipayMissingVars().length === 0;
}

export function alipayEnabled(): boolean {
  return process.env.ALIPAY_ENABLED?.trim().toLowerCase() === "true" && alipayConfigured();
}

export function createAlipayPaymentUrl(input: {
  outTradeNo: string;
  amountRmb: number;
  subject: string;
  returnUrl: string;
  notifyUrl: string;
  mobile: boolean;
}): string {
  if (!alipayConfigured()) throw new Error(`Missing Alipay configuration: ${alipayMissingVars().join(", ")}`);
  if (!/^LX[A-Za-z0-9]{1,62}$/.test(input.outTradeNo)) throw new Error("Invalid Alipay out_trade_no");
  if (!Number.isFinite(input.amountRmb) || input.amountRmb <= 0) throw new Error("Invalid Alipay amount");

  const method = input.mobile ? "alipay.trade.wap.pay" : "alipay.trade.page.pay";
  const bizContent = JSON.stringify({
    out_trade_no: input.outTradeNo,
    total_amount: input.amountRmb.toFixed(2),
    subject: input.subject.slice(0, 128),
    product_code: input.mobile ? "QUICK_WAP_WAY" : "FAST_INSTANT_TRADE_PAY",
    timeout_express: "30m",
  });
  const params: Record<string, string> = {
    app_id: env("ALIPAY_APP_ID"),
    method,
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: timestamp(),
    version: "1.0",
    notify_url: input.notifyUrl,
    return_url: input.returnUrl,
    biz_content: bizContent,
  };
  const signer = createSign("RSA-SHA256");
  signer.update(canonical(params), "utf8");
  signer.end();
  params.sign = signer.sign(asPem(env("ALIPAY_PRIVATE_KEY"), "PRIVATE KEY"), "base64");

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, value));
  return `${env("ALIPAY_GATEWAY") || DEFAULT_GATEWAY}?${query.toString()}`;
}

export function verifyAlipayNotification(params: Record<string, string>): boolean {
  if (!env("ALIPAY_PUBLIC_KEY") || !params.sign) return false;
  try {
    const verifier = createVerify("RSA-SHA256");
    // 支付宝异步通知验签时 sign 和 sign_type 都不参与待验签内容拼接。
    verifier.update(canonical(params, true), "utf8");
    verifier.end();
    return verifier.verify(asPem(env("ALIPAY_PUBLIC_KEY"), "PUBLIC KEY"), params.sign, "base64");
  } catch (error) {
    console.error("[alipay] notification signature verification failed", error);
    return false;
  }
}

export function alipayAppId(): string {
  return env("ALIPAY_APP_ID");
}

export function alipaySellerId(): string {
  return env("ALIPAY_SELLER_ID");
}

export function alipaySiteUrl(): string {
  const raw = env("ALIPAY_SITE_URL") || env("NEXT_PUBLIC_SITE_URL") || "https://lingxifield.com";
  return raw.replace(/\/$/, "");
}


function extractAlipayResponseNode(raw: string, key: string): string {
  const marker = `"${key}":`;
  const markerIndex=raw.indexOf(marker);
  if(markerIndex<0)throw new Error("ALIPAY_QUERY_RESPONSE_NODE_MISSING");
  let i=markerIndex+marker.length;
  while(/\s/.test(raw[i]??""))i++;
  if(raw[i]!=="{")throw new Error("ALIPAY_QUERY_RESPONSE_OBJECT_MISSING");
  const start=i; let depth=0,inString=false,escaped=false;
  for(;i<raw.length;i++){
    const ch=raw[i];
    if(inString){if(escaped)escaped=false;else if(ch==="\\")escaped=true;else if(ch==='"')inString=false;continue}
    if(ch==='"'){inString=true;continue}
    if(ch==="{")depth++;
    if(ch==="}"){depth--;if(depth===0)return raw.slice(start,i+1)}
  }
  throw new Error("ALIPAY_QUERY_RESPONSE_TRUNCATED");
}
export async function queryAlipayTrade(input:{outTradeNo:string;expectedAmountRmb:number}):Promise<{paid:boolean;tradeStatus:string;tradeNo?:string}>{
 if(!alipayConfigured())throw new Error(`Missing Alipay configuration: ${alipayMissingVars().join(", ")}`);
 const params:Record<string,string>={app_id:env("ALIPAY_APP_ID"),method:"alipay.trade.query",format:"JSON",charset:"utf-8",sign_type:"RSA2",timestamp:timestamp(),version:"1.0",biz_content:JSON.stringify({out_trade_no:input.outTradeNo})};
 const signer=createSign("RSA-SHA256");signer.update(canonical(params),"utf8");signer.end();
 params.sign=signer.sign(asPem(env("ALIPAY_PRIVATE_KEY"),"PRIVATE KEY"),"base64");
 const response=await fetch(env("ALIPAY_GATEWAY")||DEFAULT_GATEWAY,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"},body:new URLSearchParams(params),cache:"no-store",signal:AbortSignal.timeout(20000)});
 const raw=await response.text();if(!response.ok)throw new Error(`ALIPAY_QUERY_HTTP_${response.status}`);
 const payload=JSON.parse(raw) as {alipay_trade_query_response?:Record<string,unknown>;sign?:string};
 const nodeRaw=extractAlipayResponseNode(raw,"alipay_trade_query_response");
 if(!payload.sign)throw new Error("ALIPAY_QUERY_SIGNATURE_MISSING");
 const verifier=createVerify("RSA-SHA256");verifier.update(nodeRaw,"utf8");verifier.end();
 if(!verifier.verify(asPem(env("ALIPAY_PUBLIC_KEY"),"PUBLIC KEY"),payload.sign,"base64"))throw new Error("ALIPAY_QUERY_SIGNATURE_INVALID");
 const data=payload.alipay_trade_query_response??{};
 if(String(data.code??"")!=="10000"){
   const sub=String(data.sub_code??data.code??"UNKNOWN");
   if(sub.includes("ACQ.TRADE_NOT_EXIST"))return{paid:false,tradeStatus:"NOT_EXIST"};
   throw new Error(`ALIPAY_QUERY_${sub.slice(0,100)}`);
 }
 if(String(data.out_trade_no??"")!==input.outTradeNo)throw new Error("ALIPAY_QUERY_ORDER_MISMATCH");
 const totalFen=Math.round(Number(data.total_amount)*100),expectedFen=Math.round(input.expectedAmountRmb*100),tradeStatus=String(data.trade_status??"");
 if(new Set(["TRADE_SUCCESS","TRADE_FINISHED"]).has(tradeStatus)&&totalFen!==expectedFen)throw new Error("ALIPAY_QUERY_AMOUNT_MISMATCH");
 return{paid:new Set(["TRADE_SUCCESS","TRADE_FINISHED"]).has(tradeStatus),tradeStatus,tradeNo:typeof data.trade_no==="string"?data.trade_no:undefined};
}
