import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const mutationRoutes=[
  "app/api/pay/wechat/create/route.ts",
  "app/api/pay/alipay/create/route.ts",
  "app/api/tools/quote/route.ts",
  "app/api/tools/local-paid/job/route.ts",
  "app/api/sasi/projects/route.ts",
  "app/api/sasi/quote/route.ts",
  "app/api/sasi/jobs/route.ts",
  "app/api/sasi/learning/feedback/route.ts",
];
for(const file of mutationRoutes){
  assert(read(file).includes("isSameOriginMutation"),`${file} same-origin`);
}

const w=read("app/api/pay/wechat/create/route.ts");
assert(w.includes("contentLength>512*1024"),"WeChat 512KB semantic cap");
assert(w.includes("p_limit:120"),"WeChat 120/hour user guard");

const a=read("app/api/pay/alipay/create/route.ts");
assert(a.includes("contentLength>512*1024"),"Alipay 512KB semantic cap");
assert(a.includes("p_limit:120"),"Alipay 120/hour user guard");

const q=read("app/api/tools/quote/route.ts");
assert(q.includes("contentLength>1024*1024"),"Tool quote 1MB semantic cap");
assert(q.includes("JSON.stringify(metadata).length>512*1024"),"Tool quote metadata 512KB cap");
assert(q.includes("p_limit:1200"),"Tool quote 1200/hour user guard");

const wn=read("app/api/pay/wechat/notify/route.ts");
assert(wn.includes("verifyWechatNotifySignature"),"WeChat webhook signature verification");
assert(!wn.includes("isSameOriginMutation"),"WeChat webhook external-provider callable");

const an=read("app/api/pay/alipay/notify/route.ts");
assert(an.includes("verifyAlipayNotification"),"Alipay webhook signature verification");
assert(!an.includes("isSameOriginMutation"),"Alipay webhook external-provider callable");

const csp=read("next.config.js");
assert(csp.includes("Content-Security-Policy-Report-Only"),"CSP report-only retained");
assert(!csp.includes("'unsafe-eval'"),"unsafe-eval removed from report policy");
assert(csp.includes("script-src-attr 'none'"),"script-src-attr report policy");
assert(!csp.includes('{ key: "Content-Security-Policy",'),"CSP enforcement not switched prematurely");

console.log("V14.10.22 ACCEPTANCE=PASS");