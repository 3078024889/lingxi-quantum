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
