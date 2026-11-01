#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const access=read("lib/access.ts");
const legacy=read("lib/audit-access.ts");
const route=read("app/api/account/delete/route.ts");
const client=read("app/account/DeleteAccountButton.tsx");
const wechat=read("app/api/pay/wechat/notify/route.ts");
const csp=read("next.config.js");
const media=read("components/tools/VideoToolkitWorkbench.tsx");
const source=read("lib/tools/media/video-labels.ts");
const core=read("lib/tool-ui-i18n.ts");
const guard=(name,fn)=>{fn();console.log("PASS SECURITY_RELEASE_V1 "+name)};
guard("no request-time perpetual grant",()=>{
 assert.doesNotMatch(access,/ensureAuditAccountAccess|audit-access/);
 assert.doesNotMatch(legacy,/from\(["']unlocks["']\)|\.upsert\(|AUDIT_EMAIL|945462373/);
 assert.match(legacy,/return false/);
});
guard("CSP baseline enforced and strict report retained",()=>{
 assert.match(csp,/key:\s*"Content-Security-Policy"/);
 for(const d of ["base-uri 'self'","object-src 'none'","frame-ancestors 'self'","script-src-attr 'none'"]){
   assert.ok(csp.includes(d),d);
 }
 assert.match(csp,/Content-Security-Policy-Report-Only/);
});
guard("signed WeChat payment notification has 5-minute freshness window",()=>{
 assert.match(wechat,/isWechatNotifyTimestampFresh\(timestamp,\s*300\)/);
 assert.ok(wechat.indexOf("isWechatNotifyTimestampFresh(timestamp, 300)")<wechat.indexOf("verifyWechatNotifySignature({"));
});
guard("delete account requires recent verified sign in and explains recovery",()=>{
 assert.match(route,/isSameOriginMutation\(req\)/);
 assert.match(route,/sessionAge > 10 \* 60 \* 1000/);
 assert.match(route,/RECENT_SIGN_IN_REQUIRED/);
 assert.match(client,/RECENT_SIGN_IN_REQUIRED/);
});
guard("complete 9 locale labels for media controls",()=>{
 const m=source.match(/VIDEO_LABELS:Record<string,Record<LingxiLang,string>> = ([\s\S]*?);\n\nexport function/);
 assert.ok(m,"VIDEO_LABELS dictionary missing");
 const labels=JSON.parse(m[1]);
 const locales=["zh","en","ja","ko","fr","de","es","pt","ar"];
 assert.ok(Object.keys(labels).length>=18,"all original media control labels must remain present");
 for(const [label,values] of Object.entries(labels)){
   assert.deepEqual(Object.keys(values).sort(),locales.slice().sort(),"locale coverage: "+label);
   for(const locale of locales)assert.ok(values[locale].trim(),"empty translation: "+label+"/"+locale);
 }
 for(const name of ["压缩后体积没有变小，已保留原文件","已按指定尺寸或帧率导出，但文件体积比原文件大"])assert.ok(labels[name],"missing size disclosure: "+name);
 const seen=[...media.matchAll(/\bt\("([^"\n]+)","([^"\n]+)"\)/g)].map(x=>x[1]);
 assert.ok(seen.length>=24,"media label extraction insufficient");
 for(const item of seen){
   if(!labels[item]){
     assert.ok(core.includes(JSON.stringify(item)+":"),"missing core translation "+item);
   }else{
     assert.deepEqual(Object.keys(labels[item]).sort(),locales.slice().sort());
     for(const l of locales)assert.ok(labels[item][l].trim(),item+"/"+l);
   }
 }
 assert.match(media,/videoUiText\(lang,zh,en\)/);
});
console.log("SECURITY_RELEASE_V1_PASS");
