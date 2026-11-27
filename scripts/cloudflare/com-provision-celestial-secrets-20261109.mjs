#!/usr/bin/env node
// Provision encrypted merchant/admin/private-R2 secrets to the isolated COM candidate only.
// This script never changes routes, payment flags, orders, balances or database rows.
const scriptName="lingxifield-com-celestial-20261109";
const groups={
  paypal:["PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"],
  alipay:["ALIPAY_APP_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY"],
  wechat:["WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID"],
  r2:["R2_ENDPOINT","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET_SASI_ARTIFACTS"]
};
const adminNames=["SUPABASE_SECRET_KEY","SUPABASE_SERVICE_ROLE_KEY"];
const flags=[
  "PAYPAL_ENABLED","ALIPAY_ENABLED","WECHAT_ENABLED","TOOL_PASS_COMMERCE_READY",
  "SASI_MARKET_SALES_ENABLED","SASI_MARKET_UPLOADS_ENABLED","SASI_MARKET_PAYOUTS_ENABLED",
  "SASI_MARKET_DELIVERY_ENABLED","SASI_MARKETPLACE_COMMERCE_READY","SOFTWARE_COMMERCE_READY"
];
const {COM_PROVISION_MODE:mode="audit",COM_PROVISION_GROUP:group="all",
  CLOUDFLARE_ACCOUNT_ID:account,CLOUDFLARE_API_TOKEN:token}=process.env;
const present=value=>typeof value==="string"&&value.trim().length>0;
if(!["audit","provision"].includes(mode)||!["all","paypal","alipay","wechat","r2","supabase"].includes(group))
  throw Error("COM_PROVISION_INPUT_INVALID");
const selected=group==="all"?[...Object.keys(groups),"supabase"]:[group];
const keys=[...new Set(selected.flatMap(name=>name==="supabase"
  ?(present(process.env.SUPABASE_SECRET_KEY)?["SUPABASE_SECRET_KEY"]:["SUPABASE_SERVICE_ROLE_KEY"])
  :groups[name]))];
for(const name of selected){
  const requirements=name==="supabase"?adminNames:groups[name];
  const missing=name==="supabase"
    ?(adminNames.some(k=>present(process.env[k]))?[]:["SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"])
    :requirements.filter(k=>!present(process.env[k]));
  console.log("COM_SECRET_GROUP_"+name.toUpperCase()+"_READY="+(missing.length===0));
  if(missing.length)console.log("COM_SECRET_GROUP_"+name.toUpperCase()+"_MISSING_NAMES="+missing.join(","));
}
const missing=keys.filter(k=>!present(process.env[k]));
if(!present(account)||!present(token))throw Error("COM_CLOUDFLARE_API_ACCESS_MISSING");
const endpoint="https://api.cloudflare.com/client/v4/accounts/"+encodeURIComponent(account)+"/workers/scripts/"+scriptName;
const auth={Authorization:"Bearer "+token};
const settings=await fetch(endpoint+"/settings",{headers:auth,signal:AbortSignal.timeout(25000)});
let response=await settings.json();
if(!settings.ok||response.success!==true||!Array.isArray(response.result?.bindings))
  throw Error("COM_CANDIDATE_SETTINGS_READ_FAILED_HTTP_"+settings.status);
let bindings=response.result.bindings;
if(!bindings.some(b=>b.name==="LINGXI_COM_LEGACY_GATEWAY"&&b.type==="service"))
  throw Error("COM_CANDIDATE_LEGACY_SERVICE_BINDING_MISSING");
if(!bindings.some(b=>b.name==="LINGXI_PUBLIC_LARGE_R2"&&b.type==="r2_bucket"))
  throw Error("COM_CANDIDATE_PUBLIC_R2_BINDING_MISSING");
if(mode==="audit"){
  const installed=new Set(bindings.map(b=>b.name));
  for(const name of selected){
    const expected=name==="supabase"?adminNames:groups[name];
    const ready=name==="supabase"?expected.some(k=>installed.has(k)):expected.every(k=>installed.has(k));
    console.log("COM_CANDIDATE_SECRET_GROUP_"+name.toUpperCase()+"_INSTALLED="+ready);
  }
  console.log("COM_CANDIDATE_SECRET_READ_ONLY_AUDIT_PASS");
  process.exit(0);
}
if(missing.length)throw Error("COM_PROVISION_STOP_MISSING_GITHUB_SECRET_NAMES_"+missing.join(","));
// Fail closed: secret installation is allowed only while every commerce flag remains false.
const active=flags.filter(name=>bindings.find(b=>b.name===name)?.text==="true");
if(active.length)throw Error("COM_PROVISION_STOP_NONZERO_PAYMENT_FLAGS_"+active.join(","));
const installed=[];
for(const name of keys){
  const secret=process.env[name];
  if(!present(secret))throw Error("COM_PROVISION_MISSING_SECRET_"+name);
  const put=await fetch(endpoint+"/secrets",{
    method:"PUT",
    headers:{...auth,"content-type":"application/json"},
    body:JSON.stringify({name,text:secret,type:"secret_text"}),
    signal:AbortSignal.timeout(35000)
  });
  // Never print response bodies: provider errors can echo submitted metadata.
  if(!put.ok)throw Error("COM_SECRET_PROVISION_FAILED_"+name+"_HTTP_"+put.status);
  const result=await put.json();
  if(result.success!==true)throw Error("COM_SECRET_PROVISION_REJECTED_"+name);
  installed.push(name);
  console.log("COM_CANDIDATE_SECRET_INSTALLED_NAME="+name);
}
const after=await fetch(endpoint+"/settings",{headers:auth,signal:AbortSignal.timeout(25000)});
response=await after.json();
if(!after.ok||response.success!==true)throw Error("COM_PROVISION_POSTCHECK_UNAVAILABLE");
bindings=response.result?.bindings??[];
const presentAfter=new Set(bindings.map(b=>b.name));
if(installed.some(name=>!presentAfter.has(name)))throw Error("COM_PROVISION_BINDING_POSTCHECK_FAILED");
if(flags.some(name=>bindings.find(b=>b.name===name)?.text==="true"))
  throw Error("COM_PROVISION_POSTCHECK_PAYMENT_FLAG_CHANGED");
console.log("COM_CANDIDATE_SECRETS_ENCRYPTED_PROVISION_PASS_PAYMENT_FLAGS_STILL_OFF");
