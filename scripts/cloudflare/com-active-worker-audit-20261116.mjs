#!/usr/bin/env node
// Read-only Cloudflare routing and Worker-binding inventory. Never reads secret values or mutates Cloudflare.
const account=String(process.env.CLOUDFLARE_ACCOUNT_ID||"").trim();
const token=String(process.env.CLOUDFLARE_API_TOKEN||"").trim();
if(!account||!token)throw Error("CLOUDFLARE_AUDIT_CREDENTIALS_MISSING");
const root="https://api.cloudflare.com/client/v4";
const headers={Authorization:"Bearer "+token,Accept:"application/json"};
async function get(path){
 const r=await fetch(root+path,{headers,signal:AbortSignal.timeout(20000)});
 const j=await r.json().catch(()=>null);
 if(!r.ok||j?.success!==true)throw Error("CF_GET_FAILED_"+r.status);
 return j.result;
}
const yes=v=>v?"YES":"NO";
const state=b=>!b?"UNSET":b.type==="secret_text"?"SECRET_BOUND":b.text==="true"?"TRUE":b.text==="false"?"FALSE":"PRESENT";
const names=[
 "WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID",
 "ALIPAY_APP_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY","ALIPAY_SELLER_ID",
 "PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"
];
const flags=[
 "WECHAT_ENABLED","ALIPAY_ENABLED","PAYPAL_ENABLED","PAYPAL_ENV",
 "USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED","TOOL_PASS_COMMERCE_READY",
 "NEXT_PUBLIC_TOOL_PASS_ENFORCED","TOOL_PASS_BACKEND_READY","LINGXIFIELD_PRIVACY_HASH_SECRET"
];
const scripts=await get("/accounts/"+encodeURIComponent(account)+"/workers/scripts");
if(!Array.isArray(scripts))throw Error("CF_SCRIPT_LIST_INVALID");
console.log("COM_CLOUDFLARE_SCRIPT_COUNT="+scripts.length);
const scriptNames=scripts.map(x=>String(x.id||"")).filter(Boolean);
const candidates=new Set(scriptNames.filter(x=>/lingxi|com|global/i.test(x)));
const routedScripts=new Set();
try{
 const zones=await get("/zones?name=lingxifield.com&per_page=50");
 const zone=Array.isArray(zones)?zones.find(x=>x.name==="lingxifield.com"):null;
 if(!zone){console.log("COM_ZONE_LOOKUP=NOT_FOUND");}
 else{
  console.log("COM_ZONE_LOOKUP=PASS");
  const routes=await get("/zones/"+encodeURIComponent(zone.id)+"/workers/routes");
  const matches=(Array.isArray(routes)?routes:[]).filter(x=>/lingxifield\.com/.test(String(x.pattern||"")));
  console.log("COM_PUBLIC_WORKER_ROUTE_COUNT="+matches.length);
  for(const route of matches){
   console.log("COM_PUBLIC_WORKER_ROUTE pattern="+String(route.pattern||"")+" script="+String(route.script||"NONE"));
   if(route.script){candidates.add(String(route.script));routedScripts.add(String(route.script));}
  }
 }
}catch(e){console.log("COM_ZONE_ROUTE_AUDIT=BLOCKED:"+String(e?.message||"ERROR").replace(/[^A-Z0-9_]/gi,"_").slice(0,50));}
for(const name of [...candidates].sort()){
 try{
  const result=await get("/accounts/"+encodeURIComponent(account)+"/workers/scripts/"+encodeURIComponent(name)+"/settings");
  const bindings=Array.isArray(result?.bindings)?result.bindings:[];
  const bindingMap=new Map(bindings.map(x=>[x.name,x]));
  let secrets=[];
  try{
   const secretResult=await get("/accounts/"+encodeURIComponent(account)+"/workers/scripts/"+encodeURIComponent(name)+"/secrets");
   secrets=Array.isArray(secretResult)?secretResult:[];
  }catch{}
  const installed=new Set([...bindingMap.keys(),...secrets.map(x=>x.name)]);
  const has=keys=>keys.every(k=>installed.has(k));
  const serviceBindings=bindings.filter(x=>x.type==="service").map(x=>String(x.name||"")).filter(Boolean);
  console.log("COM_WORKER name="+name+
   " routed="+yes(routedScripts.has(name))+
   " legacyGateway="+yes(bindingMap.get("LINGXI_COM_LEGACY_GATEWAY")?.type==="service")+
   " publicR2="+yes(bindingMap.get("LINGXI_PUBLIC_LARGE_R2")?.type==="r2_bucket")+
   " serviceBindings="+(serviceBindings.join(",")||"NONE")+
   " wechatCredentials="+yes(has(names.slice(0,7)))+
   " alipayCredentials="+yes(has(names.slice(7,11)))+
   " paypalCredentials="+yes(has(names.slice(11,14))));
  for(const key of flags)console.log("COM_WORKER_FLAG name="+name+" key="+key+" state="+state(bindingMap.get(key)||secrets.find(x=>x.name===key)));
  if(routedScripts.has(name)){
   try{
    const codeResponse=await fetch(root+"/accounts/"+encodeURIComponent(account)+"/workers/scripts/"+encodeURIComponent(name)+"/content/v2",{headers,signal:AbortSignal.timeout(20000)});
    const code=await codeResponse.text();
    if(!codeResponse.ok)throw Error("CODE_HTTP_"+codeResponse.status);
    console.log("COM_WORKER_CODE name="+name+
     " providerEndpoint="+yes(code.includes("/api/pay/providers"))+
     " merchantReadiness="+yes(code.includes("edge-merchant-readiness")||code.includes("merchantAlipay"))+
     " paypalFlag="+yes(code.includes("PAYPAL_ENABLED"))+
     " wechatFlag="+yes(code.includes("WECHAT_ENABLED"))+
     " alipayFlag="+yes(code.includes("ALIPAY_ENABLED")));
   }catch(e){console.log("COM_WORKER_CODE name="+name+" state=BLOCKED");}
  }
 }catch(e){console.log("COM_WORKER_SETTINGS name="+name+" state=BLOCKED code="+String(e?.message||"ERROR").replace(/[^A-Z0-9_]/gi,"_").slice(0,50));}
}
console.log("COM_CLOUDFLARE_ROUTING_AUDIT_COMPLETE_READ_ONLY");
