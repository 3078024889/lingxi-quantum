import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mainSiteReleaseNoticeState} from "../../lib/release/main-site-notice-gate.ts";

const SHA="a".repeat(40);
const valid={
 LINGXI_RELEASE_SOURCE_SHA:SHA,
 LINGXI_FULLSITE_ACCEPTED_SHA:SHA,
 LINGXI_SITE_NOTICE_ENABLED:"1",
 LINGXI_TOOLPASS_PAYMENT_ACCEPTED:"1",
 LINGXI_CN_AUTH_ACCEPTED:"1",
 LINGXI_COM_BACKEND_ACCEPTED:"1",
};
test("release modal stays OFF by default, including on partial Cloudflare previews",()=>{
 assert.equal(mainSiteReleaseNoticeState({}).enabled,false);
 assert.equal(mainSiteReleaseNoticeState({LINGXI_SITE_NOTICE_ENABLED:"1"}).enabled,false);
});
test("full payment, two-site, account and exact SHA attestations required",()=>{
 for(const key of Object.keys(valid)){
   const env={...valid};delete env[key];
   assert.equal(mainSiteReleaseNoticeState(env).enabled,false,"missing "+key);
 }
 assert.equal(mainSiteReleaseNoticeState({...valid,LINGXI_FULLSITE_ACCEPTED_SHA:"b".repeat(40)}).enabled,false);
 assert.equal(mainSiteReleaseNoticeState({...valid,LINGXI_RELEASE_SOURCE_SHA:"malformed"}).enabled,false);
});
test("verified exact release SHA can show a versioned main-domain notice",()=>{
 const state=mainSiteReleaseNoticeState(valid);
 assert.equal(state.enabled,true);
 assert.equal(state.version,"2026-11-dual-site-"+SHA.slice(0,12));
 assert.equal(state.site,"main");
});
test("this notice belongs ONLY to Lingxifield two main domains",()=>{
 const ui=readFileSync("components/MainSiteReleaseNotice.tsx","utf8");
 assert(ui.includes("https://lingxifield.com"));
 assert(ui.includes("https://lingxifield.cn"));
 assert(!ui.includes("globalsiai.com"));
 assert(!ui.includes("globalsiai.cn"));
 assert(ui.includes("全球双站架构升级完成"));
 assert(ui.includes("双域同行，全球连接"));
 assert(ui.includes("Celestial小仙女"));
 assert(ui.includes("mini"));
 assert(ui.includes("checkout"));
});
test("modal is wired into main layout and rejects unaudited flags",()=>{
 const layout=readFileSync("app/layout.tsx","utf8");
 const api=readFileSync("app/api/site-release-announcement/route.ts","utf8");
 assert(layout.includes("<MainSiteReleaseNotice />"));
 assert(api.includes("mainSiteReleaseNoticeState"));
 assert(api.includes("no-store"));
 assert(!api.includes('enabled:true'));
});

test("maintenance notice is a separately approved, deadline-limited state",()=>{
 const env={
  LINGXI_MAINTENANCE_NOTICE_ENABLED:"1",
  LINGXI_MAINTENANCE_NOTICE_APPROVED:"1",
 };
 const before=Date.parse("2026-11-07T12:00:00+08:00");
 const on=mainSiteReleaseNoticeState(env,before);
 assert.equal(on.enabled,true);
 assert.equal(on.phase,"maintenance");
 assert.equal(on.version,"2026-11-dual-site-maintenance");
 assert.equal(mainSiteReleaseNoticeState({...env,LINGXI_MAINTENANCE_NOTICE_APPROVED:"0"},before).enabled,false);
 assert.equal(mainSiteReleaseNoticeState(env,Date.parse("2026-11-09T00:00:00+08:00")).enabled,false);
});
test("an accepted release always takes precedence over an old maintenance schedule",()=>{
 const state=mainSiteReleaseNoticeState({
  ...valid,LINGXI_MAINTENANCE_NOTICE_ENABLED:"1",LINGXI_MAINTENANCE_NOTICE_APPROVED:"1",
 },Date.parse("2026-11-07T12:00:00+08:00"));
 assert.equal(state.enabled,true);
 assert.equal(state.phase,"complete");
});
test("the Chinese maintenance copy contains the requested target date without misrepresenting completion",()=>{
 const source=readFileSync("components/MainSiteReleaseNotice.tsx","utf8");
 assert(source.includes("预计2026年11月8日前恢复上线"));
 assert(source.includes("具体以最终功能验收结果为准"));
 assert(source.includes("全球双站架构升级公告"));
 assert(source.includes('state.phase==="complete"?<Link'));
});

test("approved Chinese maintenance copy includes the exact service scope and customer message",()=>{
 const source=readFileSync("components/MainSiteReleaseNotice.tsx","utf8");
 for(const phrase of [
   "灵犀场｜全球双站架构升级公告",
   "双域同行，全球连接。",
   "2026年11月6日起，灵犀场 LINGXIFIELD 开展服务器架构升级与全球访问线路优化",
   "预计2026年11月8日前恢复上线",
   "具体以最终功能验收结果为准",
   "本次升级重点围绕全球访问链路、服务器运行架构、数据安全防护及服务稳定性展开",
   "为全球 SIAI 排行榜、SASI 智能创作和百余项在线实用工具提供更坚实的基础设施。",
   "同时优化统一账户、工具包支付与使用体验，让文件处理、智能创作和全球智能平台比较更加简单、便捷。",
   "维护期间如出现短暂访问异常，感谢理解与陪伴。",
   "让智能触手可及，让创造突破边界。",
 ]) assert(source.includes(phrase),"MISSING_APPROVED_NOTICE_COPY: "+phrase);
 assert(source.includes("notice?.extra"),"APPROVED_EXTRA_COPY_NOT_RENDERED");
 assert(source.includes("notice?.thanks"),"APPROVED_CLOSING_COPY_NOT_RENDERED");
});
