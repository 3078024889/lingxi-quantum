#!/usr/bin/env node
// CN 3189 SASI paid-production safety gate (read-only).
// No provider generation, payment callback, Supabase mutation, secret disclosure or service changes.
import fs from "node:fs";
import {parseEnv} from "node:util";

if(process.argv.length!==3||process.argv[2]!=="--read-only-3189"){
 console.log("CN_SASI_READINESS_REQUIRES_READ_ONLY_3189_FLAG");process.exit(2);
}
const conf="/etc/lingxifield/staging.env";
if(process.getuid?.()!==0||!fs.existsSync(conf)){
 console.log("CN_SASI_STAGING_ENV_NOT_ACCESSIBLE");process.exit(3);
}
const env=parseEnv(fs.readFileSync(conf,"utf8"));
const stage=env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn"&&
 env.NEXT_PUBLIC_SUPABASE_URL==="https://sxsgdpqojepgbbrxrzlq.supabase.co"&&
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"]
 .every(key=>env[key]==="false");
if(!stage){console.log("CN_SASI_PAYMENT_AND_SITE_ISOLATION_FAILED");process.exit(3)}
console.log("CN_SASI_SITE_AND_PAYMENT_ISOLATION=PASS");
const switches=["SASI_BILLING_ENABLED","SASI_JOBS_ENABLED","SASI_CONTENT_LABELING_ENABLED","SASI_REFUND_FLOW_TESTED"];
for(const key of switches){
 console.log("CN_"+key+"="+(env[key]==="true"?"TRUE_UNVERIFIED":"NOT_ENABLED"));
}
const configured=["ARK_API_KEY","SASI_SEEDANCE_VIDEO_MODEL","DASHSCOPE_API_KEY",
 "SASI_WAN_VIDEO_MODEL","XAI_API_KEY","SASI_XAI_VIDEO_MODEL",
 "OPENAI_API_KEY","SASI_OPENAI_VIDEO_MODEL","SASI_COMPUTE_WORKER_URL","SASI_COMPUTE_WORKER_SECRET"];
for(const key of configured){
 console.log("CN_SASI_CONFIG_"+key+"="+(env[key]&&env[key]!=="[SENSITIVE]"?"PRESENT":"MISSING"));
}
let ok=false;
try{
 const response=await fetch("http://127.0.0.1:3189/api/sasi/generation/readiness",{
  method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(14000)
 });
 console.log("CN_SASI_READINESS_HTTP="+response.status);
 if(response.status!==200){await response.body?.cancel();throw Error("NOT_HTTP_200")}
 const text=await response.text();
 if(text.length>65536)throw Error("READINESS_TOO_LARGE");
 const obj=JSON.parse(text);
 const ready=Array.isArray(obj?.worker?.capabilities?.capabilities)
  ?obj.worker.capabilities.capabilities.filter(x=>x&&x.ready===true):[];
 const native=ready.filter(x=>x.id!=="worker.echo");
 console.log("CN_SASI_KERNEL_REGISTERED="+Number.isInteger(obj?.kernel?.capabilityCount));
 console.log("CN_SASI_WORKER_STATUS="+(["reachable","unavailable","not-configured"].includes(obj?.worker?.status)?obj.worker.status:"unknown"));
 console.log("CN_SASI_WORKER_READY_CAPABILITIES="+ready.length);
 console.log("CN_SASI_WORKER_REAL_NATIVE_CAPABILITIES="+native.length);
 ok=Boolean(native.length>0);
}catch(e){console.log("CN_SASI_READINESS_CHECK=UNAVAILABLE_OR_INVALID")}
console.log("CN_SASI_GENERATION_CLOSURE="+(ok?"CAPABILITY_ADVERTISED_NOT_GENERATED":"NOT_VERIFIED"));
console.log("CN_SASI_PROVIDER_REAL_VIDEO_GENERATION=NOT_TESTED");
console.log("CN_SASI_PAYMENT_REFUND_AND_WALLET_RECONCILIATION=NOT_TESTED");
console.log("CN_SASI_PUBLIC_PROMOTION=NOT_ATTEMPTED");
console.log("CN_SASI_READ_ONLY_DIAGNOSTIC_COMPLETE");
