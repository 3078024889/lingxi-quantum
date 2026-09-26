import "server-only";
import type { NextRequest } from "next/server";

export type PricingMarket = "cny" | "usd";
const CNY_COUNTRIES = new Set(["CN"]);

function cleanCountry(value:string|null){
  const code=String(value||"").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code)?code:"";
}

export function requestCountry(req:Request){
  for(const value of [
    req.headers.get("x-vercel-ip-country"),
    req.headers.get("cf-ipcountry"),
    req.headers.get("cloudfront-viewer-country"),
    req.headers.get("x-country-code"),
  ]){
    const code=cleanCountry(value);
    if(code)return code;
  }
  return "";
}

export function detectPricingMarket(req:Request|NextRequest):PricingMarket{
  const country=requestCountry(req);
  if(country)return CNY_COUNTRIES.has(country)?"cny":"usd";

  const referer=req.headers.get("referer")||"";
  if(/[?&]mini=1(?:&|$)/.test(referer))return "cny";

  try{
    const host=new URL(req.url).hostname.toLowerCase();
    if(host==="lingxifield.cn"||host.endsWith(".lingxifield.cn"))return "cny";
  }catch{}

  const lang=(req.headers.get("accept-language")||"").toLowerCase();
  if(lang.startsWith("zh-cn"))return "cny";
  return "usd";
}

export function quoteMarket(metadata:unknown,req:Request|NextRequest):PricingMarket{
  if(metadata&&typeof metadata==="object"&&!Array.isArray(metadata)){
    const value=(metadata as Record<string,unknown>).pricing_market;
    if(value==="cny"||value==="usd")return value;
  }
  return detectPricingMarket(req);
}

export function providerAllowedForMarket(provider:string,market:PricingMarket){
  return market==="cny"
    ? provider==="wechat"||provider==="alipay"
    : provider==="paypal";
}

export function displayQuote(input:{market:PricingMarket;amountRmb:number;amountUsd:number}){
  return input.market==="cny"
    ? {display_currency:"CNY" as const,display_symbol:"¥",display_amount:Number(input.amountRmb.toFixed(2))}
    : {display_currency:"USD" as const,display_symbol:"$",display_amount:Number(input.amountUsd.toFixed(2))};
}
