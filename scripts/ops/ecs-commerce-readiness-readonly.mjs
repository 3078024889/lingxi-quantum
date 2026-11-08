#!/usr/bin/env node
// LINGXIFIELD -- read-only operator diagnostics. Never print credentials,
// emails, account data, tokens or private URLs. Run with Node 24 --env-file.
const env=process.env;
const has=k=>Boolean(env[k]?.trim());
const yn=x=>x===true;
const truth=k=>env[k]?.trim().toLowerCase()==="true";
const minLength=(k,n)=>Boolean(env[k]&&env[k].length>=n);
const supabaseHost=(()=>{
  const url=env.SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL;
  if(!url)return false;
  try{return new URL(url).hostname==="sxsgdpqojepgbbrxrzlq.supabase.co";}catch{return false;}
})();
const result={
  check:"LINGXIFIELD_LOCAL_READ_ONLY",
  projectMatchesExpected:supabaseHost,
  supabase:{
    preferredNewSecretPresent:Boolean(has("SUPABASE_SECRET_KEY") && env.SUPABASE_SECRET_KEY.startsWith("sb_secret_")),
    legacyKeyPresent:has("SUPABASE_SERVICE_ROLE_KEY"),
    keyActualApiAcceptance:"NOT_ATTESTED_HERE"
  },
  merchant:{
    wechatKeysPresent:["WECHAT_APP_ID","WECHAT_MCH_ID","WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","WECHAT_CERT_SERIAL_NO"].every(has),
    alipayKeysPresent:["ALIPAY_APP_ID","ALIPAY_PRIVATE_KEY","ALIPAY_PUBLIC_KEY"].every(has),
    alipayEnabled:truth("ALIPAY_ENABLED"),
    paypalKeysPresent:["PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"].every(has),
    paypalEnabled:truth("PAYPAL_ENABLED"),
    callbacksAndMoneyLedgerValidated:"NOT_ATTESTED_HERE"
  },
  toolpass:{
    clientGateEnabled:truth("NEXT_PUBLIC_TOOL_PASS_ENFORCED"),
    serverGateEnabled:truth("TOOL_PASS_BACKEND_READY"),
    commerceGateEnabled:truth("TOOL_PASS_COMMERCE_READY"),
    stableIpHashKeyPresent:minLength("LINGXIFIELD_PRIVACY_HASH_SECRET",32),
    fullFlagGate:truth("NEXT_PUBLIC_TOOL_PASS_ENFORCED")&&truth("TOOL_PASS_BACKEND_READY")&&truth("TOOL_PASS_COMMERCE_READY")&&minLength("LINGXIFIELD_PRIVACY_HASH_SECRET",32),
    financialAndBrowserAcceptance:"NOT_ATTESTED_HERE"
  }
};
console.log(JSON.stringify(result,null,2));
